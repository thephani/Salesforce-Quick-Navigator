import SalesforceApiService from '../core/api-service.js';
import SessionManager from '../core/session-manager.js';
import {FLOW_ACTIONS} from '../utils/configActions.js';
import ErrorHandler from '../utils/error-handler.js';
import ObjectNavigator from './object-navigator.js';

class FlowNavigator {
	static async queryAvailableFlows(session) {
		try {
			const apiService = new SalesforceApiService(session);

			const objectQuery = `sobjects`;

			const result = await apiService.makeQueryCall(`select id, DeveloperName, Description, LatestVersion.VersionNumber from FlowDefinition`);
			// console.log(result.records);
			return result.records.map(record => {
				return {
					label: record.DeveloperName,
					description: record.Description,
					id: record.Id,
				};
			});
		} catch (error) {
			ErrorHandler.handle(error, 'Error querying objects');
			return [];
		}
	}
	static async renderFlowSuggestions(objects, dropdownElement, inputElement) {
		// Clear previous suggestions
		dropdownElement.innerHTML = '';
		dropdownElement.style.display = 'none';

		if (objects.length > 0) {
			objects.slice(0, 10).forEach(obj => {
				const suggestionEl = document.createElement('div');
				suggestionEl.classList.add('autocomplete-item');
				suggestionEl.innerHTML = `
					<strong>${obj.label}</strong>
					<small>(${obj.description})</small>
				`;

				suggestionEl.addEventListener('click', () => {
					// Set selected object and move to action selection
					this.selectedFlow = obj;
					this.currentState = 'flow-selected';

					// Update input to show selected object
					inputElement.value = `FLows.${obj.label}.`;

					// Show available actions
					this.renderFlowActions(obj, dropdownElement, inputElement);
				});

				dropdownElement.appendChild(suggestionEl);
			});
			dropdownElement.style.display = 'block';
		}
	}

	static renderFlowActions(flow, dropdownElement, inputElement) {
		// Clear previous suggestions
		dropdownElement.innerHTML = '';

		FLOW_ACTIONS.forEach(action => {
			const actionEl = document.createElement('div');
			actionEl.classList.add('autocomplete-item');
			//  <strong>${action.code}: ${action.name}</strong>
			actionEl.innerHTML = `
					<strong>${action.name}</strong>
					<small>${action.description}</small>
				`;

			actionEl.addEventListener('click', () => {
				// Complete input with object and action
				console.log('Selected action:', action);
				inputElement.value = `Flows.${flow.label}.${action.code}`;
				dropdownElement.style.display = 'none';

				this.navigateToFlow(flow.id, action.code);
			});

			dropdownElement.appendChild(actionEl);
		});

		dropdownElement.style.display = 'block';
	}

	static async navigateToFlow(flowId, action) {
		try {
			const session = await SessionManager.retrieveSession();
			console.log('[OBJECT] Session:', session);
			const baseUrl = 'https://' + session.hostname;
			console.log('[OBJECT] Base URL:', baseUrl);
			let navigateUrl = baseUrl;
			switch (action) {
				case 'Flow':
					console.log(`${baseUrl}/builder_platform_interaction/flowBuilder.app?flowDefId=${flowId}`);
					navigateUrl = `${baseUrl}/builder_platform_interaction/flowBuilder.app?flowDefId=${flowId}`;
					break;
				default:
					navigateUrl = `${baseUrl}/lightning/setup/Flows/page?address=%2F${flowId}%3F`;
					break;
			}
			console.log('[OBJECT] Navigate URL:', navigateUrl);
			chrome.tabs.create({url: navigateUrl});
		} catch (error) {
			ErrorHandler.handle(error, 'Object Navigation Error');
		}
	}
}

export default FlowNavigator;
