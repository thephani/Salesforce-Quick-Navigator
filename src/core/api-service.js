class SalesforceApiService {
	constructor(session) {
		this.session = session;
	}

	async makeApiCall(endpoint, method = 'GET', body = null) {
		const headers = new Headers({
			'Authorization': `Bearer ${this.session.key}`,
			'Content-Type': 'application/json',
		});

		const config = {
			method: method,
			headers: headers,
		};

		if (body) {
			config.body = JSON.stringify(body);
		}

		try {
			console.log(`[API] Calling ${this.session.hostname}`);
			const response = await fetch(`https://${this.session.hostname}/services/data/v60.0${endpoint}`, config);

			if (!response.ok) {
				throw new Error('API call failed');
			}

			return await response.json();
		} catch (error) {
			console.error('API Error:', error);
			throw error;
		}
	}
}

export default SalesforceApiService;
