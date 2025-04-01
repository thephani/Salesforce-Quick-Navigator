import SalesforceApiService from '../core/api-service.js';
import SessionManager from '../core/session-manager.js';
import {OBJECT_ACTIONS} from '../utils/configActions.js';
import ErrorHandler from '../utils/error-handler.js';

class ObjectNavigator {
	static async queryAvailableObjects(session) {
		try {
			const apiService = new SalesforceApiService(session);

			const objectQuery = `sobjects`;

			const result = await apiService.makeApiCall(objectQuery);
			// console.log(result.sobjects);
			return result.sobjects
				.filter(record => record.keyPrefix !== null) // Filter records where keyPrefix is not null
				.map(record => ({
					keyprefix: record.keyPrefix,
					label: record.label,
					apiName: record.name,
				}));
		} catch (error) {
			ErrorHandler.handle(error, 'Error querying objects');
			return [];
		}
	}

	static async navigateToObjectConfiguration(objectName, action) {
		try {
			const session = await SessionManager.retrieveSession();
			console.log('[OBJECT] Session:', session);
			const baseUrl = 'https://' + session.hostname.replace('.my.salesforce.com', '.my.salesforce-setup.com') + '/lightning';
			console.log('[OBJECT] Base URL:', baseUrl);
			let navigateUrl = baseUrl;
			switch (action) {
				case 'TAB':
					navigateUrl = `${baseUrl}/o/${objectName}/list`;
					break;
				default:
					navigateUrl = `${baseUrl}/setup/ObjectManager/${objectName}/${action}/view`;
					break;
			}
			console.log('[OBJECT] Navigate URL:', navigateUrl);
			chrome.tabs.create({url: navigateUrl});
		} catch (error) {
			ErrorHandler.handle(error, 'Object Navigation Error');
		}
	}

	static renderObjectSuggestions(objects, dropdownElement, inputElement) {
		// Clear previous suggestions
		dropdownElement.innerHTML = '';
		dropdownElement.style.display = 'none';

		if (objects.length > 0) {
			objects.slice(0, 10).forEach(obj => {
				const suggestionEl = document.createElement('div');
				suggestionEl.classList.add('autocomplete-item');
				suggestionEl.innerHTML = `
					<strong>${obj.label}</strong>
					<small>(${obj.apiName})</small>
				`;

				suggestionEl.addEventListener('click', () => {
					// Set selected object and move to action selection
					this.selectedObject = obj;
					this.currentState = 'object-selected';

					// Update input to show selected object
					inputElement.value = `Objects.${obj.apiName}.`;

					// Show available actions
					this.renderObjectActions(obj, dropdownElement, inputElement);
				});

				dropdownElement.appendChild(suggestionEl);
			});
			dropdownElement.style.display = 'block';
		}
	}

	static renderObjectActions(obj, dropdownElement, inputElement) {
		// Determine action set based on object type
		// const actionSet = obj.apiName.endsWith('__c') ? 'custom' : 'standard';
		const actionSet = 'standard';
		const actions = OBJECT_ACTIONS[actionSet];

		// Clear previous suggestions
		dropdownElement.innerHTML = '';

		actions.forEach(action => {
			const actionEl = document.createElement('div');
			actionEl.classList.add('autocomplete-item');
			//  <strong>${action.code}: ${action.name}</strong>
			actionEl.innerHTML = `
                <strong>${action.name}</strong>
                <small>${action.description}</small>
            `;

			actionEl.addEventListener('click', () => {
				// Complete input with object and action
				inputElement.value = `${obj.apiName}.${action.code}`;
				dropdownElement.style.display = 'none';

				ObjectNavigator.navigateToObjectConfiguration(obj.apiName, action.code);
			});

			dropdownElement.appendChild(actionEl);
		});

		dropdownElement.style.display = 'block';
	}
}

export default ObjectNavigator;
