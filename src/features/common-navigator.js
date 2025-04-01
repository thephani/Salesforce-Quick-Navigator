import SalesforceApiService from '../core/api-service.js';
import SessionManager from '../core/session-manager.js';
import ErrorHandler from '../utils/error-handler.js';

class CommonNavigator {
  static async renderSuggestions(items, dropdownElement, inputElement, config) {
    dropdownElement.innerHTML = '';
    dropdownElement.style.display = 'none';

    if (items.length === 0) return;

    items.slice(0, 10).forEach(item => {
      const suggestionEl = document.createElement('div');
      suggestionEl.classList.add('autocomplete-item');
      suggestionEl.innerHTML = config.renderItem(item);

      suggestionEl.addEventListener('click', () => {
        inputElement.value = `${config.prefix}.${config.getItemIdentifier(item)}.`;
        config.renderActions(item, dropdownElement, inputElement);
      });

      dropdownElement.appendChild(suggestionEl);
    });

    dropdownElement.style.display = 'block';
  }

  static renderActions(item, dropdownElement, inputElement, actions, config) {
    dropdownElement.innerHTML = '';

    actions.forEach(action => {
      const actionEl = document.createElement('div');
      actionEl.classList.add('autocomplete-item');
      actionEl.innerHTML = `
        <strong>${action.name}</strong>
        <small>${action.description}</small>
      `;

      actionEl.addEventListener('click', () => {
        inputElement.value = `${config.prefix}.${config.getItemIdentifier(item)}.${action.code}`;
        dropdownElement.style.display = 'none';
        config.navigate(item, action.code);
      });

      dropdownElement.appendChild(actionEl);
    });

    dropdownElement.style.display = 'block';
  }

  static async queryWithErrorHandling(apiCall, errorMessage) {
    try {
      return await apiCall();
    } catch (error) {
      ErrorHandler.handle(error, errorMessage);
      return [];
    }
  }
}

export default CommonNavigator;