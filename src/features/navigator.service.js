import SalesforceApiService from '../core/api-service.js';
import SessionManager from '../core/session-manager.js';
import ErrorHandler from '../utils/error-handler.js';
import AutocompleteManager from './autocomplete.js';
import {renderActions, renderSuggestions} from './autocomplete/dom-utils.js';

class NavigatorService {
	static async queryMetadata(session, config) {
		return AutocompleteManager.queryWithErrorHandling(async () => {
			const apiService = new SalesforceApiService(session);

			if (config.queryType === 'REST') {
				const result = await apiService.invokeREST(config.query);
				console.log('[REST]', result, config.mapRecord);
				return config.processResult(result);
			} else if (config.queryType === 'TOOLING') {
				const result = await apiService.invokeTOOLING(config.query);
				return config.processResult(result);
			}

			throw new Error('Invalid query type specified');
		}, config.errorMessage || 'Error querying metadata');
	}

	static async navigateToItem(item, action, urlConfig) {
		console.log('Navigating to item:', item, action);
		try {
			const session = await SessionManager.retrieveSession();
			let navigateUrl;

			navigateUrl = urlConfig(session, item, action);

			chrome.tabs.create({url: navigateUrl});
		} catch (error) {
			ErrorHandler.handle(error, 'Navigation Error');
		}
	}

	static renderSuggestions(items, dropdownElement, inputElement, config) {
		console.log('config', config);
		const fullConfig = {
			prefix: config.prefix,
			renderItem: config.renderItem,
			getItemIdentifier: config.getItemIdentifier,
			renderActions: (item, dropdown, input) => NavigatorService.renderItemActions(item, dropdown, input, config),
			navigate: (item, action) => NavigatorService.navigateToItem(item, action, config.urlConfig),
		};

		renderSuggestions(items, dropdownElement, inputElement, fullConfig);
	}

	static renderItemActions(item, dropdownElement, inputElement, config, actionTerm = '') {
		const actionConfig = {
			prefix: config.prefix,
			getItemIdentifier: config.getItemIdentifier,
			actionTerm,
			navigate: (item, action) => NavigatorService.navigateToItem(item, action, config.urlConfig),
		};

		renderActions(item, dropdownElement, inputElement, config.actions, actionConfig);
	}
}

export default NavigatorService;
