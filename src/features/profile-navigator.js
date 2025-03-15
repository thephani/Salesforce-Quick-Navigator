// src/features/profile-navigator.js

import SalesforceApiService from '../core/api-service.js';
import SessionManager from '../core/session-manager.js';
import ErrorHandler from '../utils/error-handler.js';
import {PROFILE_ACTIONS} from '../utils/configActions.js';

class ProfileNavigator {
	/**
	 * Query available Salesforce profiles
	 * @param {Object} session - Salesforce authentication session
	 * @returns {Promise<Array>} List of profiles
	 */
	static async queryAvailableProfiles(session) {
		try {
			const apiService = new SalesforceApiService(session);

			// Comprehensive profile query
			const profileQuery = `/query?q=SELECT+Id,Name,Description,UserLicense.Name+FROM+Profile`;

			const result = await apiService.makeApiCall(profileQuery);

			return result.records.map(profile => ({
				id: profile.Id,
				name: profile.Name,
				description: profile.Description || 'No description',
				userLicense: profile.UserLicense?.Name || 'Unknown',
			}));
		} catch (error) {
			ErrorHandler.handle(error, 'Error querying profiles');
			return [];
		}
	}

	/**
	 * Navigate to profile details or management page
	 * @param {string} profileName - Name of the profile
	 */
	static async navigateToProfile(profileName, action) {
		try {
			const tabs = await new Promise(resolve => chrome.tabs.query({active: true, currentWindow: true}, resolve));
			const currentUrl = tabs[0].url;

			// Base Salesforce setup URL
			const baseUrl = currentUrl.split('/setup/')[0];

			let navigateUrl;
			switch (action.toLowerCase()) {
				case 'apps':
					navigateUrl = `${baseUrl}/setup/manage/users/ProfileAppVisibility.apexp?id=${profileName}`;
					break;
				case 'connectedapps':
					navigateUrl = `${baseUrl}/setup/manage/connectedapps/profileconnectedappvisibility.apexp?id=${profileName}`;
					break;
				case 'objects':
					navigateUrl = `${baseUrl}/setup/EnhancedProfiles/page?address=%2F${profileName}%3Fs%3DObjectsAndTabs`;
					break;
				case 'apppermissions':
					navigateUrl = `${baseUrl}/setup/manage/profileAppPermissions.apexp?id=${profileName}`;
					break;
				case 'apexaccess':
					navigateUrl = `${baseUrl}/setup/manage/profileApexClassAccess.apexp?id=${profileName}`;
					break;
				case 'visualforceaccess':
					navigateUrl = `${baseUrl}/setup/manage/profileVisualforcePageAccess.apexp?id=${profileName}`;
					break;
				case 'externaldatasource':
					navigateUrl = `${baseUrl}/setup/manage/profileExternalDataSourceAccess.apexp?id=${profileName}`;
					break;
				case 'namedcredential':
					navigateUrl = `${baseUrl}/setup/manage/profileNamedCredentialAccess.apexp?id=${profileName}`;
					break;
				case 'externalcredential':
					navigateUrl = `${baseUrl}/setup/manage/profileExternalCredentialPrincipalAccess.apexp?id=${profileName}`;
					break;
				case 'flowaccess':
					navigateUrl = `${baseUrl}/setup/manage/profileFlowAccess.apexp?id=${profileName}`;
					break;
				case 'custompermissions':
					navigateUrl = `${baseUrl}/setup/manage/profileCustomPermissions.apexp?id=${profileName}`;
					break;
				case 'custommetadata':
					navigateUrl = `${baseUrl}/setup/manage/profileCustomMetadataTypeAccess.apexp?id=${profileName}`;
					break;
				case 'customsettings':
					navigateUrl = `${baseUrl}/setup/manage/profileCustomSettingAccess.apexp?id=${profileName}`;
					break;
				default:
					// Fallback to profile details
					navigateUrl = `${baseUrl}/setup/EnhancedProfiles/page?address=%2F${profileName}`;
			}

			// Open in new tab
			chrome.tabs.create({url: navigateUrl});
		} catch (error) {
			console.error('Profile navigation error', error);
		}
	}

	/**
	 * Get detailed profile permissions
	 * @param {string} profileId - ID of the profile
	 * @returns {Promise<Object>} Profile permissions details
	 */
	static async getProfilePermissions(profileId) {
		try {
			const session = await SessionManager.retrieveSession();
			const apiService = new SalesforceApiService(session);

			// Query profile object permissions
			const objectPermissionsQuery = `/query?q=SELECT+SObjectType,PermissionsCreate,PermissionsRead,PermissionsEdit,PermissionsDelete+FROM+ObjectPermissions+WHERE+ProfileId='${profileId}'`;

			const result = await apiService.makeApiCall(objectPermissionsQuery);

			return {
				objectPermissions: result.records.map(perm => ({
					objectType: perm.SObjectType,
					create: perm.PermissionsCreate,
					read: perm.PermissionsRead,
					edit: perm.PermissionsEdit,
					delete: perm.PermissionsDelete,
				})),
			};
		} catch (error) {
			ErrorHandler.handle(error, 'Profile Permissions Retrieval Error');
			return null;
		}
	}

	/**
	 * Compare two profiles' permissions
	 * @param {string} profile1Id - First profile ID
	 * @param {string} profile2Id - Second profile ID
	 * @returns {Promise<Object>} Comparison result
	 */
	static async compareProfiles(profile1Id, profile2Id) {
		try {
			const profile1Permissions = await this.getProfilePermissions(profile1Id);
			const profile2Permissions = await this.getProfilePermissions(profile2Id);

			const differences = profile1Permissions.objectPermissions.reduce((diff, p1Perm) => {
				const p2Perm = profile2Permissions.objectPermissions.find(p => p.objectType === p1Perm.objectType);

				if (p2Perm) {
					const permDiff = {
						objectType: p1Perm.objectType,
						create: p1Perm.create !== p2Perm.create,
						read: p1Perm.read !== p2Perm.read,
						edit: p1Perm.edit !== p2Perm.edit,
						delete: p1Perm.delete !== p2Perm.delete,
					};

					if (Object.values(permDiff).some(Boolean)) {
						diff.push(permDiff);
					}
				}

				return diff;
			}, []);

			return {
				differences: differences,
				profile1: profile1Id,
				profile2: profile2Id,
			};
		} catch (error) {
			ErrorHandler.handle(error, 'Profile Comparison Error');
			return null;
		}
	}

	/**
	 * Search profiles based on criteria
	 * @param {Object} criteria - Search criteria
	 * @returns {Promise<Array>} Matching profiles
	 */
	static async searchProfiles(criteria = {}) {
		try {
			const session = await SessionManager.retrieveSession();
			const apiService = new SalesforceApiService(session);

			// Dynamic SOQL query generation
			let whereClause = Object.entries(criteria)
				.map(([key, value]) => `${key} LIKE '%${value}%'`)
				.join(' AND ');

			const query = `/query?q=SELECT+Id,Name,Description,UserLicense.Name+FROM+Profile${whereClause ? ` WHERE ${whereClause}` : ''}`;

			const result = await apiService.makeApiCall(query);

			return result.records.map(profile => ({
				id: profile.Id,
				name: profile.Name,
				description: profile.Description,
				userLicense: profile.UserLicense?.Name,
			}));
		} catch (error) {
			ErrorHandler.handle(error, 'Profile Search Error');
			return [];
		}
	}

	static async renderProfileSuggestions(profiles, dropdownElement, inputElement) {
		// Clear previous suggestions
		dropdownElement.innerHTML = '';
		dropdownElement.style.display = 'none';

		if (profiles.length > 0) {
			profiles.slice(0, 10).forEach(profile => {
				const suggestionEl = document.createElement('div');
				suggestionEl.classList.add('autocomplete-item');
				suggestionEl.innerHTML = `
					<strong>${profile.name}</strong>
					<small>(${profile.id})</small>
					<div class="profile-details">
						<small>License: ${profile.userLicense}</small>
					</div>
				`;

				suggestionEl.addEventListener('click', () => {
					// Set selected profile and move to action selection
					this.selectedProfile = profile;
					this.currentState = 'profile-selected';

					// Update input to show selected profile
					inputElement.value = `Profiles.${profile.name}.`;

					// Show available profile actions
					this.renderProfileActions(profile, dropdownElement, inputElement);
				});

				dropdownElement.appendChild(suggestionEl);
			});
			dropdownElement.style.display = 'block';
		}
	}

	static renderProfileActions(profile, dropdownElement, inputElement) {
		// Clear previous suggestions
		dropdownElement.innerHTML = '';

		PROFILE_ACTIONS.forEach(action => {
			const actionEl = document.createElement('div');
			actionEl.classList.add('autocomplete-item');
			actionEl.innerHTML = `
				<div class="action-header">
					<strong>${action.code}: ${action.name}</strong>
				</div>
				<div class="action-description">
					<small>${action.description}</small>
				</div>
			`;

			actionEl.addEventListener('click', () => {
				// Complete input with profile and action
				inputElement.value = `Profiles.${profile.name}.${action.code}`;
				dropdownElement.style.display = 'none';
				ProfileNavigator.navigateToProfile(profile.id, action.code);
			});

			dropdownElement.appendChild(actionEl);
		});

		dropdownElement.style.display = 'block';
	}
}

export default ProfileNavigator;
