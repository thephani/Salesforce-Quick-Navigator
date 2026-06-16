export const BUSINESS_HOURS_MENU_CONFIG = {
	prefix: 'BusinessHours',
	queryType: 'REST',
	filterKey: ['name', 'timeZone', 'status'],
	query: 'query?q=SELECT+Id,Name,IsActive,IsDefault,TimeZoneSidKey+FROM+BusinessHours+ORDER+BY+Name',
	processResult: result =>
		result.records.map(businessHours => ({
			id: businessHours.Id,
			name: businessHours.Name,
			isActive: businessHours.IsActive,
			isDefault: businessHours.IsDefault,
			timeZone: businessHours.TimeZoneSidKey || 'No timezone',
			status: businessHours.IsActive ? 'Active' : 'Inactive',
		})),
	getItemIdentifier: businessHours => businessHours.name,
	renderItem: businessHours => `
        <strong>${businessHours.name}</strong>
        <small>${businessHours.status}${businessHours.isDefault ? ' | Default' : ''} (${businessHours.timeZone})</small>
      `,
	urlConfig: (session, businessHours, action) => {
		const baseUrl = `https://${session.fullHostname}/lightning/setup/BusinessHours/page`;
		const recordPath = action === 'edit' ? `/${businessHours.id}/e` : `/${businessHours.id}`;

		return `${baseUrl}?address=${encodeURIComponent(recordPath)}`;
	},
	actions: [
		{code: 'view', name: 'View Business Hours', description: 'Open Business Hours details'},
		{code: 'edit', name: 'Edit Business Hours', description: 'Edit Business Hours'},
	],
};
