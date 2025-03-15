import SalesforceApiService from '../core/api-service.js';
import SessionManager from '../core/session-manager.js';
import ErrorHandler from '../utils/error-handler.js';

class ObjectNavigator {
    static async queryAvailableObjects(session) {
        try {
            const apiService = new SalesforceApiService(session);
            
            const objectQuery = `/sobjects`;
            
            const result = await apiService.makeApiCall(objectQuery);
            // console.log(result.sobjects);
            return result.sobjects.map(record => ({
                // id: record.Id,
                label: record.label,
                apiName: record.name
            }));
        } catch (error) {
            ErrorHandler.handle(error, 'Error querying objects');
            return [];
        }
    }

    static async navigateToObjectConfiguration(objectName, action) {
        try {
            const tabs = await new Promise(resolve => 
                chrome.tabs.query({active: true, currentWindow: true}, resolve)
            );
            const currentUrl = tabs[0].url;

            // Construct navigation URL logic here
            const baseUrl = currentUrl.split('/setup/')[0];
            const navigateUrl = `${baseUrl}/setup/ObjectManager/${objectName}/${action}/view`;
            console.log('[OBJECT] Navigate URL:', navigateUrl);
            chrome.tabs.create({url: navigateUrl});
        } catch (error) {
            ErrorHandler.handle(error, 'Object Navigation Error');
        }
    }
}

export default ObjectNavigator;