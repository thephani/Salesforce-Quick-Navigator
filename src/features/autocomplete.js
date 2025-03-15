import SessionManager from '../core/session-manager.js';
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
			}
		} catch (error) {
			console.error('Autocomplete error:', error);
			document.getElementById('error').textContent = error.message;
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
			ObjectNavigator.renderObjectSuggestions(filteredObjects, this.dropdownElement, this.inputElement);
		} else if (input.includes('profiles.') || input.includes('profile.')) {
			const session = await SessionManager.retrieveSession();
			const profiles = await ProfileNavigator.queryAvailableProfiles(session);
			console.log('All Profiles:', profiles);
			const modifiedInput = input.replace('profiles.', '').replace('profile.', '');
			console.log('Modified Input:', modifiedInput);

			// Filter profiles
			const filteredProfiles = profiles.filter(profile => profile.name.toLowerCase().includes(modifiedInput));
			console.log('Filtered Profiles:', filteredProfiles);
			// lightning/setup/EnhancedProfiles/page?address=%2F00e8W000000Njyi

			await ProfileNavigator.renderProfileSuggestions(filteredProfiles, this.dropdownElement, this.inputElement);
			// this.resetAutocomplete();
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
}

export default AutocompleteManager;
