// src/features/profile-navigator.js

import SalesforceApiService from '../core/api-service.js';
import SessionManager from '../core/session-manager.js';
import ErrorHandler from '../utils/error-handler.js';

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
                userLicense: profile.UserLicense?.Name || 'Unknown'
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
    static async navigateToProfile(profileName) {
        try {
            // Retrieve current Salesforce session and active tab
            await SessionManager.retrieveSession();

            const tabs = await new Promise(resolve => 
                chrome.tabs.query({active: true, currentWindow: true}, resolve)
            );
            const currentUrl = tabs[0].url;

            // Construct profile management URL
            const baseUrl = currentUrl.split('/setup/')[0];
            const profileNavigateUrl = `${baseUrl}/setup/manage/users/ProfileDetail.apexp?id=${profileName}`;
            console.log('[PROFILE] Navigate URL:', profileNavigateUrl);
            // Open profile in new tab
            chrome.tabs.create({url: profileNavigateUrl});
        } catch (error) {
            ErrorHandler.handle(error, 'Profile Navigation Error');
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
                    delete: perm.PermissionsDelete
                }))
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
                const p2Perm = profile2Permissions.objectPermissions
                    .find(p => p.objectType === p1Perm.objectType);

                if (p2Perm) {
                    const permDiff = {
                        objectType: p1Perm.objectType,
                        create: p1Perm.create !== p2Perm.create,
                        read: p1Perm.read !== p2Perm.read,
                        edit: p1Perm.edit !== p2Perm.edit,
                        delete: p1Perm.delete !== p2Perm.delete
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
                profile2: profile2Id
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
                userLicense: profile.UserLicense?.Name
            }));
        } catch (error) {
            ErrorHandler.handle(error, 'Profile Search Error');
            return [];
        }
    }
}

export default ProfileNavigator;