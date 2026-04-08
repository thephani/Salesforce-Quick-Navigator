export const LABELS_MENU_CONFIG = {
	prefix: 'Labels',
	queryType: 'TOOLING',
	filterKey: ['name', 'value'],
	query: 'SELECT Id,Name,MasterLabel,Value,NamespacePrefix FROM ExternalString ',
	processResult: result =>
		result.records.map(label => ({
			id: label.Id,
			name: label.MasterLabel,
			value: label.Value,
			namespace: label.NamespacePrefix || '',
		})),
	getItemIdentifier: label => label.name,
	renderItem: label => `
        <strong>${label.name}</strong>
        <small>[${label.namespace}] ${label.value}</small>
    `,
	urlConfig: (session, label, action) => {
		const baseUrl = `https://${session.fullHostname}`;
		if (action === 'view') {
			return `${baseUrl}/${label.id}`;
		}
		return `${baseUrl}/${label.id}/e`;
	},
	actions: [
		{code: 'view', name: 'View Label', description: 'Open Label Details'},
		{code: 'edit', name: 'Edit Label', description: 'Edit Label Details'},
	],
};
