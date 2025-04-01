import SalesforceApiService from '../core/api-service.js';
import SessionManager from '../core/session-manager.js';
import {FLOW_ACTIONS} from '../utils/configActions.js';
import ErrorHandler from '../utils/error-handler.js';
import AutocompleteManager from './autocomplete.js';

class FlowNavigator {
  static async queryAvailableFlows(session) {
    return AutocompleteManager.queryWithErrorHandling(async () => {
      const apiService = new SalesforceApiService(session);
      const result = await apiService.makeQueryCall(
        'select id, DeveloperName, Description, ActiveVersionId from FlowDefinition'
      );
      return result.records.map(record => ({
        label: record.DeveloperName,
        description: record.Description,
        id: record.Id,
        activeId: record.ActiveVersionId
      }));
    }, 'Error querying flows');
  }

  static async navigateToFlow(flow, action) {
    console.log('Navigating to flow:', flow, action);
    try {
      const session = await SessionManager.retrieveSession();
      const baseUrl = `https://${session.hostname}`;
      let navigateUrl = `${baseUrl}/lightning/setup/Flows/page?address=%2F${flow.id}%3F`;
      
      if (action === 'Flow') {
        navigateUrl = `${baseUrl}/builder_platform_interaction/flowBuilder.app?flowDefId=${flow.id}`;
      } else if (action === 'Debug') {
        navigateUrl = `${baseUrl}/flow/${flow.label}/${flow.activeId}?flow__debug=true`;
      }
      
      chrome.tabs.create({url: navigateUrl});
    } catch (error) {
      ErrorHandler.handle(error, 'Flow Navigation Error');
    }
  }

  static renderFlowSuggestions(flows, dropdownElement, inputElement) {
    const config = {
      prefix: 'Flows',
      renderItem: (flow) => `
        <strong>${flow.label}</strong>
        <small>${flow.description || ''}</small>
      `,
      getItemIdentifier: (flow) => flow.label,
      renderActions: (flow, dropdown, input) => 
        FlowNavigator.renderFlowActions(flow, dropdown, input),
      navigate: (flow, action) => 
        FlowNavigator.navigateToFlow(flow, action)
    };
    
    AutocompleteManager.renderSuggestions(flows, dropdownElement, inputElement, config);
  }

  static renderFlowActions(flow, dropdownElement, inputElement) {
    const config = {
      prefix: 'Flows',
      getItemIdentifier: (flow) => flow.label,
      navigate: (flow, action) => 
        FlowNavigator.navigateToFlow(flow, action)
    };
    
    AutocompleteManager.renderActions(flow, dropdownElement, inputElement, FLOW_ACTIONS, config);
  }
}

export default FlowNavigator;