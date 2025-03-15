import SessionManager from '../core/session-manager.js';
import ObjectNavigator from './object-navigator.js';
import ProfileNavigator from './profile-navigator.js';
import {debounce} from '../utils/debounce.js';

class AutocompleteManager {
	constructor(inputElement, dropdownElement) {
		this.inputElement = inputElement;
		this.dropdownElement = dropdownElement;
		this.currentState = 'initial'; // States: initial, object-selected, action-selection
		this.selectedObject = null;

		// Predefined actions for different object types
		this.objectActions = {
			standard: [
				{code: 'Details', name: 'Details', description: 'Object Details'},
				{code: 'FieldsAndRelationships', name: 'Fields', description: 'Fields & Relationships'},
				{code: 'RecordTypes', name: 'Record Types', description: 'Object Record Types'},
				{code: 'PageLayouts', name: 'Page Layouts', description: 'Object Page Layouts'},
				{code: 'LightningPages', name: 'Lightning Record Pages', description: 'Lightning Record Pages'},
				{code: 'ButtonsLinksActions', name: 'Buttons, Links, and Actions', description: 'Buttons, Links, and Actions'},
				{code: 'CompactLayouts', name: 'Compact Layouts', description: 'Compact Layouts'},
				{code: 'FieldSets', name: 'Field Sets', description: 'Field Sets'},
				{code: 'ApexTriggers', name: 'Triggers', description: 'Triggers'},
				{code: 'FlowTriggers', name: 'Flow Triggers', description: 'Flow Triggers'},
				{code: 'ObjectAccess', name: 'Object Permissions', description: 'Object Permissions'},
				{code: 'Limits', name: 'Object Limits', description: 'Object Limits'},
				{code: 'ValidationRules', name: 'Validation Rules', description: 'Validation Rules'},
				{code: 'MySearchLayouts', name: 'Search Layouts', description: 'Search Layouts'},
				{code: 'ListView', name: 'List Views', description: 'List Views'},
				{code: 'RelatedLookupFilters', name: 'Related Lookup Filters', description: 'Related Lookup Filters'},
				{code: 'AlohaSearchLayouts', name: 'List View Buttons', description: 'List View Button Layout'},
				{code: 'HierarchyColumns', name: 'Hierarchy Columns', description: 'Hierarchy Columns'},
				{code: 'ConditionalFieldFormatting', name: 'Conditional Field Formatting', description: 'Conditional Field Formatting'},
			],
			custom: [
				// {code: 'd', name: 'Details', description: 'Custom Object Details'},
				// {code: 'f', name: 'Fields', description: 'Custom Fields'},
				// {code: 'pl', name: 'Page Layouts', description: 'Custom Page Layouts'},
				// {code: 'rt', name: 'Record Types', description: 'Record Types'},
			],
		};
	}

	async handleAutocomplete(e) {
		const input = e.target.value.toLowerCase().trim();

		// Reset if input is empty
		if (input.length === 0) {
			this.resetAutocomplete();
			return;
		}

		try {
			// Determine autocomplete context
			switch (this.currentState) {
				case 'initial':
					await this.handleInitialAutocomplete(input);
					break;
				case 'object-selected':
					this.handleActionAutocomplete(input);
					break;
			}
		} catch (error) {
			console.error('Autocomplete error:', error);
			this.resetAutocomplete();
		}
	}

	async handleInitialAutocomplete(input) {
		// Check for object-specific queries
		console.log('Input:', input);
		if (input.includes('objects.') || input.includes('object.')) {
			const session = await SessionManager.retrieveSession();
			const objects = await ObjectNavigator.queryAvailableObjects(session);
			console.log('All Objects:', objects);
			const modifiedInput = input.replace('objects.', '').replace('object.', '');
			console.log('Modified Input:', modifiedInput);

			// Filter objects
			const filteredObjects = objects.filter(
				obj => obj.label.toLowerCase().includes(modifiedInput) || obj.apiName.toLowerCase().includes(modifiedInput)
			);
			console.log('Filtered Objects:', filteredObjects);
			this.renderObjectSuggestions(filteredObjects);
		}
	}

	renderObjectSuggestions(objects) {
		// Clear previous suggestions
		this.dropdownElement.innerHTML = '';
		this.dropdownElement.style.display = 'none';

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
					this.inputElement.value = `Objects.${obj.apiName}.`;

					// Show available actions
					this.renderObjectActions(obj);
				});

				this.dropdownElement.appendChild(suggestionEl);
			});
			this.dropdownElement.style.display = 'block';
		}
	}

	renderObjectActions(obj) {
		// Determine action set based on object type
		// const actionSet = obj.apiName.endsWith('__c') ? 'custom' : 'standard';
		const actionSet = 'standard';
		const actions = this.objectActions[actionSet];

		// Clear previous suggestions
		this.dropdownElement.innerHTML = '';

		actions.forEach(action => {
			const actionEl = document.createElement('div');
			actionEl.classList.add('autocomplete-item');
			actionEl.innerHTML = `
                <strong>${action.code}: ${action.name}</strong>
                <small>${action.description}</small>
            `;

			actionEl.addEventListener('click', () => {
				// Complete input with object and action
				this.inputElement.value = `${obj.apiName}.${action.code}`;
				this.dropdownElement.style.display = 'none';
				this.resetAutocomplete();
			});

			this.dropdownElement.appendChild(actionEl);
		});

		this.dropdownElement.style.display = 'block';
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

	// Additional method to handle navigation
	// setupNavigationListener() {
	// 	const navigateBtn = document.getElementById('navigateBtn');
	// 	navigateBtn.addEventListener('click', async () => {
	// 		const input = this.inputElement.value.trim();
	// 		const [objectName, action] = input.split('.');

	// 		if (objectName && action) {
	// 			try {
	// 				await ObjectNavigator.navigateToObjectConfiguration(objectName, action);
	// 			} catch (error) {
	// 				console.error('Navigation error', error);
	// 			}
	// 		}
	// 	});
	// }
}

export default AutocompleteManager;
