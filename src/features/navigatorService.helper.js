import {APPS_ACTIONS, OBJECT_ACTIONS} from '../utils/configActions.js';

export const NAVIGATOR_CONFIGS = {
	APPS: {
		prefix: 'Apps',
		queryType: 'SOQL',
		getItemIdentifier: app => app.name,
		renderItem: app => `
                <strong>${app.name}</strong>
                <small>(${app.type})</small>
                <div class="app-details">
                    <small>${app.description}</small>
                </div>
            `,
		query: 'select Id, DeveloperName, Description from ConnectedApplication',
		mapRecord: app => ({
			id: app.Id,
			name: app.DeveloperName,
			description: app.Description || app.Name,
		}),
		urlConfig: (session, app, action) => {
			if (action === 'view') {
				return `https://${session.fullHostname}/lightning/setup/ConnectedApplication/page?address=%2Fapp%2Fmgmt%2Fforceconnectedapps%2FforceAppDetail.apexp%3FretURL%3D%252Fsetup%252FNavigationMenus%252Fhome%26connectedAppId%3D${app.id}`;
			} else if (action === 'edit') {
				return `https://${session.fullHostname}/${app.id}/e`;
			}
		},
		actions: APPS_ACTIONS,
	},

	OBJECTS: {
		prefix: 'Objects',
		queryType: 'REST',
		endpoint: 'sobjects',
		getItemIdentifier: obj => obj.apiName,
		renderItem: obj => `
        <strong>${obj.label}</strong>
        <small>(${obj.apiName})</small>
      `,
		processResult: result =>
			result.sobjects
				.filter(record => record.keyPrefix !== null)
				.map(record => ({
					keyprefix: record.keyPrefix,
					label: record.label,
					apiName: record.name,
				})),
		urlConfig: {
			basePath: '/lightning/setup/ObjectManager/{apiName}/{action}/view',
			queryParams: (obj, action) => ({
				action: action === 'TAB' ? 'list' : action,
			}),
		},
		actions: OBJECT_ACTIONS,
	},

	PERMISSION_SETS: {
		prefix: 'PermissionSets',
		queryType: 'SOQL',
		query: 'select id, Name, Label, Description FROM PermissionSet',
		mapRecord: record => ({
			id: record.Id,
			label: record.Label,
			apiName: record.Name,
		}),
		urlConfig: {
			basePath: '/lightning/setup/PermSets/page',
			queryParams: perm => ({
				address: `%2F${perm.id}`,
			}),
		},
		actions: 'PROFILE_PERMSET_ACTIONS',
	},

	PROFILES: {
		prefix: 'Profiles',
		queryType: 'SOQL',
		query: 'SELECT+Id,Name,Description,UserLicense.Name+FROM+Profile',
		mapRecord: profile => ({
			id: profile.Id,
			name: profile.Name,
			description: profile.Description || 'No description',
			userLicense: profile.UserLicense?.Name || 'Unknown',
		}),
		urlConfig: {
			basePath: '/lightning/setup/EnhancedProfiles/page',
			queryParams: (profile, action) => ({
				address: `%2F${profile.id}%3Fs%3D${action}`,
			}),
		},
		actions: 'PROFILE_PERMSET_ACTIONS',
	},

	FLOWS: {
		prefix: 'Flows',
		queryType: 'SOQL',
		query: 'select id, DeveloperName, Description, ActiveVersionId from FlowDefinition',
		mapRecord: record => ({
			label: record.DeveloperName,
			description: record.Description + (record.ActiveVersionId ? '' : ' (Inactive Flow)'),
			id: record.Id,
			activeId: record.ActiveVersionId,
		}),
		urlConfig: (session, flow, action) => {
			const baseUrl = `https://${session.hostname}`;
			if (action === 'Flow') {
				return `${baseUrl}/builder_platform_interaction/flowBuilder.app?flowDefId=${flow.id}`;
			} else if (action === 'Debug') {
				return `${baseUrl}/flow/${flow.label}/${flow.activeId}?flow__debug=true`;
			}
			return `${baseUrl}/lightning/setup/Flows/page?address=%2F${flow.id}%3F`;
		},
		actions: 'FLOW_ACTIONS',
	},
};
