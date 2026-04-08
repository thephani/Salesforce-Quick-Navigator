import CommandHistoryService from './src/core/command-history.js';
import AutocompleteManager from './src/features/autocomplete.js';
import DomainValidator from './src/utils/domain-validator.js';

document.addEventListener('DOMContentLoaded', async () => {
	const objectInput = document.getElementById('objectInput');
	const autocompleteDropdown = document.getElementById('autocompleteDropdown');
	const container = document.querySelector('.container');
	const notSalesforceMessage = document.getElementById('not-salesforce-message');
	const pinnedList = document.getElementById('pinnedCommandsList');
	const recentList = document.getElementById('recentCommandsList');
	const pinnedEmpty = document.getElementById('pinnedCommandsEmpty');
	const recentEmpty = document.getElementById('recentCommandsEmpty');

	try {
		const isSalesforceDomain = await DomainValidator.isOnSalesforceDomain();

		if (!isSalesforceDomain) {
			container.classList.add('is-hidden');
			notSalesforceMessage.classList.remove('is-hidden');
			return;
		}

		const autocompleteManager = new AutocompleteManager(objectInput, autocompleteDropdown);
		objectInput.addEventListener('input', e => autocompleteManager.handleAutocomplete(e));

		const applyCommandSelection = command => {
			objectInput.value = command;
			objectInput.focus();
			objectInput.dispatchEvent(new Event('input', {bubbles: true}));
		};

		const renderHistory = async () => {
			const [recentCommands, pinnedCommands] = await Promise.all([
				CommandHistoryService.listRecent(),
				CommandHistoryService.listPinned(),
			]);

			renderCommandList({
				listElement: pinnedList,
				emptyElement: pinnedEmpty,
				commands: pinnedCommands,
				onSelect: applyCommandSelection,
				onTogglePin: async command => {
					await CommandHistoryService.unpinCommand(command);
					await renderHistory();
				},
				pinLabel: 'Unpin',
			});

			renderCommandList({
				listElement: recentList,
				emptyElement: recentEmpty,
				commands: recentCommands,
				onSelect: applyCommandSelection,
				onTogglePin: async command => {
					if (pinnedCommands.includes(command)) {
						await CommandHistoryService.unpinCommand(command);
					} else {
						await CommandHistoryService.pinCommand(command);
					}
					await renderHistory();
				},
				getPinLabel: command => (pinnedCommands.includes(command) ? 'Unpin' : 'Pin'),
			});
		};

		await renderHistory();

		const guideCodes = document.querySelectorAll('.guide-first-level');
		setupGuideCodeClickListeners(guideCodes, objectInput);
	} catch (error) {
		console.error('Domain validation error', error);
	}
});

function setupGuideCodeClickListeners(guideCodes, objectInput) {
	guideCodes.forEach(code => {
		code.style.cursor = 'pointer';
		code.addEventListener('click', () => updateInputWithGuideCode(code, objectInput));
	});
}

function updateInputWithGuideCode(codeElement, objectInput) {
	const guideText = codeElement.textContent.trim();
	objectInput.value = `${guideText}.`;
	objectInput.focus();

	const event = new Event('input', {bubbles: true});
	objectInput.dispatchEvent(event);
}

function renderCommandList({listElement, emptyElement, commands, onSelect, onTogglePin, pinLabel, getPinLabel}) {
	listElement.innerHTML = '';

	if (!commands.length) {
		emptyElement.classList.remove('is-hidden');
		return;
	}

	emptyElement.classList.add('is-hidden');
	commands.forEach(command => {
		const listItem = document.createElement('li');
		listItem.classList.add('history-item');

		const commandButton = document.createElement('button');
		commandButton.type = 'button';
		commandButton.classList.add('history-command-button');
		commandButton.textContent = command;
		commandButton.addEventListener('click', () => onSelect(command));

		const pinButton = document.createElement('button');
		pinButton.type = 'button';
		pinButton.classList.add('history-pin-button');
		pinButton.textContent = getPinLabel ? getPinLabel(command) : pinLabel;
		pinButton.addEventListener('click', async event => {
			event.stopPropagation();
			await onTogglePin(command);
		});

		listItem.append(commandButton, pinButton);
		listElement.appendChild(listItem);
	});
}
