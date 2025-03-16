class DomainValidator {
	static SALESFORCE_DOMAINS = ['salesforce.com', 'salesforce-setup.com', 'my.salesforce.com', 'lightning.force.com'];

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
					const hostname = url.hostname;

					const isSalesforceDomain = this.SALESFORCE_DOMAINS.some(domain => hostname.includes(domain));

					resolve(isSalesforceDomain);
				} catch (error) {
					resolve(false);
				}
			});
		});
	}
}

export default DomainValidator;
