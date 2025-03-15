import AutocompleteManager from './src/features/autocomplete.js';
import ObjectNavigator from './src/features/object-navigator.js';
import ErrorHandler from './src/utils/error-handler.js';

document.addEventListener('DOMContentLoaded', () => {
	const objectInput = document.getElementById('objectInput');
	const autocompleteDropdown = document.getElementById('autocompleteDropdown');
	const navigateBtn = document.getElementById('navigateBtn');
	const errorDiv = document.getElementById('error');

	// Initialize Autocomplete

	const autocompleteManager = new AutocompleteManager(objectInput, autocompleteDropdown);

	// Setup event listeners
	objectInput.addEventListener('input', e => autocompleteManager.handleAutocomplete(e));

	// Setup navigation
	// autocompleteManager.setupNavigationListener();

	// Navigation Event Listener
	navigateBtn.addEventListener('click', async () => {
		try {
			// Validate input
			const input = objectInput.value.trim();
			console.log('[NAVIGATION] Input:', input);
			const parts = input.split('.');

			if (parts.length !== 2) {
				errorDiv.textContent = 'Invalid input format';
				errorDiv.style.display = 'block';
				return;
			}

			const [inputType, inputValue] = parts;
			// Object configuration navigation
			await ObjectNavigator.navigateToObjectConfiguration(inputType, inputValue);
		} catch (error) {
			ErrorHandler.handle(error, 'Navigation Error');
		}
	});
});
