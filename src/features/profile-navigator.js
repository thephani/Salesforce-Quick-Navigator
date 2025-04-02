import SalesforceApiService from '../core/api-service.js';
import SessionManager from '../core/session-manager.js';
import {PROFILE_PERMSET_ACTIONS} from '../utils/configActions.js';
import AutocompleteManager from './autocomplete.js';
import { renderActions, renderSuggestions } from './autocomplete/dom-utils.js';

class ProfileNavigator {
  static async queryAvailableProfiles(session) {
    return AutocompleteManager.queryWithErrorHandling(async () => {
      const apiService = new SalesforceApiService(session);
      const result = await apiService.makeApiCall(
        'query?q=SELECT+Id,Name,Description,UserLicense.Name+FROM+Profile'
      );
      return result.records.map(profile => ({
        id: profile.Id,
        name: profile.Name,
        description: profile.Description || 'No description',
        userLicense: profile.UserLicense?.Name || 'Unknown',
      }));
    }, 'Error querying profiles');
  }

  static async navigateToProfile(profileId, action) {
    try {
      const session = await SessionManager.retrieveSession();
      const baseUrl = `https://${session.fullHostname}/lightning/setup`;
      const navigateUrl = `${baseUrl}/EnhancedProfiles/page?address=%2F${profileId}%3Fs%3D${action}`;
      chrome.tabs.create({url: navigateUrl});
    } catch (error) {
      console.error('Profile navigation error', error);
    }
  }

  static renderProfileSuggestions(profiles, dropdownElement, inputElement) {
    const config = {
      prefix: 'Profiles',
      renderItem: (profile) => `
        <strong>${profile.name}</strong>
        <small>(${profile.id})</small>
        <div class="profile-details">
          <small>License: ${profile.userLicense}</small>
        </div>
      `,
      getItemIdentifier: (profile) => profile.name,
      renderActions: (profile, dropdown, input) => 
        ProfileNavigator.renderProfileActions(profile, dropdown, input),
      navigate: (profile, action) => 
        ProfileNavigator.navigateToProfile(profile.id, action)
    };
    
    renderSuggestions(profiles, dropdownElement, inputElement, config);
  }

  static renderProfileActions(profile, dropdownElement, inputElement) {
    const config = {
      prefix: 'Profiles',
      getItemIdentifier: (profile) => profile.name,
      navigate: (profile, action) => 
        ProfileNavigator.navigateToProfile(profile.id, action)
    };
    
    renderActions(profile, dropdownElement, inputElement, PROFILE_PERMSET_ACTIONS, config);
  }

  // ... (keep all other profile-specific methods unchanged)
}

export default ProfileNavigator;