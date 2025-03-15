class SessionManager {
    static async retrieveSession() {
        return new Promise((resolve, reject) => {
            chrome.tabs.query({active: true, currentWindow: true}, tabs => {
                if (tabs.length === 0) {
                    reject(new Error('No active tab found'));
                    return;
                }

                const activeTab = tabs[0];
                const url = new URL(activeTab.url);

                // Validate Salesforce Host
                if (!this.isValidSalesforceDomain(url.hostname)) {
                    reject(new Error('Not on a Salesforce page'));
                    return;
                }

                // Request Session
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

    static isValidSalesforceDomain(hostname) {
        const validDomains = [
            '.salesforce.com', 
            '.salesforce-setup.com', 
            '.my.salesforce.com', 
            '.lightning.force.com'
        ];
        return validDomains.some(domain => hostname.includes(domain));
    }
}

export default SessionManager;