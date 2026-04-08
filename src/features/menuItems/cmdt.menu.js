export const CMDT_MENU_CONFIG = {
	prefix: 'CMDT',
	queryType: 'REST',
	filterKey: ['label', 'apiName', 'namespace'],
	query: 'query?q=SELECT+Id,Label,QualifiedApiName,NamespacePrefix+FROM+EntityDefinition+WHERE+QualifiedApiName+LIKE+%27%25__mdt%27',
	processResult: result =>
		result.records.map(type => ({
			id: type.Id,
			label: type.Label,
			apiName: type.QualifiedApiName,
			namespace: type.NamespacePrefix || 'local',
		})),
	getItemIdentifier: cmdt => cmdt.apiName,
	renderItem: cmdt => `
        <strong>${cmdt.label}</strong>
        <small>(${cmdt.apiName})</small>
        <div class="cmdt-details">
          <small>Namespace: ${cmdt.namespace}</small>
        </div>
      `,
	urlConfig: (session, cmdt, action) => {
		const baseUrl = `https://${session.fullHostname}`;

		if (action === 'records') {
			return `${baseUrl}/lightning/o/${cmdt.apiName}/list`;
		}

		if (action === 'fields') {
			return `${baseUrl}/lightning/setup/CustomMetadata/page?address=%2F${cmdt.id}%3Fs%3DCustomFields`;
		}

		return `${baseUrl}/lightning/setup/CustomMetadata/page?address=%2F${cmdt.id}%3F`;
	},
	actions: [
		{code: 'view', name: 'View Type', description: 'Open custom metadata type setup'},
		{code: 'records', name: 'Type Records', description: 'Open custom metadata records list'},
		{code: 'fields', name: 'Type Fields', description: 'Open custom metadata fields'},
	],
};
