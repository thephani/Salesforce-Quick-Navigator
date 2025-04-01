import SessionManager from '../core/session-manager.js';
import ErrorHandler from '../utils/error-handler.js';
import FlowNavigator from './flow-navigator.js';
import ObjectNavigator from './object-navigator.js';
import ProfileNavigator from './profile-navigator.js';

class AutocompleteManager {
	constructor(inputElement, dropdownElement) {
		this.inputElement = inputElement;
		this.dropdownElement = dropdownElement;
		this.currentState = 'initial'; // States: initial, object-selected, action-selection
		this.selectedObject = null;
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
				case 'flow-selection':
					this.handleActionAutocomplete(input);
					break;
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
		if (input.includes('objects.') || input.includes('object.')) {
			const objects = await ObjectNavigator.queryAvailableObjects(session);
			const modifiedInput = input.replace('objects.', '').replace('object.', '');

			// Filter objects
			const filteredObjects = objects.filter(
				obj => obj.label.toLowerCase().includes(modifiedInput) || obj.apiName.toLowerCase().includes(modifiedInput)
			);
			console.log('Filtered Objects:', filteredObjects);
			ObjectNavigator.renderObjectSuggestions(filteredObjects, this.dropdownElement, this.inputElement);
		} else if (input.includes('profiles.') || input.includes('profile.')) {
			const profiles = await ProfileNavigator.queryAvailableProfiles(session);
			console.log('All Profiles:', profiles);
			const modifiedInput = input.replace('profiles.', '').replace('profile.', '');

			// Filter profiles
			const filteredProfiles = profiles.filter(profile => profile.name.toLowerCase().includes(modifiedInput));
			console.log('Filtered Profiles:', filteredProfiles);
			// lightning/setup/EnhancedProfiles/page?address=%2F00e8W000000Njyi

			await ProfileNavigator.renderProfileSuggestions(filteredProfiles, this.dropdownElement, this.inputElement);
			// this.resetAutocomplete();
		} else if (input.includes('flows.') || input.includes('flow.')) {
			const flows = await FlowNavigator.queryAvailableFlows(session);
			// console.log('All Flows:', flows);
			const modifiedInput = input.replace('flows.', '').replace('flow.', '');

			// Filter flows
			const filteredFlows = flows.filter(flow => flow.label.toLowerCase().includes(modifiedInput));
			console.log('Filtered Flows:', filteredFlows);

			await FlowNavigator.renderFlowSuggestions(filteredFlows, this.dropdownElement, this.inputElement);
		}
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

	static async renderSuggestions(items, dropdownElement, inputElement, config) {
		dropdownElement.innerHTML = '';
		dropdownElement.style.display = 'none';

		if (items.length === 0) return;

		items.slice(0, 10).forEach(item => {
			const suggestionEl = document.createElement('div');
			suggestionEl.classList.add('autocomplete-item');
			suggestionEl.innerHTML = config.renderItem(item);

			suggestionEl.addEventListener('click', () => {
				inputElement.value = `${config.prefix}.${config.getItemIdentifier(item)}.`;
				config.renderActions(item, dropdownElement, inputElement);
			});

			dropdownElement.appendChild(suggestionEl);
		});

		dropdownElement.style.display = 'block';
	}

	static renderActions(item, dropdownElement, inputElement, actions, config) {
		dropdownElement.innerHTML = '';

		actions.forEach(action => {
			const actionEl = document.createElement('div');
			actionEl.classList.add('autocomplete-item');
			actionEl.innerHTML = `
			<strong>${action.name}</strong>
			<small>${action.description}</small>
		  `;

			actionEl.addEventListener('click', () => {
				inputElement.value = `${config.prefix}.${config.getItemIdentifier(item)}.${action.code}`;
				dropdownElement.style.display = 'none';
				config.navigate(item, action.code);
			});

			dropdownElement.appendChild(actionEl);
		});

		dropdownElement.style.display = 'block';
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
