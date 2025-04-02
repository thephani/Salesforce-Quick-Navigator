import SalesforceApiService from '../core/api-service.js';
import SessionManager from '../core/session-manager.js';
import { PROFILE_PERMSET_ACTIONS } from '../utils/configActions.js';
import ErrorHandler from '../utils/error-handler.js';
import { renderActions, renderSuggestions } from './autocomplete/dom-utils.js';

class PermissionSetNavigator {
    static async queryAvailablePermissionSets(session) {
        return PermissionSetNavigator._queryWithHandling(async () => {
            const apiService = new SalesforceApiService(session);
            const result = await apiService.makeQueryCall('select id, Name, Label, Description FROM PermissionSet');
            console.log('Permission Set Query Result:', result.records);
            return result.records
            .filter(record => record.Name !== null)
            .map(record => ({
                id: record.Id,
                label: record.Label,
                apiName: record.Name,
            }));
        }, 'Error fetching permission sets.');
    }

    static async navigateToPermissionSet(permissionSet, action) {
        try {
            const session = await SessionManager.retrieveSession();
            const baseUrl = `https://${session.hostname}`;
            const navigateUrl = `${baseUrl}/lightning/setup/PermSets/page?address=%2F${permissionSet.id}`;

            chrome.tabs.create({ url: navigateUrl });
        } catch (error) {
            ErrorHandler.handle(error, 'Permission Set Navigation Error');
        }
    }

    static renderPermissionSetSuggestions(permissions, dropdownElement, inputElement) {
        console.log('Rendering Permission Set Suggestions:', permissions);
        const config = {
            prefix: 'PermissionSets',
            renderItem: perm => `<strong>${perm.label}</strong> <small>(${perm.apiName})</small>`,
            getItemIdentifier: perm => perm.apiName,
            renderActions: (perm, dropdown, input) => PermissionSetNavigator.renderPermissionSetActions(perm, dropdown, input),
            navigate: (perm, action) => PermissionSetNavigator.navigateToPermissionSet(perm, action),
        };

        renderSuggestions(permissions, dropdownElement, inputElement, config);
    }

    static renderPermissionSetActions(perm, dropdownElement, inputElement) {
        const config = {
            prefix: 'PermissionSets',
            getItemIdentifier: perm => perm.apiName,
            navigate: (perm, action) => PermissionSetNavigator.navigateToPermissionSet(perm, action),
        };

        renderActions(perm, dropdownElement, inputElement, PROFILE_PERMSET_ACTIONS, config);
    }

    static async _queryWithHandling(queryFn, errorMessage) {
        try {
            return await queryFn();
        } catch (error) {
            ErrorHandler.handle(error, errorMessage);
            return [];
        }
    }
}

export default PermissionSetNavigator;
