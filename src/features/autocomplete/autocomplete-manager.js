
import { STATES } from './state-manager.js';
import { handleInitialAutocomplete, handleActionAutocomplete } from './entity-handler.js';
import { resetAutocomplete } from './dom-utils.js';

class AutocompleteManager {
	constructor(inputElement, dropdownElement) {
		this.inputElement = inputElement;
		this.dropdownElement = dropdownElement;
		this.currentState = STATES.INITIAL;
		this.selectedItem = null;
		this.debounceTimer = null;
	}

	async processInput(input) {
		if (input.length === 0) {
			resetAutocomplete(this);
			return;
		}

		switch (this.currentState) {
			case STATES.INITIAL:
				await handleInitialAutocomplete(input, this);
				break;
			case STATES.OBJECT_SELECTED:
			case STATES.FLOW_SELECTED:
			case STATES.PROFILE_SELECTED:
			case STATES.APP_SELECTED:
				handleActionAutocomplete(input, this);
				break;
			default:
				resetAutocomplete(this);
		}
	}

	async handleAutocomplete(e) {
		const input = e.target.value.toLowerCase().trim();

		if (input.length === 0) {
			resetAutocomplete(this);
			return;
		}

		try {
			await this.processInput(input);
		} catch (error) {
			console.error('Autocomplete error:', error);
			document.getElementById('error').textContent = error.message;
			resetAutocomplete(this);
		}
	}
}

export default AutocompleteManager;
