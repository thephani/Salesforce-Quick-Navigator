export const CUSTOM_METADATA_MENU_CONFIG = {
	prefix: 'CustomMetadata',
	queryType: 'REST',
	query:
		'query?q=SELECT+DurableId,QualifiedApiName,DeveloperName,MasterLabel,NamespacePrefix,KeyPrefix+FROM+EntityDefinition+WHERE+IsCustomizable+=+true+AND+QualifiedApiName+LIKE+%27%25__mdt%27+ORDER+BY+MasterLabel',
	filterKey: ['label', 'apiName', 'developerName'],
	processResult: result =>
		result.records.map(metadata => ({
			id: metadata.DurableId,
			apiName: metadata.QualifiedApiName,
			developerName: metadata.DeveloperName,
			label: metadata.MasterLabel,
			namespace: metadata.NamespacePrefix || '',
			keyPrefix: metadata.KeyPrefix,
		})),
	getItemIdentifier: metadata => metadata.apiName,
	renderItem: metadata => `
        <strong>${metadata.label}</strong>
        <small>(${metadata.apiName})</small>
      `,
	urlConfig: (session, metadata, action) => {
		const baseUrl = `https://${session.fullHostname}`;

		if (action === 'manage') {
			return `${baseUrl}/lightning/setup/CustomMetadata/page?address=%2F${encodeURIComponent(
				metadata.keyPrefix
			)}%3Fsetupid%3DCustomMetadata`;
		}

		return `${baseUrl}/lightning/setup/CustomMetadata/page?address=%2F${encodeURIComponent(
			metadata.id
		)}%3Fsetupid%3DCustomMetadata`;
	},
	actions: [
		{code: 'definition', name: 'Custom Metadata Definition', description: 'Open custom metadata type definition'},
		{code: 'manage', name: 'Manage Records', description: 'Open custom metadata records'},
	],
};
