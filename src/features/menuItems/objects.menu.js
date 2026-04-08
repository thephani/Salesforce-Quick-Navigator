export const OBJECTS_MENU_CONFIG = {
	prefix: 'Objects',
	queryType: 'REST',
	query: 'sobjects',
	filterKey: ['label', 'apiName'],
	getItemIdentifier: obj => obj.apiName,
	renderItem: obj => `
        <strong>${obj.label}</strong>
        <small>(${obj.apiName})</small>
      `,
	processResult: result =>
		result.sobjects
			.filter(record => record.keyPrefix !== null)
			.map(record => ({
				keyprefix: record.keyPrefix,
				label: record.label,
				apiName: record.name,
			})),
	urlConfig: (session, object, action) => {
		const baseUrl = 'https://' + session.hostname.replace('.my.salesforce.com', '.my.salesforce-setup.com') + '/lightning';
		if (action === 'tab') {
			return `${baseUrl}/o/${object.apiName}/list`;
		}

		return `${baseUrl}/setup/ObjectManager/${object.apiName}/${action}/view`;
	},
	actions: [
		{code: 'tab', name: 'Records Tab', description: 'Navigate to Records Tab or List View'},
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
};
