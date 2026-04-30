import AutocompleteManager from './src/features/autocomplete.js';
import DomainValidator from './src/utils/domain-validator.js';
import HistoryManager from './src/features/history-manager.js';

document.addEventListener('DOMContentLoaded', async () => {
	const objectInput = document.getElementById('objectInput');
	const autocompleteDropdown = document.getElementById('autocompleteDropdown');
	const container = document.querySelector('.container');
	const notSalesforceMessage = document.getElementById('not-salesforce-message');

	try {
		const isSalesforceDomain = await DomainValidator.isOnSalesforceDomain();

		if (!isSalesforceDomain) {
			container.classList.add('is-hidden');
			notSalesforceMessage.classList.remove('is-hidden');
			return;
		}

		const autocompleteManager = new AutocompleteManager(objectInput, autocompleteDropdown);
		objectInput.addEventListener('input', e => {
			updateActivePrefixButton(objectInput.value);
			autocompleteManager.handleAutocomplete(e);
		});

		const quickPrefixButtons = document.querySelectorAll('.quick-prefix-button');
		setupQuickPrefixButtons(quickPrefixButtons, objectInput);

		const guideCodes = document.querySelectorAll('.guide-list code');
		setupGuideCodeClickListeners(guideCodes, objectInput);

		const historyManager = new HistoryManager();
		await initializeHistoryPanel(historyManager, objectInput);
	} catch (error) {
		console.error('Domain validation error', error);
	}
});

function setupGuideCodeClickListeners(guideCodes, objectInput) {
	guideCodes.forEach(code => {
		code.addEventListener('click', () => updateInputWithGuideCode(code, objectInput));
	});
}

function setupQuickPrefixButtons(prefixButtons, objectInput) {
	prefixButtons.forEach(button => {
		button.addEventListener('click', () => {
			const prefix = button.dataset.prefix;

			if (!prefix) {
				return;
			}

			objectInput.value = replaceCommandPrefix(objectInput.value, prefix);
			objectInput.focus();
			objectInput.dispatchEvent(new Event('input', {bubbles: true}));
		});
	});
}

function replaceCommandPrefix(currentValue, prefix) {
	const trimmedValue = currentValue.trim();
	const dotIndex = trimmedValue.indexOf('.');

	if (dotIndex === -1) {
		return trimmedValue ? `${prefix}.${trimmedValue}` : `${prefix}.`;
	}

	return `${prefix}.${trimmedValue.slice(dotIndex + 1)}`;
}

function updateActivePrefixButton(inputValue) {
	const prefix = inputValue.trim().split('.')[0].toLowerCase();
	const prefixButtons = document.querySelectorAll('.quick-prefix-button');

	prefixButtons.forEach(button => {
		const isActive = button.dataset.prefix?.toLowerCase() === prefix;
		button.classList.toggle('is-active', isActive);
		button.setAttribute('aria-pressed', String(isActive));
	});
}

async function initializeHistoryPanel(historyManager, objectInput) {
	const historyPanel = document.getElementById('historyPanel');
	const historyList = document.getElementById('historyList');
	const clearHistoryBtn = document.getElementById('clearHistoryBtn');

	if (!historyPanel || !historyList || !clearHistoryBtn) {
		console.error('History panel elements not found');
		return;
	}

	await updateHistoryPanel(historyManager, historyList);

	clearHistoryBtn.addEventListener('click', async () => {
		await historyManager.clearHistory();
		await updateHistoryPanel(historyManager, historyList);
	});

	historyList.addEventListener('click', e => {
		const historyItem = e.target.closest('.history-item');
		const command = historyItem?.dataset.command;

		if (!command) {
			return;
		}

		objectInput.value = command;
		objectInput.focus();
		objectInput.dispatchEvent(new Event('input', {bubbles: true}));
	});
}

async function updateHistoryPanel(historyManager, historyList) {
	const history = await historyManager.getHistory();
	const historyPanel = document.getElementById('historyPanel');
	historyList.innerHTML = '';

	if (history.length === 0) {
		historyList.innerHTML = '<li class="history-empty">No history found</li>';
		historyPanel?.classList.add('is-hidden');
		return;
	}

	historyPanel?.classList.remove('is-hidden');

	history.forEach(item => {
		const listItem = document.createElement('li');
		listItem.className = 'history-item';
		listItem.dataset.command = item.command;
		listItem.innerHTML = `
			<span class="history-item-code">${item.command}</span>
			<span class="history-item-count">${item.count}</span>
		`;
		historyList.appendChild(listItem);
	});
}

function updateInputWithGuideCode(codeElement, objectInput) {
	const guideText = codeElement.textContent.trim();
	const prefix = codeElement.closest('.guide-group')?.dataset.prefix;
	const command = prefix ? `${prefix}.${guideText}` : guideText;

	objectInput.value = command;
	objectInput.focus();
	objectInput.dispatchEvent(new Event('input', {bubbles: true}));

	const historyManager = new HistoryManager();
	historyManager.logCommand(command);
}
