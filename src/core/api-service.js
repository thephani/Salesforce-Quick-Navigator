class SalesforceApiService {
	static API_VERSION = 'v62.0'; // Centralized API version

	constructor(session) {
		this.session = session;
		this.baseUrl = `https://${this.session.hostname}/services/data/${SalesforceApiService.API_VERSION}`;
	}

	// Helper method to create headers
	_createHeaders() {
		return new Headers({
			'Authorization': `Bearer ${this.session.key}`,
			'Content-Type': 'application/json',
		});
	}

	// Generic API Call Handler with pagination support
	async invokeREST(endpoint, method = 'GET', body = null) {
		const config = {
			method,
			headers: this._createHeaders(),
			body: body ? JSON.stringify(body) : null,
		};

		const url = `${this.baseUrl}/${endpoint}`;
		console.log(`[API] ${method} request to: ${url}`);

		try {
			const response = await fetch(url, config);
			let data = await response.json();

			if (!response.ok) {
				throw new Error(`API call failed: ${response.status} ${response.statusText} - ${data?.message || 'Unknown error'}`);
			}

			// Handle pagination if nextRecordsUrl exists
			if (data.nextRecordsUrl) {
				const nextEndpoint = data.nextRecordsUrl.startsWith('/')
					? data.nextRecordsUrl.replace('/services/data/' + SalesforceApiService.API_VERSION + '/', '')
					: data.nextRecordsUrl.replace(this.baseUrl + '/', '');
				const nextData = await this.invokeREST(nextEndpoint, method, body);

				// Combine records
				if (Array.isArray(data.records) && Array.isArray(nextData.records)) {
					data.records = data.records.concat(nextData.records);
					data.done = nextData.done;
					data.nextRecordsUrl = nextData.nextRecordsUrl;
				} else {
					// For non-query endpoints that might have pagination
					if (Array.isArray(data)) {
						data = data.concat(nextData);
					} else {
						// For object responses, merge them (may need customization based on endpoint)
						data = {...data, ...nextData};
					}
				}
			}

			return data;
		} catch (error) {
			console.error('[Salesforce API Error]:', error);
			throw error;
		}
	}

	// Query API Call with automatic pagination handling
	async invokeTOOLING(query) {
		const initialResponse = await this.invokeREST(`tooling/query/?q=${encodeURIComponent(query)}`, 'GET');

		// Tooling API returns records in a different structure than REST API
		if (initialResponse.records && initialResponse.records.length > 0 && initialResponse.done === false) {
			let combinedRecords = [...initialResponse.records];
			let nextRecordsUrl = initialResponse.nextRecordsUrl;

			while (nextRecordsUrl) {
				const nextResponse = await this.invokeREST(nextRecordsUrl.replace(this.baseUrl + '/', ''), 'GET');
				combinedRecords = combinedRecords.concat(nextResponse.records);
				nextRecordsUrl = nextResponse.nextRecordsUrl;
			}

			return {
				...initialResponse,
				records: combinedRecords,
				done: true,
				nextRecordsUrl: null,
			};
		}

		return initialResponse;
	}
}

export default SalesforceApiService;
