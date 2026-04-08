export const APEX_CLASSES_MENU_CONFIG = {
	prefix: 'ApexClasses',
	queryType: 'TOOLING',
	filterKey: ['name', 'namespace', 'status'],
	query: 'SELECT Id,Name,NamespacePrefix,Status,ApiVersion FROM ApexClass',
	processResult: result =>
		result.records.map(apexClass => ({
			id: apexClass.Id,
			name: apexClass.Name,
			namespace: apexClass.NamespacePrefix || 'local',
			status: apexClass.Status || 'Unknown',
			apiVersion: apexClass.ApiVersion,
		})),
	getItemIdentifier: apexClass => apexClass.name,
	renderItem: apexClass => `
        <strong>${apexClass.name}</strong>
        <small>[${apexClass.namespace}] • v${apexClass.apiVersion} • ${apexClass.status}</small>
      `,
	urlConfig: (session, apexClass, action) => {
		const baseUrl = `https://${session.fullHostname}`;

		if (action === 'edit') {
			return `${baseUrl}/${apexClass.id}/e`;
		}

		if (action === 'security') {
			return `${baseUrl}/lightning/setup/ApexClasses/page?address=%2F${apexClass.id}%3Fs%3DApexClassSecurity`;
		}

		return `${baseUrl}/lightning/setup/ApexClasses/page?address=%2F${apexClass.id}%3F`;
	},
	actions: [
		{code: 'view', name: 'View Class', description: 'Open Apex class detail page'},
		{code: 'edit', name: 'Edit Class', description: 'Open class editor'},
		{code: 'security', name: 'Class Access', description: 'Open class security assignments'},
	],
};
