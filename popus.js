import AutocompleteManager from './src/features/autocomplete.js';
import ObjectNavigator from './src/features/object-navigator.js';
import DomainValidator from './src/utils/domain-validator.js';
import ErrorHandler from './src/utils/error-handler.js';

document.addEventListener('DOMContentLoaded', async () => {
	const objectInput = document.getElementById('objectInput');
	const autocompleteDropdown = document.getElementById('autocompleteDropdown');

	// Initialize Autocomplete

	const autocompleteManager = new AutocompleteManager(objectInput, autocompleteDropdown);

	// Setup event listeners
	objectInput.addEventListener('input', e => autocompleteManager.handleAutocomplete(e));

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

function initializeExtension() {
    // Your existing extension initialization code
    const objectInput = document.getElementById('objectInput');
    const autocompleteDropdown = document.getElementById('autocompleteDropdown');
    
    // Existing initialization logic
    const autocompleteManager = new AdvancedAutocompleteManager(
        objectInput, 
        autocompleteDropdown
    );
}