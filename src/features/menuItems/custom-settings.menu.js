export const CUSTOM_SETTINGS_MENU_CONFIG = {
	prefix: 'CustomSettings',
	queryType: 'REST',
	query:
		"query?q=SELECT+DurableId,QualifiedApiName,DeveloperName,MasterLabel,NamespacePrefix,KeyPrefix+FROM+EntityDefinition+WHERE+IsCustomSetting+=+true+ORDER+BY+MasterLabel",
	filterKey: ['label', 'apiName', 'developerName'],
	processResult: result =>
		result.records.map(setting => ({
			id: setting.DurableId,
			apiName: setting.QualifiedApiName,
			developerName: setting.DeveloperName,
			label: setting.MasterLabel,
			namespace: setting.NamespacePrefix || '',
			keyPrefix: setting.KeyPrefix,
		})),
	getItemIdentifier: setting => setting.apiName,
	renderItem: setting => `
        <strong>${setting.label}</strong>
        <small>(${setting.apiName})</small>
      `,
	urlConfig: (session, setting, action) => {
		const baseUrl = `https://${session.fullHostname}`;

		if (action === 'manage') {
			return `${baseUrl}/setup/ui/listCustomSettingsData.apexp?id=${encodeURIComponent(setting.keyPrefix)}`;
		}

		return `${baseUrl}/setup/ui/viewCustomSettings.apexp?setupid=CustomSettings&id=${encodeURIComponent(setting.id)}`;
	},
	actions: [
		{code: 'definition', name: 'Custom Setting Definition', description: 'Open custom setting definition'},
		{code: 'manage', name: 'Manage', description: 'View setting records'},
	],
};
