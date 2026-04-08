import DomainValidator from '../utils/domain-validator.js';

class SessionManager {
	static async retrieveSession() {
		return new Promise((resolve, reject) => {
			chrome.tabs.query({active: true, currentWindow: true}, tabs => {
				if (tabs.length === 0) {
					reject(new Error('No active tab found'));
					return;
				}

				const activeTab = tabs[0];
				let url;
				try {
					url = new URL(activeTab.url);
				} catch (error) {
					reject(new Error('Unable to read the active tab URL'));
					return;
				}

				if (!DomainValidator.isSalesforceHostname(url.hostname)) {
					reject(new Error('Not on a Salesforce page'));
					return;
				}

				chrome.runtime.sendMessage(
					{
						message: 'getSession',
						sfHost: url.hostname,
					},
					session => {
						if (chrome.runtime.lastError) {
							reject(chrome.runtime.lastError);
							return;
						}

						if (!session) {
							reject(new Error('No valid session found'));
							return;
						}

						resolve(session);
					}
				);
			});
		});
	}
}

export default SessionManager;
