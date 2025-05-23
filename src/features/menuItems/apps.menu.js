export const APPS_MENU_CONFIG = {
	prefix: 'Apps',
	queryType: 'TOOLING',
	filterKey: ['name'],
	getItemIdentifier: app => app.name,
	renderItem: app => `
        <strong>${app.name}</strong>
        <small>(${app.type || 'No type'})</small>
        <div class="app-details">
            <small>${app.description || 'No description available'}</small>
        </div>
    `,
	query: 'select Id, DeveloperName, Description from ConnectedApplication',
	processResult: result =>
		result.records.map(app => ({
			id: app.Id,
			name: app.DeveloperName || app.Name || 'Unnamed App',
			description: app.Description || 'No description',
			type: app.Type || 'Unknown',
		})),
	urlConfig: (session, app, action) => {
		const baseUrl = `https://${session.fullHostname}`;
		switch (action) {
			case 'view':
				const relativeUrl =
					'lightning/setup/ConnectedApplication/page?address=%2Fapp%2Fmgmt%2Fforceconnectedapps%2FforceAppDetail.apexp%3FretURL%3D%252Fsetup%252FNavigationMenus%252Fhome%26connectedAppId%3D';
				return `${baseUrl}/${relativeUrl}${app.id}`;
			case 'edit':
				return `${baseUrl}/${app.id}/e`;
			default:
				return baseUrl;
		}
	},
	actions: [
		{code: 'view', name: 'View App', description: 'Open App'},
		{code: 'edit', name: 'Edit Policies', description: 'Edit Policies'},
	],
};
