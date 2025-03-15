document.addEventListener('DOMContentLoaded', function () {
	const objectInput = document.getElementById('objectInput');
	const autocompleteDropdown = document.getElementById('autocompleteDropdown');

	// Comprehensive list of standard and custom objects
	const standardObjects = [
		'account',
		'contact',
		'lead',
		'opportunity',
		'case',
		'user',
		'campaign',
		'product',
		'contract',
		'solution',
		'task',
		'event',
	];

	// Comprehensive action mapping with full details
	const actionMap = {
		// Basic Object Configuration
		d: 'details',
		details: 'details',

		f: 'fields',
		fields: 'fields',

		pl: 'pagelayouts',
		layouts: 'pagelayouts',
		pagelayouts: 'pagelayouts',

		lr: 'recordpages',
		recordpages: 'recordpages',
		lightningrecordpages: 'recordpages',

		// Buttons and Interactions
		bla: 'buttonslinksactions',
		buttons: 'buttonslinksactions',
		links: 'buttonslinksactions',

		cl: 'compactlayouts',
		compactlayouts: 'compactlayouts',

		fs: 'fieldsets',
		fieldsets: 'fieldsets',

		// Validation and Rules
		vr: 'validationrules',
		rules: 'validationrules',
		validationrules: 'validationrules',

		rt: 'recordtypes',
		recordtypes: 'recordtypes',

		rlf: 'lookupfilters',
		lookupfilters: 'lookupfilters',

		// Layout and Visibility
		sl: 'searchlayouts',
		searchlayouts: 'searchlayouts',

		lvbl: 'listviewbuttons',
		listviewbuttons: 'listviewbuttons',

		hc: 'hierarchycolumns',
		hierarchycolumns: 'hierarchycolumns',

		// Access and Triggers
		oa: 'objectaccess',
		objectaccess: 'objectaccess',

		t: 'triggers',
		triggers: 'triggers',

		ft: 'flowtriggers',
		flowtriggers: 'flowtriggers',

		// Additional Configurations
		ol: 'objectlimits',
		objectlimits: 'objectlimits',

		cff: 'conditionalformatting',
		conditionalformatting: 'conditionalformatting',
	};

	// Mapping of full action names for display
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

	function showAutocomplete(suggestions) {
		autocompleteDropdown.innerHTML = '';
		if (suggestions.length === 0) {
			autocompleteDropdown.style.display = 'none';
			return;
		}

		suggestions.forEach(suggestion => {
			const div = document.createElement('div');
			div.className = 'autocomplete-item';
			div.textContent = suggestion;
			div.addEventListener('click', () => {
				objectInput.value = suggestion;
				autocompleteDropdown.style.display = 'none';
			});
			autocompleteDropdown.appendChild(div);
		});

		autocompleteDropdown.style.display = 'block';
	}

	objectInput.addEventListener('input', function (e) {
		const input = this.value.toLowerCase();
		const parts = input.split('.');

		// Autocomplete for objects
		if (parts.length === 1) {
			const objectSuggestions = standardObjects.filter(obj => obj.toLowerCase().startsWith(input));
			showAutocomplete(objectSuggestions);
		}

		// Autocomplete for actions
		if (parts.length === 2) {
			const object = parts[0];
			const action = parts[1];

			// Find matching actions
			const actionSuggestions = Object.entries(actionMap)
				.filter(([shortcut, fullAction]) => shortcut.toLowerCase().startsWith(action.toLowerCase()))
				.map(([_, fullAction]) => {
					// Use display name for suggestion
					const displayName = actionDisplayMap[fullAction];
					return `${object}.${displayName}`;
				});

			// Remove duplicates
			const uniqueSuggestions = [...new Set(actionSuggestions)];
			showAutocomplete(uniqueSuggestions);
		}
	});

	// Hide dropdown when clicking outside
	document.addEventListener('click', function (e) {
		if (!autocompleteDropdown.contains(e.target) && e.target !== objectInput) {
			autocompleteDropdown.style.display = 'none';
		}
	});

	// Keyboard navigation for dropdown
	objectInput.addEventListener('keydown', function (e) {
		if (autocompleteDropdown.style.display === 'none') return;

		const items = autocompleteDropdown.children;
		let currentIndex = Array.from(items).findIndex(item => item.classList.contains('active'));

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (currentIndex < items.length - 1) {
				if (currentIndex !== -1) items[currentIndex].classList.remove('active');
				currentIndex++;
				items[currentIndex].classList.add('active');
			}
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (currentIndex > 0) {
				items[currentIndex].classList.remove('active');
				currentIndex--;
				items[currentIndex].classList.add('active');
			}
		} else if (e.key === 'Enter') {
			if (currentIndex !== -1) {
				e.preventDefault();
				objectInput.value = items[currentIndex].textContent;
				autocompleteDropdown.style.display = 'none';
			}
		}
	});
});
