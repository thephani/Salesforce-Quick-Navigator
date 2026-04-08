export const PROFILES_MENU_CONFIG = {
	prefix: 'Profiles',
	queryType: 'REST',
	filterKey: ['name', 'description'],
	query: 'query?q=SELECT+Id,Name,Description,UserLicense.Name+FROM+Profile',
	processResult: result =>
		result.records.map(profile => ({
			id: profile.Id,
			name: profile.Name,
			description: profile.Description || 'No description',
			userLicense: profile.UserLicense?.Name || 'Unknown',
		})),
	renderItem: profile => `
        <strong>${profile.name}</strong>
        <small>(${profile.id})</small>
        <div class="profile-details">
          <small>License: ${profile.userLicense}</small>
        </div>
      `,
	urlConfig: (session, profile, action) => {
		const baseUrl = `https://${session.fullHostname}/lightning/setup`;

		if (action === 'assignUsers') {
			return `https://${session.fullHostname}/005?id=${profile.id}&isUserEntityOverride=1&SetupNode=EnhancedProfiles`;
		}

		return `${baseUrl}/EnhancedProfiles/page?address=%2F${profile.id}%3Fs%3D${action}`;
	},
	getItemIdentifier: profile => profile.name,
	actions: [
		{code: '', name: 'Overview', description: 'Profile configuration details'},
		{code: 'assignUsers', name: 'Assigned Users', description: 'Users assigned to this profile'},
		{code: 'AssignedApps', name: 'Assigned Apps', description: 'Apps visible in the app menu'},
		{code: 'ConnectedApps', name: 'Assigned Connected Apps', description: 'Connected apps visible in the app menu'},
		{code: 'ObjectsAndTabs', name: 'Object Settings', description: 'Permissions to access objects and fields'},
		{code: 'AppPermissions', name: 'App Permissions', description: 'App-specific action permissions'},
		{code: 'ClassAccess', name: 'Apex Class Access', description: 'Permissions to execute Apex classes'},
		{code: 'PageAccess', name: 'Visualforce Page Access', description: 'Permissions to execute Visualforce pages'},
		{code: 'ExternalDataSourceAccess', name: 'External Data Source Access', description: 'Authenticate against external data sources'},
		{code: 'NamedCredentialAccess', name: 'Named Credential Access', description: 'Authenticate against named credentials'},
		{
			code: 'ExternalCredentialAccess',
			name: 'External Credential Principal Access',
			description: 'Authenticate with external credential principal mappings',
		},
		{code: 'FlowAccess', name: 'Flow Access', description: 'Permissions to execute Flows'},
		{code: 'CustomPermissions', name: 'Custom Permissions', description: 'Access to custom processes and apps'},
		{code: 'CustomMetadataTypes', name: 'Custom Metadata Types', description: 'Permissions to access custom metadata types'},
		{code: 'CustomSettings', name: 'Custom Setting Definitions', description: 'Permissions to access custom settings'},
		{
			code: 'SystemPermissions',
			name: 'System Permissions',
			description: 'Permissions to perform actions that apply across apps, such as "Modify All Data"',
		},
		{code: 'LoginHours', name: 'Login Hours', description: 'Settings that control when users can log in'},
		{code: 'LoginIPRanges', name: 'Login IP Ranges', description: 'Settings that control the IP addresses from which users can log in'},
		{code: 'ServiceProviders', name: 'Service Providers', description: 'Permissions that let users switch to other websites using single sign-on'},
		{
			code: 'SessionSettings',
			name: 'Session Settings',
			description: 'Settings that control required session security level and timeout for inactive sessions',
		},
		{code: 'PasswordPolicies', name: 'Password Policies', description: 'Profile Based password policies'},
		{code: 'NetworkAffinity', name: 'Default Experience', description: 'Setting for assigning a default community to a user profile'},
		// lightning/setup/PermSets/0PS1I000000C5ag/PermissionSetAssignment/home
		// lightning/setup/EnhancedProfiles/page?address=%2F005%3Fid%3D00e1I000000NhB0%26isUserEntityOverride%3D1%26SetupNode%3DEnhancedProfiles
	],
};
