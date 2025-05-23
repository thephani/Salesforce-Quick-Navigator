import SessionManager from '../core/session-manager.js';
import ErrorHandler from '../utils/error-handler.js';
import FlowNavigator from './flow-navigator.js';
import {APPS_MENU_CONFIG} from './menuItems/apps.menu.js';
import {OBJECTS_MENU_CONFIG} from './menuItems/objects.menu.js';
import NavigatorService from './navigator.service.js';
import PermissionSetNavigator from './permissionSet-navigator.js';
import ProfileNavigator from './profile-navigator.js';

// Define constants for better maintainability
const STATES = {
	INITIAL: 'initial',
	OBJECT_SELECTED: 'object-selected',
	FLOW_SELECTED: 'flow-selected',
	PROFILE_SELECTED: 'profile-selected',
	APP_SELECTED: 'app-selected',
};

const COMMAND_PREFIXES = {
	OBJECT: ['objects.', 'object.'],
	PROFILE: ['profiles.', 'profile.'],
	FLOW: ['flows.', 'flow.'],
};

class AutocompleteManager {
	constructor(inputElement, dropdownElement) {
		this.inputElement = inputElement;
		this.dropdownElement = dropdownElement;
		this.currentState = STATES.INITIAL;
		this.selectedItem = null;
		this.debounceTimer = null;
	}

	async processInput(input) {
		// Reset if input is empty
		if (input.length === 0) {
			this.resetAutocomplete();
			return;
		}

		switch (this.currentState) {
			case STATES.INITIAL:
				await this.handleInitialAutocomplete(input);
				break;
			case STATES.OBJECT_SELECTED:
			case STATES.FLOW_SELECTED:
			case STATES.PROFILE_SELECTED:
			case STATES.APP_SELECTED:
				this.handleActionAutocomplete(input);
				break;
			default:
				this.resetAutocomplete();
		}
	}

	async handleAutocomplete(e) {
		console.log('Autocomplete triggered:', e.target.value);
		const input = e.target.value.toLowerCase().trim();

		// Reset if input is empty
		if (input.length === 0) {
			this.resetAutocomplete();
			return;
		}

		try {
			// Determine autocomplete context
			switch (this.currentState) {
				case STATES.INITIAL:
					await this.handleInitialAutocomplete(input);
					break;
				case STATES.OBJECT_SELECTED:
				case STATES.FLOW_SELECTED:
				case STATES.PROFILE_SELECTED:
					this.handleActionAutocomplete(input);
					break;
				default:
					this.resetAutocomplete();
			}
		} catch (error) {
			console.error('Autocomplete error:', error);
			document.getElementById('error').textContent = error.message;
			this.resetAutocomplete();
		}
	}

	async handleInitialAutocomplete(input) {
		const session = await SessionManager.retrieveSession();
		input = input.toLowerCase().trim();
		console.log('Input:', input);

		const entityHandlers = {
			objects: {
				query: () => NavigatorService.queryMetadata(session, OBJECTS_MENU_CONFIG),
				filterKey: ['label', 'apiName'],
				render: data => NavigatorService.renderSuggestions(data, this.dropdownElement, this.inputElement, OBJECTS_MENU_CONFIG),
			},
			profiles: {
				query: () => ProfileNavigator.queryAvailableProfiles(session),
				filterKey: ['name'],
				render: data => ProfileNavigator.renderProfileSuggestions(data, this.dropdownElement, this.inputElement),
			},
			flows: {
				query: () => FlowNavigator.queryAvailableFlows(session),
				filterKey: ['label'],
				render: data => FlowNavigator.renderFlowSuggestions(data, this.dropdownElement, this.inputElement),
			},
			permsets: {
				query: () => PermissionSetNavigator.queryAvailablePermissionSets(session),
				filterKey: ['label'],
				render: data => PermissionSetNavigator.renderPermissionSetSuggestions(data, this.dropdownElement, this.inputElement),
			},
			apps: {
				query: () => NavigatorService.queryMetadata(session, APPS_MENU_CONFIG),
				filterKey: ['name'],
				render: data => NavigatorService.renderSuggestions(data, this.dropdownElement, this.inputElement, APPS_MENU_CONFIG),
			},
		};

		// 		const apps = await NavigatorService.queryMetadata(session, NAVIGATOR_CONFIGS.APPS);
		// NavigatorService.renderSuggestions(apps, dropdownElement, inputElement, NAVIGATOR_CONFIGS.APPS);

		// Determine entity type
		const matchedEntity = Object.keys(entityHandlers).find(type => input.startsWith(type + '.'));
		if (!matchedEntity) {
			console.log('Input not found');
			return;
		}

		// Get the appropriate handler
		const {query, filterKey, render} = entityHandlers[matchedEntity];

		// Remove entity prefix from input
		const modifiedInput = input.replace(`${matchedEntity}.`, '');

		// Fetch available items
		const items = await query();
		console.log(`Fetched ${matchedEntity}:`, items);

		// Filter items based on input
		const filteredItems = items.filter(item =>
			filterKey.some(key => {
				return item[key]?.toLowerCase()?.includes(modifiedInput);
			})
		);

		console.log(`Filtered ${matchedEntity}:`, filteredItems);

		// Render suggestions
		await render(filteredItems);
	}

	handleActionAutocomplete(input) {
		// If input changes after object selection, reset
		if (!input.includes('.')) {
			this.resetAutocomplete();
		}
	}

	resetAutocomplete() {
		this.currentState = 'initial';
		this.selectedObject = null;
		this.dropdownElement.style.display = 'none';
		this.dropdownElement.innerHTML = '';
	}

	static async queryWithErrorHandling(apiCall, errorMessage) {
		try {
			return await apiCall();
		} catch (error) {
			ErrorHandler.handle(error, errorMessage);
			return [];
		}
	}
}

export default AutocompleteManager;
