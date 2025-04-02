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

	// Generic API Call Handler
	async makeApiCall(endpoint, method = 'GET', body = null) {
		const config = {
			method,
			headers: this._createHeaders(),
			body: body ? JSON.stringify(body) : null,
		};

		const url = `${this.baseUrl}/${endpoint}`;
		console.log(`[API] ${method} request to: ${url}`);

		try {
			const response = await fetch(url, config);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(`API call failed: ${response.status} ${response.statusText} - ${data?.message || 'Unknown error'}`);
			}

			return data;
		} catch (error) {
			console.error('[Salesforce API Error]:', error);
			throw error;
		}
	}

	// Query API Call
	async makeQueryCall(query) {
		return this.makeApiCall(`tooling/query/?q=${encodeURIComponent(query)}`, 'GET');
	}
}

export default SalesforceApiService;