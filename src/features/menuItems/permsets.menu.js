import {PROFILES_MENU_CONFIG} from './profiles.menu.js';

export const PERMSETS_MENU_CONFIG = {
	prefix: 'PermissionSets',
	queryType: 'TOOLING',
	query: 'select id, Name, Label, Description FROM PermissionSet',
	filterKey: ['label', 'description'],
	getItemIdentifier: perm => perm.apiName,
	renderItem: perm => `
        <strong>${perm.label}</strong>
        <small>(${perm.apiName})</small>
      `,
	processResult: result =>
		result.records
			.filter(record => record.Name !== null)
			.map(record => ({
				id: record.Id,
				label: record.Label,
				apiName: record.Name,
				description: record.Description,
			})),
	urlConfig: (session, perm, action) => {
		const baseUrl = `https://${session.hostname}`;

		if (action === 'assignUsers') {
			return `${baseUrl}/lightning/setup/PermSets/${perm.id}/PermissionSetAssignment/home`;
		}

		if (action === 'ObjectsAndTabs') {
			return `${baseUrl}/lightning/setup/PermSets/page?address=%2F${perm.id}%3Fs%3DEntityPermissions`;
		}

		return `${baseUrl}/lightning/setup/PermSets/page?address=%2F${perm.id}%3Fs%3D${action}`;
	},
	actions: PROFILES_MENU_CONFIG.actions,
};
