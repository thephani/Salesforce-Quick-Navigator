class DomainValidator {
	static SALESFORCE_DOMAINS = ['salesforce.com', 'salesforce-setup.com', 'my.salesforce.com', 'lightning.force.com'];

	static hasValidSuffix(hostname, domain) {
		return hostname === domain || hostname.endsWith(`.${domain}`);
	}

	static isSalesforceHostname(hostname) {
		if (!hostname) {
			return false;
		}

		return this.SALESFORCE_DOMAINS.some(domain => this.hasValidSuffix(hostname, domain));
	}

	static getApiHostname(hostname) {
		if (!this.isSalesforceHostname(hostname)) {
			return null;
		}

		return hostname
			.replace('.lightning.force.com', '.my.salesforce.com')
			.replace('.my.salesforce-setup.com', '.my.salesforce.com')
			.replace('.salesforce-setup.com', '.my.salesforce.com');
	}

	static getCookieDomainCandidates(hostname) {
		if (!this.isSalesforceHostname(hostname)) {
			return [];
		}

		const apiHostname = this.getApiHostname(hostname);
		const candidates = new Set([
			apiHostname,
			hostname,
			hostname.replace('.lightning.force.com', '.salesforce.com'),
			hostname.replace('.my.salesforce-setup.com', '.salesforce.com'),
			hostname.replace('.salesforce-setup.com', '.salesforce.com'),
		]);

		return [...candidates].filter(candidate => this.isSalesforceHostname(candidate));
	}

	/**
	 * Check if the current tab is on a Salesforce domain
	 * @returns {Promise<boolean>}
	 */
	static async isOnSalesforceDomain() {
		return new Promise(resolve => {
			chrome.tabs.query({active: true, currentWindow: true}, tabs => {
				if (tabs.length === 0) {
					resolve(false);
					return;
				}

				const currentUrl = tabs[0].url;
				try {
					const url = new URL(currentUrl);
					resolve(this.isSalesforceHostname(url.hostname));
				} catch (error) {
					resolve(false);
				}
			});
		});
	}
}

export default DomainValidator;
