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

			this.renderProfileSuggestions(filteredProfiles);
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
				this.navigateToObject(obj.apiName, action.code);
			});

			this.dropdownElement.appendChild(actionEl);
		});

		this.dropdownElement.style.display = 'block';
	}

	renderProfileSuggestions(profiles) {
		// Clear previous suggestions
		this.dropdownElement.innerHTML = '';
		this.dropdownElement.style.display = 'none';

		if (profiles.length > 0) {
			profiles.slice(0, 10).forEach(profile => {
				const suggestionEl = document.createElement('div');
				suggestionEl.classList.add('autocomplete-item');
				suggestionEl.innerHTML = `
					<strong>${profile.name}</strong>
					<small>(${profile.id})</small>
					<div class="profile-details">
						<small>License: ${profile.userLicense}</small>
					</div>
				`;

				suggestionEl.addEventListener('click', () => {
					// Set selected profile and move to action selection
					this.selectedProfile = profile;
					this.currentState = 'profile-selected';

					// Update input to show selected profile
					this.inputElement.value = `Profiles.${profile.name}.`;

					// Show available profile actions
					this.renderProfileActions(profile);
				});

				this.dropdownElement.appendChild(suggestionEl);
			});
			this.dropdownElement.style.display = 'block';
		}
	}

	renderProfileActions(profile) {
		// Predefined profile-related actions
		const profileActions = [
			{
				code: 'users',
				name: 'Users',
				description: 'Users assigned to this profile',
			},
			{
				code: 'perms',
				name: 'Permissions',
				description: 'Profile permission details',
			},
			{
				code: 'details',
				name: 'Details',
				description: 'Profile configuration',
			},
		];

		// Clear previous suggestions
		this.dropdownElement.innerHTML = '';

		profileActions.forEach(action => {
			const actionEl = document.createElement('div');
			actionEl.classList.add('autocomplete-item');
			actionEl.innerHTML = `
				<strong>${action.code}: ${action.name}</strong>
				<small>${action.description}</small>
			`;

			actionEl.addEventListener('click', () => {
				// Complete input with profile and action
				this.inputElement.value = `Profiles.${profile.name}.${action.code}`;
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

	renderProfileActions(profile) {
		// Comprehensive profile-related actions based on the image
		const profileActions = [
			{
				code: 'default',
				name: 'Profile Overview',
				description: 'Profile configuration details',
			},
			{
				code: 'apps',
				name: 'Assigned Apps',
				description: 'Apps visible in the app menu',
			},
			{
				code: 'connectedapps',
				name: 'Assigned Connected Apps',
				description: 'Connected apps visible in the app menu',
			},
			{
				code: 'objects',
				name: 'Object Settings',
				description: 'Permissions to access objects and fields',
			},
			{
				code: 'apppermissions',
				name: 'App Permissions',
				description: 'App-specific action permissions',
			},
			{
				code: 'apexaccess',
				name: 'Apex Class Access',
				description: 'Permissions to execute Apex classes',
			},
			{
				code: 'visualforceaccess',
				name: 'Visualforce Page Access',
				description: 'Permissions to execute Visualforce pages',
			},
			{
				code: 'externaldatasource',
				name: 'External Data Source Access',
				description: 'Authenticate against external data sources',
			},
			{
				code: 'namedcredential',
				name: 'Named Credential Access',
				description: 'Authenticate against named credentials',
			},
			{
				code: 'externalcredential',
				name: 'External Credential Principal Access',
				description: 'Authenticate with external credential principal mappings',
			},
			{
				code: 'flowaccess',
				name: 'Flow Access',
				description: 'Permissions to execute Flows',
			},
			{
				code: 'custompermissions',
				name: 'Custom Permissions',
				description: 'Access to custom processes and apps',
			},
			{
				code: 'custommetadata',
				name: 'Custom Metadata Types',
				description: 'Permissions to access custom metadata types',
			},
			{
				code: 'customsettings',
				name: 'Custom Setting Definitions',
				description: 'Permissions to access custom settings',
			},
		];

		// Clear previous suggestions
		this.dropdownElement.innerHTML = '';

		profileActions.forEach(action => {
			const actionEl = document.createElement('div');
			actionEl.classList.add('autocomplete-item');
			actionEl.innerHTML = `
				<div class="action-header">
					<strong>${action.code}: ${action.name}</strong>
				</div>
				<div class="action-description">
					<small>${action.description}</small>
				</div>
			`;

			actionEl.addEventListener('click', () => {
				// Complete input with profile and action
				this.inputElement.value = `Profiles.${profile.name}.${action.code}`;
				this.dropdownElement.style.display = 'none';
				this.resetAutocomplete();
				this.navigateToProfile(profile.id, action.code);
			});

			this.dropdownElement.appendChild(actionEl);
		});

		this.dropdownElement.style.display = 'block';
	}

	// Enhanced navigation method
	async navigateToProfile(profileName, action) {
		try {
			const tabs = await new Promise(resolve => chrome.tabs.query({active: true, currentWindow: true}, resolve));
			const currentUrl = tabs[0].url;

			// Base Salesforce setup URL
			const baseUrl = currentUrl.split('/setup/')[0];

			let navigateUrl;
			switch (action.toLowerCase()) {
				case 'apps':
					navigateUrl = `${baseUrl}/setup/manage/users/ProfileAppVisibility.apexp?id=${profileName}`;
					break;
				case 'connectedapps':
					navigateUrl = `${baseUrl}/setup/manage/connectedapps/profileconnectedappvisibility.apexp?id=${profileName}`;
					break;
				case 'objects':
					navigateUrl = `${baseUrl}/setup/EnhancedProfiles/page?address=%2F${profileName}%3Fs%3DObjectsAndTabs`;
					break;
				case 'apppermissions':
					navigateUrl = `${baseUrl}/setup/manage/profileAppPermissions.apexp?id=${profileName}`;
					break;
				case 'apexaccess':
					navigateUrl = `${baseUrl}/setup/manage/profileApexClassAccess.apexp?id=${profileName}`;
					break;
				case 'visualforceaccess':
					navigateUrl = `${baseUrl}/setup/manage/profileVisualforcePageAccess.apexp?id=${profileName}`;
					break;
				case 'externaldatasource':
					navigateUrl = `${baseUrl}/setup/manage/profileExternalDataSourceAccess.apexp?id=${profileName}`;
					break;
				case 'namedcredential':
					navigateUrl = `${baseUrl}/setup/manage/profileNamedCredentialAccess.apexp?id=${profileName}`;
					break;
				case 'externalcredential':
					navigateUrl = `${baseUrl}/setup/manage/profileExternalCredentialPrincipalAccess.apexp?id=${profileName}`;
					break;
				case 'flowaccess':
					navigateUrl = `${baseUrl}/setup/manage/profileFlowAccess.apexp?id=${profileName}`;
					break;
				case 'custompermissions':
					navigateUrl = `${baseUrl}/setup/manage/profileCustomPermissions.apexp?id=${profileName}`;
					break;
				case 'custommetadata':
					navigateUrl = `${baseUrl}/setup/manage/profileCustomMetadataTypeAccess.apexp?id=${profileName}`;
					break;
				case 'customsettings':
					navigateUrl = `${baseUrl}/setup/manage/profileCustomSettingAccess.apexp?id=${profileName}`;
					break;
				default:
					// Fallback to profile details
					navigateUrl = `${baseUrl}/setup/EnhancedProfiles/page?address=%2F${profileName}`;
					
			}

			// Open in new tab
			chrome.tabs.create({url: navigateUrl});
		} catch (error) {
			console.error('Profile navigation error', error);
		}
	}

	async navigateToObject(objectName, action) {
		try {
            const tabs = await new Promise(resolve => 
                chrome.tabs.query({active: true, currentWindow: true}, resolve)
            );
            const currentUrl = tabs[0].url;

            // Construct navigation URL logic here
            const baseUrl = currentUrl.split('/setup/')[0];
            const navigateUrl = `${baseUrl}/setup/ObjectManager/${objectName}/${action}/view`;
            console.log('[OBJECT] Navigate URL:', navigateUrl);
            chrome.tabs.create({url: navigateUrl});
        } catch (error) {
            ErrorHandler.handle(error, 'Object Navigation Error');
        }
	}
}

export default AutocompleteManager;
