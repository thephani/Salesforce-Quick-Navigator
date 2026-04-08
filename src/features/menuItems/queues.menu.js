export const QUEUES_MENU_CONFIG = {
	prefix: 'Queues',
	queryType: 'REST',
	filterKey: ['name', 'developerName', 'email'],
	query: 'query?q=SELECT+Id,Name,DeveloperName,Email+FROM+Group+WHERE+Type+%3D+%27Queue%27',
	processResult: result =>
		result.records.map(queue => ({
			id: queue.Id,
			name: queue.Name,
			developerName: queue.DeveloperName || queue.Name,
			email: queue.Email || 'No queue email',
		})),
	getItemIdentifier: queue => queue.name,
	renderItem: queue => `
        <strong>${queue.name}</strong>
        <small>(${queue.developerName})</small>
        <div class="queue-details">
          <small>${queue.email}</small>
        </div>
      `,
	urlConfig: (session, queue, action) => {
		const baseUrl = `https://${session.fullHostname}`;

		if (action === 'members') {
			return `${baseUrl}/lightning/setup/Queues/page?address=%2F${queue.id}%3Fs%3DQueueMembers`;
		}

		if (action === 'objects') {
			return `${baseUrl}/lightning/setup/Queues/page?address=%2F${queue.id}%3Fs%3DSupportedObjects`;
		}

		return `${baseUrl}/lightning/setup/Queues/page?address=%2F${queue.id}%3F`;
	},
	actions: [
		{code: 'view', name: 'View Queue', description: 'Open queue details'},
		{code: 'members', name: 'Queue Members', description: 'Manage users and groups in this queue'},
		{code: 'objects', name: 'Supported Objects', description: 'View objects assigned to this queue'},
	],
};
