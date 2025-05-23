import SalesforceApiService from '../core/api-service.js';
import SessionManager from '../core/session-manager.js';
import {APPS_ACTIONS} from '../utils/configActions.js';
import AutocompleteManager from './autocomplete.js';
import {renderActions, renderSuggestions} from './autocomplete/dom-utils.js';

class AppsNavigator {
	static async queryAvailableApps(session) {
		return AutocompleteManager.queryWithErrorHandling(async () => {
			const apiService = new SalesforceApiService(session);
			// const result = await apiService.makeApiCall('query?q=SELECT DurableId, NamespacePrefix, DeveloperName, Label, NavType, Description FROM AppDefinition');
            const result = await apiService.makeQueryCall('select Id, DeveloperName, Description from ConnectedApplication');
			return result.records.map(app => ({
				id: app.Id,
				name: app.DeveloperName,
				description: app.Description || app.Name,
			}));
		}, 'Error querying apps');
	}
    static async navigateToApp(appId, action) {
        try {
            const session = await SessionManager.retrieveSession();
            const baseUrl = `https://${session.fullHostname}/lightning/setup/ConnectedApplication/page?address=%2Fapp%2Fmgmt%2Fforceconnectedapps%2FforceAppDetail.apexp%3FretURL%3D%252Fsetup%252FNavigationMenus%252Fhome%26connectedAppId%3D${appId}&`;
            const navigateUrl = `${baseUrl}/${action}`;
            chrome.tabs.create({url: navigateUrl});
        }
        catch (error) {
            console.error('App navigation error', error);
        }
    }

    static renderAppSuggestions(apps, dropdownElement, inputElement) {
        console.log('Rendering app suggestions:', apps);
        const config = {
            prefix: 'Apps',
            renderItem: app => `
                <strong>${app.name}</strong>
                <small>(${app.type})</small>
                <div class="app-details">
                    <small>${app.description}</small>
                </div>
            `,
            getItemIdentifier: app => app.name,
            renderActions: (app, dropdown, input) => AppsNavigator.renderAppActions(app, dropdown, input),
            navigate: (app, action) => AppsNavigator.navigateToApp(app.id, action),
        };

        renderSuggestions(apps, dropdownElement, inputElement, config);
    }
    static renderAppActions(app, dropdownElement, inputElement) {
        const config = {
            prefix: 'Apps',
            getItemIdentifier: app => app.name,
            navigate: (app, action) => AppsNavigator.navigateToApp(app.id, action),
        };
        renderActions(app, dropdownElement, inputElement, APPS_ACTIONS, config);
    }
}

export default AppsNavigator;