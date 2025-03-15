document.addEventListener('DOMContentLoaded', function () {
	const objectInput = document.getElementById('objectInput');
	const navigateBtn = document.getElementById('navigateBtn');
	const errorDiv = document.getElementById('error');

	// Comprehensive mapping of shortcuts to URL paths
	const actionMap = {
		// Basic Object Configuration
		d: 'Details',
		details: 'Details',

		f: 'FieldsAndRelationships',
		fields: 'FieldsAndRelationships',

		pl: 'PageLayouts',
		layouts: 'PageLayouts',
		pagelayouts: 'PageLayouts',

		lr: 'LightningPages',
		recordpages: 'LightningPages',
		lightningrecordpages: 'LightningPages',

		// Buttons and Interactions
		bla: 'ButtonsLinksActions',
		buttons: 'ButtonsLinksActions',
		links: 'buttonButtonsLinksActionsslinksactions',

		cl: 'CompactLayouts',
		compactlayouts: 'CompactLayouts',

		fs: 'FieldSets',
		fieldsets: 'FieldSets',

		// Validation and Rules
		vr: 'validationrules',
		rules: 'validationrules',
		validationrules: 'validationrules',

		rt: 'RecordTypes',
		recordtypes: 'RecordTypes',

		rlf: 'lookupRelatedLookupFiltersfilters',
		lookupfilters: 'RelatedLookupFilters',

		// Layout and Visibility
		sl: 'MySearchLayouts',
		searchlayouts: 'MySearchLayouts',

		lvbl: 'AlohaSearchLayouts',
		listviewbuttons: 'AlohaSearchLayouts',

		hc: 'HierarchyColumns',
		hierarchycolumns: 'HierarchyColumns',

		// Access and Triggers
		oa: 'ObjectAccess',
		objectaccess: 'ObjectAccess',

		t: 'Triggers',
		triggers: 'Triggers',

		ft: 'FlowTriggers',
		flowtriggers: 'FlowTriggers',

		// Additional Configurations
		ol: 'Limits',
		objectlimits: 'Limits',

		cff: 'ConditionalFieldFormatting',
		conditionalformatting: 'ConditionalFieldFormatting',
	};

	const actionDisplayMap = {
		// Basic Object Configuration
		details: 'Details',
		fields: 'Fields & Relationships',
		pagelayouts: 'Page Layouts',
		recordpages: 'Lightning Record Pages',

		// Buttons and Interactions
		buttonslinksactions: 'Buttons, Links, and Actions',
		compactlayouts: 'Compact Layouts',
		fieldsets: 'Field Sets',

		// Validation and Rules
		validationrules: 'Validation Rules',
		recordtypes: 'Record Types',
		lookupfilters: 'Lookup Filters',

		// Layout and Visibility
		searchlayouts: 'Search Layouts',
		listviewbuttons: 'List View Button Layout',
		hierarchycolumns: 'Hierarchy Columns',

		// Access and Triggers
		objectaccess: 'Object Access',
		triggers: 'Triggers',
		flowtriggers: 'Flow Triggers',

		// Additional Configurations
		objectlimits: 'Object Limits',
		conditionalformatting: 'Conditional Field Formatting',
	};

	// Predefined list of valid Salesforce domains
	const validDomains = ['.salesforce.com', '.salesforce-setup.com', '.my.salesforce.com', '.lightning.force.com'];

	// Utility function to validate Salesforce URL
	function isValidSalesforceDomain(url) {
		return validDomains.some(domain => url.includes(domain));
	}

	// Utility function to show error
	function showError(message) {
		errorDiv.textContent = message;
		errorDiv.style.display = 'block';
	}

	function getKeyByValue(value) {
		return Object.keys(actionDisplayMap).find(key => actionDisplayMap[key].toLowerCase() === value.toLowerCase());
	}

	navigateBtn.addEventListener('click', function () {
		// Get current active tab
		chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
			const currentUrl = tabs[0].url;

			// Validate Salesforce setup URL
			if (!isValidSalesforceDomain(currentUrl)) {
				showError('Not a valid Salesforce domain');
				return;
			}

			// Parse input
			const input = objectInput.value.toLowerCase().trim();
			const parts = input.split('.');

			if (parts.length !== 2) {
				showError('Invalid input. Use format: object.action');
				return;
			}

			const objectName = parts[0];
			const action = parts[1];

			//   get key
			const key = getKeyByValue(action);
			console.log('key', key);

			// Find matching URL path
			const actionPath = actionMap[key];

			console.log('selected action path', actionPath, action);

			if (!actionPath) {
				showError('Invalid action. Check your shortcut.');
				return;
			}

			// Construct base URL
			try {
				const urlParts = currentUrl.split('/setup/');
				const baseUrl = urlParts[0];
				console.log('logging base url', baseUrl, objectName, action, actionPath);
				// input: https://teachorg--dev.sandbox.my.salesforce-setup.com/lightning contact fields
				// output: https://teachorg--dev.sandbox.my.salesforce-setup.com/lightning/setup/ObjectManager/01I8W000001YK3U/FieldsAndRelationships/view

				// const navigateUrl = `${baseUrl}/setup/ObjectManager/${objectName.charAt(0).toUpperCase() + objectName.slice(1)}/${actionPath}`;
				const navigateUrl = `${baseUrl}/setup/ObjectManager/${objectName}/${actionPath}/view`;
				console.log(navigateUrl);

				// Open new tab with navigation URL
				chrome.tabs.create({url: navigateUrl});
			} catch (error) {
				showError('Error constructing navigation URL');
				console.error(error);
			}
		});
	});

	// Hide error on input
	objectInput.addEventListener('input', function () {
		errorDiv.style.display = 'none';
	});

	// Optional: Add placeholder hint
	objectInput.setAttribute('placeholder', 'e.g., contact.f, account.layouts');

	// const objectInput = document.getElementById("objectInput");
	const commandItems = document.querySelectorAll('.command-item');

	// Add click event to all command items
	commandItems.forEach(item => {
		item.addEventListener('click', function () {
			// Get the command from data-command attribute
			const command = this.getAttribute('data-command');

			// Update input value
			if (objectInput.value.trim() === '') {
				objectInput.value = command;
			} else {
				// If input already has content, append with a space
				objectInput.value += '.' + command;
			}
			console.log('command = ', command);
			// Optional: Focus on input
			objectInput.focus();
		});
	});
});
