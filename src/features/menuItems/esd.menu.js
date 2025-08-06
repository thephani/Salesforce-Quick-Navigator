export const ESD_MENU_CONFIG = {
	prefix: 'ESD',
	queryType: 'TOOLING',
	filterKey: ['name', 'description'],
	query: 'SELECT Id, DeveloperName FROM EmbeddedServiceConfig',
	processResult: result =>
		result.records.map(esd => ({
			id: esd.Id,
			name: esd.DeveloperName || 'Unnamed ESD',
			description: 'Embedded Service Deployment',
		})),
	getItemIdentifier: esd => esd.name,
	renderItem: esd => `
        <strong>${esd.name}</strong>
        <small>(${esd.id})</small>`,
	urlConfig: (session, esd, action) => {
		const baseUrl = `https://${session.fullHostname}`;
		if (action === 'view') {
			return `${baseUrl}/lightning/setup/EmbeddedServiceDeployments/${esd.id}/view`;
		} else {
			return `${baseUrl}/lightning/setup/EmbeddedServiceDeployments/${esd.id}/EmbeddedMessaging/${action}`;
		}
	},
	actions: [
		{code: 'view', name: 'View ESD', description: 'View Embedded Service Deployment'},
		{code: 'codesnippet', name: 'Code Snippet', description: 'Generate code snippet for ESD'},
		{code: 'branding', name: 'Branding', description: 'Manage ESD branding'},
		{code: 'prechat', name: 'Pre-Chat', description: 'Configure pre-chat settings'},
		{code: 'settings', name: 'Edit Settings', description: 'Edit Embedded Service Deployment'},
		{code: 'customuicomponents', name: 'Custom UI Components', description: 'Manage custom UI components'},
	],
};
