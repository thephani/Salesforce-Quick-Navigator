import AutocompleteManager from './src/features/autocomplete.js';
import DomainValidator from './src/utils/domain-validator.js';

document.addEventListener('DOMContentLoaded', async () => {
	const objectInput = document.getElementById('objectInput');

	const autocompleteDropdown = document.getElementById('autocompleteDropdown');

	// Initialize Autocomplete and Setup event listeners
	const autocompleteManager = new AutocompleteManager(objectInput, autocompleteDropdown);
	objectInput.addEventListener('input', e => autocompleteManager.handleAutocomplete(e));

    // first level menu
    const guideCodes = document.querySelectorAll('.guide-first-level');
	setupGuideCodeClickListeners(guideCodes, objectInput);

	const container = document.querySelector('.container');
	const notSalesforceMessage = document.getElementById('not-salesforce-message');

	try {
		// Check if on Salesforce domain
		const isSalesforceDomain = await DomainValidator.isOnSalesforceDomain();

		if (!isSalesforceDomain) {
			// Hide main container
			container.style.display = 'none';

			// Show "not on Salesforce" message
			notSalesforceMessage.style.display = 'block';
		} else {
			// Normal initialization of extension
			initializeExtension();
		}
	} catch (error) {
		console.error('Domain validation error', error);
	}
});

function setupGuideCodeClickListeners(guideCodes, objectInput) {
	guideCodes.forEach(code => {
		code.style.cursor = 'pointer'; // Indicate clickable elements
		code.addEventListener('click', () => updateInputWithGuideCode(code, objectInput));
	});
}

function updateInputWithGuideCode(codeElement, objectInput) {
	const guideText = codeElement.textContent.trim();

	// Update the input value and focus the input field
	objectInput.value = guideText+'.'; // Add a period to the end of the guide code
	objectInput.focus();

	// Dispatch an input event to trigger autocomplete functionality
	const event = new Event('input', {bubbles: true});
	objectInput.dispatchEvent(event);
}

function initializeExtension() {
	// Your existing extension initialization code
	const objectInput = document.getElementById('objectInput');
	const autocompleteDropdown = document.getElementById('autocompleteDropdown');

	// Existing initialization logic
	const autocompleteManager = new AutocompleteManager(objectInput, autocompleteDropdown);
}
