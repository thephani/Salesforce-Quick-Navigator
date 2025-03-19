// Comprehensive Background Script for Salesforce Quick Nav

// Domain Validation Utility
const VALID_DOMAINS = ['.salesforce.com', '.salesforce-setup.com', '.my.salesforce.com', '.lightning.force.com'];

function isValidSalesforceDomain(hostname) {
	return VALID_DOMAINS.some(domain => hostname.includes(domain));
}

// Session Management
class BackgroundSessionManager {
	// Cookie-based Session Retrieval
	static retrieveSessionCookie(sfHost) {
		return new Promise((resolve, reject) => {
			// Try multiple domain variations
			const cookieDomains = [
				sfHost,
				sfHost.replace('.lightning.force.com', '.salesforce.com'),
				sfHost.replace('.my.salesforce-setup.com', '.salesforce.com'),
				sfHost.replace('.salesforce-setup.com', '.salesforce.com'),
			];

			const tryNextDomain = domains => {
				if (domains.length === 0) {
					reject(new Error('No valid session found'));
					return;
				}

				const currentDomain = domains[0].replace('.lightning.force.com', '.my.salesforce.com');
				chrome.cookies.get({url: 'https://' + currentDomain, name: 'sid'}, sessionCookie => {
					if (sessionCookie) {
						resolve({
							key: sessionCookie.value,
							hostname: currentDomain,
							fullHostname: sfHost,
							expires: sessionCookie.expirationDate,
						});
					} else {
						// Try next domain
						tryNextDomain(domains.slice(1));
					}
				});
			};

			tryNextDomain(cookieDomains);
		});
	}

	// Secure Session Storage
	static storeSession(session) {
		return new Promise(resolve => {
			chrome.storage.session.set({salesforceSession: session}, () => resolve(true));
		});
	}

	// Retrieve Stored Session
	static getStoredSession() {
		return new Promise(resolve => {
			chrome.storage.session.get(['salesforceSession'], result => {
				resolve(result.salesforceSession);
			});
		});
	}
}

// Message Handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	// Session Retrieval
	if (request.message === 'getSession') {
		const sfHost = request.sfHost;

		// Validate domain
		if (!isValidSalesforceDomain(sfHost)) {
			sendResponse(null);
			return true;
		}

		// Retrieve Session
		BackgroundSessionManager.retrieveSessionCookie(sfHost)
			.then(session => {
				// Optional: Store session
				BackgroundSessionManager.storeSession(session);
				sendResponse(session);
			})
			.catch(error => {
				console.error('Session Retrieval Error:', error);
				sendResponse(null);
			});

		return true; // Indicates async response
	}

	// Additional message handlers can be added here
});

// Optional: Session Cleanup
chrome.runtime.onStartup.addListener(() => {
	// Clear old sessions on browser startup
	chrome.storage.session.clear();
});

// Logging and Monitoring
chrome.runtime.onInstalled.addListener(() => {
	console.log('Salesforce Quick Nav Background Script Initialized');
});
