export const FLOWS_MENU_CONFIG = {
	prefix: 'Flows',
	queryType: 'TOOLING',
	filterKey: ['label', 'description'],
	query: 'select id, DeveloperName, Description, ActiveVersionId from FlowDefinition',
	processResult: result =>
		result.records.map(flow => ({
			label: flow.DeveloperName,
			description: flow.Description + (flow.ActiveVersionId ? '' : ' (Inactive Flow)'),
			id: flow.Id,
			activeId: flow.ActiveVersionId,
		})),
	getItemIdentifier: flow => flow.label,
	renderItem: flow => `
						<strong>${flow.label}</strong>
						<small>${flow.description ?? ''}</small>
					`,
	urlConfig: (session, flow, action) => {
		const baseUrl = `https://${session.hostname}`;
		if (action === 'Flow') {
			return `${baseUrl}/builder_platform_interaction/flowBuilder.app?flowDefId=${flow.id}`;
		} else if (action === 'Debug') {
			return `${baseUrl}/flow/${flow.label}/${flow.activeId}?flow__debug=true`;
		}
		return `${baseUrl}/lightning/setup/Flows/page?address=%2F${flow.id}%3F`;
	},

	actions: [
		{code: 'Flow', name: 'Flow Builder', description: 'Open Flow Builder'},
		{code: 'Debug', name: 'Flow Debugger', description: 'Open Flow Debugger'},
		{code: 'FlowVersions', name: 'Flow Versions', description: 'Open Flow Versions'},
	],
};
