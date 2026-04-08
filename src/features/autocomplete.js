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

export function parseCommandInput(rawInput) {
	const normalizedInput = rawInput.trim().toLowerCase();
	const segments = normalizedInput.split('.');
	const entityKey = segments[0] || '';

	if (!entityKey || !Object.hasOwn(newEntityHandlers, entityKey)) {
		return null;
	}

	return {
		entityKey,
		searchTerm: segments[1] || '',
		actionTerm: segments.slice(2).join('.'),
		endsWithDot: normalizedInput.endsWith('.'),
	};
}

class AutocompleteManager {
	constructor(inputElement, dropdownElement) {
		this.inputElement = inputElement;
		this.dropdownElement = dropdownElement;
		this.currentState = STATES.INITIAL;
	}

	async handleAutocomplete(e) {
		console.log('Autocomplete triggered:', e.target.value);
		const input = e.target.value.toLowerCase().trim();
		ErrorHandler.clear();

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
			ErrorHandler.handle(error, error.message || 'Autocomplete error');
			this.resetAutocomplete();
		}
	}

	async handleInputText(input) {
		console.log('[STATE_STORE]', STATE_STORE);
		input = input.toLowerCase().trim();
		console.log('Input:', input);

		const parsedCommand = parseCommandInput(input);
		if (!parsedCommand) {
			console.log('Input does not contain a valid entity prefix');
			this.currentState = STATES.INITIAL;
			this.renderStatusMessage('Start with a command like Objects. or Profiles.');
			return;
		}

		const {entityKey, searchTerm, actionTerm, endsWithDot} = parsedCommand;
		const selectedEntity = newEntityHandlers[entityKey];
		this.currentState = entityKey.toUpperCase() + '_SELECTED';
		console.log('Matched entity:', entityKey, selectedEntity);
		console.log('Current state set to:', this.currentState, STATE_STORE[this.currentState]);
		console.log('Selected entity:', selectedEntity.filterKey);
		console.log('Parsed action term:', actionTerm);

		this.renderStatusMessage('Loading...');
		const session = await SessionManager.retrieveSession();
		STATE_STORE[this.currentState].CONFIG = selectedEntity;

		// Fetch available items
		let data = [];
		if (STATE_STORE[this.currentState]?.DATA?.length > 0) {
			console.log(`Using cached ${entityKey}:, STATE_STORE[this.currentState]`);
			data = STATE_STORE[this.currentState].DATA;
		} else {
			data = await NavigatorService.queryMetadata(session, selectedEntity);
			STATE_STORE[this.currentState].DATA = data;
		}

		// Filter items based on input
		const filteredItems = data.filter(item =>
			selectedEntity.filterKey.some(key => {
				return item[key]?.toLowerCase()?.includes(searchTerm);
			})
		);

		console.log(`Filtered ${entityKey}:`, filteredItems);
		console.log('selected state:', this.currentState, STATE_STORE[this.currentState]);

		const exactMatchItem = data.find(item => {
			const identifier = selectedEntity.getItemIdentifier(item)?.toLowerCase?.();
			return identifier === searchTerm;
		});

		if (exactMatchItem && (endsWithDot || actionTerm)) {
			NavigatorService.renderItemActions(exactMatchItem, this.dropdownElement, this.inputElement, selectedEntity, actionTerm);
			return;
		}

		if (filteredItems.length === 0) {
			this.renderStatusMessage(`No matches found for ${selectedEntity.prefix}.`);
			return;
		}

		// Render suggestions
		await NavigatorService.renderSuggestions(filteredItems, this.dropdownElement, this.inputElement, selectedEntity);
	}

	resetAutocomplete() {
		this.currentState = STATES.INITIAL;
		this.dropdownElement.classList.add('is-hidden');
		this.dropdownElement.style.display = 'none';
		this.dropdownElement.innerHTML = '';
	}

	renderStatusMessage(message) {
		this.dropdownElement.innerHTML = `<div class="autocomplete-item">${message}</div>`;
		this.dropdownElement.classList.remove('is-hidden');
		this.dropdownElement.style.display = 'block';
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
