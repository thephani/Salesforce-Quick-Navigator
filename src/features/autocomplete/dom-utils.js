export function renderSuggestions(items, dropdownElement, inputElement, config) {
	dropdownElement.innerHTML = '';
	dropdownElement.classList.add('is-hidden');
	dropdownElement.style.display = 'none';
	dropdownElement.dataset.listType = 'suggestion';

	if (items.length === 0) return;

	items.slice(0, 10).forEach((item, index) => {
		const suggestionEl = document.createElement('div');
		suggestionEl.classList.add('autocomplete-item', 'is-clickable');
		suggestionEl.id = `autocomplete-suggestion-${index}`;
		suggestionEl.dataset.itemType = 'suggestion';
		suggestionEl.dataset.itemIndex = String(index);
		suggestionEl.setAttribute('role', 'option');
		suggestionEl.setAttribute('aria-selected', 'false');
		suggestionEl.innerHTML = config.renderItem(item);

		suggestionEl.addEventListener('click', () => {
			inputElement.value = `${config.prefix}.${config.getItemIdentifier(item)}.`;
			config.renderActions(item, dropdownElement, inputElement);
		});

		dropdownElement.appendChild(suggestionEl);
	});

	dropdownElement.classList.remove('is-hidden');
	dropdownElement.style.display = 'block';
}

export function renderActions(item, dropdownElement, inputElement, actions, config) {
	dropdownElement.innerHTML = '';
	dropdownElement.dataset.listType = 'action';

	const normalizedActionTerm = (config.actionTerm || '').toLowerCase();
	const filteredActions = actions.filter(action => {
		if (!normalizedActionTerm) {
			return true;
		}

		return [action.code, action.name, action.description].some(value => value?.toLowerCase().includes(normalizedActionTerm));
	});

	if (filteredActions.length === 0) {
		dropdownElement.innerHTML = '<div class="autocomplete-item">No matching actions found.</div>';
		dropdownElement.classList.remove('is-hidden');
		dropdownElement.style.display = 'block';
		return;
	}

	filteredActions.forEach((action, index) => {
		const actionEl = document.createElement('div');
		actionEl.classList.add('autocomplete-item', 'is-clickable');
		actionEl.id = `autocomplete-action-${index}`;
		actionEl.dataset.itemType = 'action';
		actionEl.dataset.itemIndex = String(index);
		actionEl.setAttribute('role', 'option');
		actionEl.setAttribute('aria-selected', 'false');
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

	dropdownElement.classList.remove('is-hidden');
	dropdownElement.style.display = 'block';
}
