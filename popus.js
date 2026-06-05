import AutocompleteManager from './src/features/autocomplete.js';
import DomainValidator from './src/utils/domain-validator.js';
import ErrorHandler from './src/utils/error-handler.js';
import HistoryManager from './src/features/history-manager.js';
import NavigatorService from './src/features/navigator.service.js';
import SessionManager from './src/core/session-manager.js';
import {MENU_CONFIGS} from './src/features/menuItems/index.js';

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

		setupTabs();

		const quickPrefixButtons = document.querySelectorAll('.quick-prefix-button');
		setupQuickPrefixButtons(quickPrefixButtons, objectInput);

		const historyManager = new HistoryManager();
		await initializeCommandLists(historyManager, objectInput);

		const guideCodes = document.querySelectorAll('.guide-list code');
		setupGuideCodeClickListeners(guideCodes, objectInput, historyManager);
	} catch (error) {
		console.error('Domain validation error', error);
	}
});

function setupGuideCodeClickListeners(guideCodes, objectInput, historyManager) {
	guideCodes.forEach(code => {
		code.addEventListener('click', () => updateInputWithGuideCode(code, objectInput, historyManager));
	});
}

function setupTabs() {
	const tabButtons = document.querySelectorAll('.tab-button');
	const tabPanels = document.querySelectorAll('.tab-panel');
	const quickFooter = document.getElementById('quickFooter');

	const activateTab = button => {
		const targetId = button.dataset.tabTarget;

		if (!targetId) {
			return;
		}

		tabButtons.forEach(tabButton => {
			const isActive = tabButton === button;
			tabButton.classList.toggle('is-active', isActive);
			tabButton.setAttribute('aria-selected', String(isActive));
			tabButton.setAttribute('tabindex', isActive ? '0' : '-1');
		});

		tabPanels.forEach(panel => {
			panel.classList.toggle('is-hidden', panel.id !== targetId);
		});

		quickFooter?.classList.toggle('is-hidden', targetId !== 'quickPanel');
	};

	tabButtons.forEach(button => {
		button.setAttribute('tabindex', button.classList.contains('is-active') ? '0' : '-1');
		button.addEventListener('click', () => activateTab(button));
		button.addEventListener('keydown', event => {
			if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
				return;
			}

			event.preventDefault();
			const direction = event.key === 'ArrowRight' ? 1 : -1;
			const currentIndex = Array.from(tabButtons).indexOf(button);
			const nextIndex = (currentIndex + direction + tabButtons.length) % tabButtons.length;
			const nextTab = tabButtons[nextIndex];

			nextTab.focus();
			activateTab(nextTab);
		});
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

async function initializeCommandLists(historyManager, objectInput) {
	const pinsList = document.getElementById('pinsList');
	const historyList = document.getElementById('historyList');
	const clearHistoryBtn = document.getElementById('clearHistoryBtn');

	if (!pinsList || !historyList || !clearHistoryBtn) {
		console.error('Command list elements not found');
		return;
	}

	await updateCommandLists(historyManager, pinsList, historyList);

	clearHistoryBtn.addEventListener('click', async () => {
		await historyManager.clearHistory();
		await updateCommandLists(historyManager, pinsList, historyList);
	});

	const handleCommandListClick = async e => {
		const pinButton = e.target.closest('.history-pin-button');
		if (pinButton?.dataset.command) {
			await historyManager.togglePinned(pinButton.dataset.command);
			await updateCommandLists(historyManager, pinsList, historyList);
			return;
		}

		const historyItem = e.target.closest('.history-item');
		const command = historyItem?.dataset.command;

		if (!command) {
			return;
		}

		objectInput.value = command;
		objectInput.focus();
		await replayHistoryCommand(command, objectInput);
	};

	pinsList.addEventListener('click', handleCommandListClick);
	historyList.addEventListener('click', handleCommandListClick);
}

async function replayHistoryCommand(command, objectInput) {
	try {
		const parsedCommand = parseCommand(command);

		if (!parsedCommand) {
			objectInput.dispatchEvent(new Event('input', {bubbles: true}));
			return;
		}

		const {config, itemIdentifier, action} = parsedCommand;
		const session = await SessionManager.retrieveSession();
		const items = await NavigatorService.queryMetadata(session, config);
		const item = items.find(
			metadataItem => config.getItemIdentifier(metadataItem)?.toLowerCase() === itemIdentifier.toLowerCase()
		);

		if (!item) {
			objectInput.dispatchEvent(new Event('input', {bubbles: true}));
			return;
		}

		await NavigatorService.navigateToItem(item, action, config.urlConfig, config.prefix, config.getItemIdentifier);
	} catch (error) {
		ErrorHandler.handle(error, 'History Navigation Error');
	}
}

function parseCommand(command) {
	const prefixEndIndex = command.indexOf('.');

	if (prefixEndIndex === -1) {
		return null;
	}

	const prefix = command.slice(0, prefixEndIndex).toLowerCase();
	const config = MENU_CONFIGS[prefix];

	if (!config) {
		return null;
	}

	const commandBody = command.slice(prefixEndIndex + 1);
	const actionsBySpecificity = config.actions
		.filter(action => action.code)
		.sort((a, b) => b.code.length - a.code.length);
	const matchedAction = actionsBySpecificity.find(action => commandBody.toLowerCase().endsWith(`.${action.code.toLowerCase()}`));

	if (matchedAction) {
		return {
			config,
			itemIdentifier: commandBody.slice(0, -(matchedAction.code.length + 1)),
			action: matchedAction.code,
		};
	}

	const actionStartIndex = commandBody.lastIndexOf('.');

	if (actionStartIndex === -1) {
		return null;
	}

	return {
		config,
		itemIdentifier: commandBody.slice(0, actionStartIndex),
		action: commandBody.slice(actionStartIndex + 1),
	};
}

async function updateCommandLists(historyManager, pinsList, historyList) {
	const history = await historyManager.getHistory();
	const pinnedCommands = history.filter(item => item.pinned);
	const recentCommands = history.filter(item => !item.pinned);

	renderCommandList(pinsList, pinnedCommands, 'No pinned commands yet.');
	renderCommandList(historyList, recentCommands, 'No recent commands yet.');
}

function renderCommandList(historyList, history, emptyMessage) {
	historyList.innerHTML = '';

	if (history.length === 0) {
		const emptyItem = document.createElement('li');
		emptyItem.className = 'history-empty';
		emptyItem.textContent = emptyMessage;
		historyList.appendChild(emptyItem);
		return;
	}

	history.forEach(item => {
		const listItem = document.createElement('li');
		listItem.className = 'history-item';
		listItem.classList.toggle('is-pinned', Boolean(item.pinned));
		listItem.dataset.command = item.command;

		const commandText = document.createElement('span');
		commandText.className = 'history-item-code';
		commandText.textContent = item.command;

		const meta = document.createElement('span');
		meta.className = 'history-item-meta';

		const count = document.createElement('span');
		count.className = 'history-item-count';
		count.textContent = item.count;

		const pinButton = document.createElement('button');
		pinButton.type = 'button';
		pinButton.className = 'history-pin-button';
		pinButton.dataset.command = item.command;
		pinButton.setAttribute('aria-label', item.pinned ? 'Unpin command' : 'Pin command');
		pinButton.setAttribute('aria-pressed', String(Boolean(item.pinned)));
		pinButton.textContent = item.pinned ? 'Pinned' : 'Pin';

		meta.append(count, pinButton);
		listItem.append(commandText, meta);
		historyList.appendChild(listItem);
	});
}

async function updateInputWithGuideCode(codeElement, objectInput, historyManager) {
	const guideText = codeElement.textContent.trim();
	const prefix = codeElement.closest('.guide-group')?.dataset.prefix;
	const command = prefix ? `${prefix}.${guideText}` : guideText;

	objectInput.value = command;
	objectInput.focus();
	objectInput.dispatchEvent(new Event('input', {bubbles: true}));

	await historyManager.logCommand(command);

	const pinsList = document.getElementById('pinsList');
	const historyList = document.getElementById('historyList');
	if (pinsList && historyList) {
		await updateCommandLists(historyManager, pinsList, historyList);
	}
}
