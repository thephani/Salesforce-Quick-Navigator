import SessionManager from '../core/session-manager.js';
import ErrorHandler from '../utils/error-handler.js';
import {APPS_MENU_CONFIG} from './menuItems/apps.menu.js';
import { ESD_MENU_CONFIG } from './menuItems/esd.menu.js';
import {FLOWS_MENU_CONFIG} from './menuItems/flows.menu.js';
import { LABELS_MENU_CONFIG } from './menuItems/labels.menu.js';
import {OBJECTS_MENU_CONFIG} from './menuItems/objects.menu.js';
import {PERMSETS_MENU_CONFIG} from './menuItems/permsets.menu.js';
import {PROFILES_MENU_CONFIG} from './menuItems/profiles.menu.js';
import NavigatorService from './navigator.service.js';

// Define constants for better maintainability
const STATES = {
	INITIAL: 'INITIAL',
	OBJECT_SELECTED: 'OBJECTS_SELECTED',
	FLOW_SELECTED: 'FLOWS_SELECTED',
	PROFILE_SELECTED: 'PROFILES_SELECTED',
	APP_SELECTED: 'APPS_SELECTED',
	LABEL_SELECTED: 'LABELS_SELECTED',
	PERMSET_SELECTED: 'PERMSETS_SELECTED',
	ESD_SELECTED: 'ESD_SELECTED',
	BOTS_SELECTED: 'BOTS_SELECTED'
};

// Holds the API data per state
const STATE_STORE = {
	[STATES.INITIAL]: [],
	[STATES.OBJECT_SELECTED]: {CONFIG: {}, DATA: []},
	[STATES.FLOW_SELECTED]: {CONFIG: {}, DATA: []},
	[STATES.PROFILE_SELECTED]: {CONFIG: {}, DATA: []},
	[STATES.APP_SELECTED]: {CONFIG: {}, DATA: []},
	[STATES.LABEL_SELECTED]: {CONFIG: {}, DATA: []},
	[STATES.PERMSET_SELECTED]: {CONFIG: {}, DATA: []},
	[STATES.ESD_SELECTED]: {CONFIG: {}, DATA: []},
	[STATES.BOTS_SELECTED]: {CONFIG: {}, DATA: []},
};

const newEntityHandlers = {
	objects: OBJECTS_MENU_CONFIG,
	apps: APPS_MENU_CONFIG,
	profiles: PROFILES_MENU_CONFIG,
	flows: FLOWS_MENU_CONFIG,
	permsets: PERMSETS_MENU_CONFIG,
	labels: LABELS_MENU_CONFIG,
	esd: ESD_MENU_CONFIG
};

class AutocompleteManager {
	constructor(inputElement, dropdownElement) {
		this.inputElement = inputElement;
		this.dropdownElement = dropdownElement;
		this.currentState = STATES.INITIAL;
		this.selectedItem = null;
		this.debounceTimer = null;
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
			if (this.currentState) {
				await this.handleInputText(input);
			} else {
				console.log('Current state is not set, defaulting to INITIAL');
				this.resetAutocomplete();
			}
		} catch (error) {
			console.error('Autocomplete error:', error);
			document.getElementById('error').textContent = error.message;
			this.resetAutocomplete();
		}
	}

	async handleInputText(input) {
		console.log('[STATE_STORE]', STATE_STORE);
		const session = await SessionManager.retrieveSession();
		input = input.toLowerCase().trim();
		console.log('Input:', input);

		// Determine entity type
		const matchedEntity = Object.keys(newEntityHandlers).find(type => {
			console.log('type', type);
			type = type.toLowerCase() + '.';
			return input.includes(type);
		});
		console.log('Matched entity:', matchedEntity, newEntityHandlers[matchedEntity]);
		const SELECTED_ENTITY = newEntityHandlers[matchedEntity];
		this.currentState = matchedEntity.toUpperCase() + '_SELECTED';
		console.log('Current state set to:', this.currentState, STATE_STORE[this.currentState]);

		console.log('Selected entity:', SELECTED_ENTITY.filterKey);
		if (!matchedEntity) {
			console.log('Input not found');
			return;
		}

		STATE_STORE[this.currentState].CONFIG = SELECTED_ENTITY;

		// Remove entity prefix from input
		const modifiedInput = input.replace(`${matchedEntity}.`, '');

		// Fetch available items
		let data = [];
		if (STATE_STORE[this.currentState]?.DATA?.length > 0) {
			console.log(`Using cached ${matchedEntity}:, STATE_STORE[this.currentState]`);
			data = STATE_STORE[this.currentState].DATA;
		} else {
			data = await NavigatorService.queryMetadata(session, SELECTED_ENTITY);
			STATE_STORE[this.currentState].DATA = data;
		}

		// Filter items based on input
		const filteredItems = data.filter(item =>
			SELECTED_ENTITY.filterKey.some(key => {
				return item[key]?.toLowerCase()?.includes(modifiedInput);
			})
		);

		console.log(`Filtered ${matchedEntity}:`, filteredItems);
		console.log('selected state:', this.currentState, STATE_STORE[this.currentState]);

		// Render suggestions
		await NavigatorService.renderSuggestions(filteredItems, this.dropdownElement, this.inputElement, SELECTED_ENTITY);
	}

	handleActionAutocomplete(input) {
		console.log('Handling action autocomplete for input:', input);
		// If input changes after object selection, reset
		if (!input.includes('.')) {
			this.resetAutocomplete();
			console.log('Input does not contain a dot, resetting autocomplete');
		}
	}

	resetAutocomplete() {
		this.currentState = 'INITIAL';
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
