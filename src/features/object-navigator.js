import SalesforceApiService from '../core/api-service.js';
import SessionManager from '../core/session-manager.js';
import {OBJECT_ACTIONS} from '../utils/configActions.js';
import ErrorHandler from '../utils/error-handler.js';
import AutocompleteManager from './autocomplete.js';
import { renderActions, renderSuggestions } from './autocomplete/dom-utils.js';

class ObjectNavigator {
  static async queryAvailableObjects(session) {
    return AutocompleteManager.queryWithErrorHandling(async () => {
      const apiService = new SalesforceApiService(session);
      const result = await apiService.makeApiCall('sobjects');
      return result.sobjects
        .filter(record => record.keyPrefix !== null)
        .map(record => ({
          keyprefix: record.keyPrefix,
          label: record.label,
          apiName: record.name,
        }));
    }, 'Error querying objects');
  }

  static async navigateToObjectConfiguration(objectName, action) {
    try {
      const session = await SessionManager.retrieveSession();
      const baseUrl = 'https://' + session.hostname.replace('.my.salesforce.com', '.my.salesforce-setup.com') + '/lightning';
      let navigateUrl = baseUrl;
      
      if (action === 'TAB') {
        navigateUrl = `${baseUrl}/o/${objectName}/list`;
      } else {
        navigateUrl = `${baseUrl}/setup/ObjectManager/${objectName}/${action}/view`;
      }
      
      chrome.tabs.create({url: navigateUrl});
    } catch (error) {
      ErrorHandler.handle(error, 'Object Navigation Error');
    }
  }

  static renderObjectSuggestions(objects, dropdownElement, inputElement) {
    const config = {
      prefix: 'Objects',
      renderItem: (obj) => `
        <strong>${obj.label}</strong>
        <small>(${obj.apiName})</small>
      `,
      getItemIdentifier: (obj) => obj.apiName,
      renderActions: (obj, dropdown, input) => 
        ObjectNavigator.renderObjectActions(obj, dropdown, input),
      navigate: (obj, action) => 
        ObjectNavigator.navigateToObjectConfiguration(obj.apiName, action)
    };
    
    // AutocompleteManager.renderSuggestions(objects, dropdownElement, inputElement, config);
    renderSuggestions(objects, dropdownElement, inputElement, config);
  }

  static renderObjectActions(obj, dropdownElement, inputElement) {
    const actionSet = 'standard';
    const actions = OBJECT_ACTIONS[actionSet];
    
    const config = {
      prefix: 'Objects',
      getItemIdentifier: (obj) => obj.apiName,
      navigate: (obj, action) => 
        ObjectNavigator.navigateToObjectConfiguration(obj.apiName, action)
    };
    
    // AutocompleteManager.renderActions(obj, dropdownElement, inputElement, actions, config);
    renderActions(actions, dropdownElement, inputElement, actions, config);
  }
}

export default ObjectNavigator;