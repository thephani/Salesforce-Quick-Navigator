import test from 'node:test';
import assert from 'node:assert/strict';

import AutocompleteManager, {getNextActiveIndex, parseCommandInput} from '../src/features/autocomplete.js';

test('parseCommandInput extracts entity, search term, and action term', () => {
	const parsed = parseCommandInput('Objects.Case.Details');

	assert.deepEqual(parsed, {
		entityKey: 'objects',
		searchTerm: 'case',
		actionTerm: 'details',
		endsWithDot: false,
	});
});

test('parseCommandInput tracks trailing dot for action menus', () => {
	const parsed = parseCommandInput('Objects.Case.');

	assert.equal(parsed.entityKey, 'objects');
	assert.equal(parsed.searchTerm, 'case');
	assert.equal(parsed.actionTerm, '');
	assert.equal(parsed.endsWithDot, true);
});

test('parseCommandInput returns null for unsupported prefixes', () => {
	assert.equal(parseCommandInput('foo.bar'), null);
});

test('getNextActiveIndex cycles correctly for ArrowDown and ArrowUp', () => {
	assert.equal(getNextActiveIndex(-1, 3, 'ArrowDown'), 0);
	assert.equal(getNextActiveIndex(0, 3, 'ArrowDown'), 1);
	assert.equal(getNextActiveIndex(2, 3, 'ArrowDown'), 0);

	assert.equal(getNextActiveIndex(-1, 3, 'ArrowUp'), 2);
	assert.equal(getNextActiveIndex(2, 3, 'ArrowUp'), 1);
	assert.equal(getNextActiveIndex(0, 3, 'ArrowUp'), 2);
});

test('handleKeydown Enter triggers click on highlighted suggestion', () => {
	const itemA = createClickableItem('autocomplete-suggestion-0', 'suggestion');
	const itemB = createClickableItem('autocomplete-suggestion-1', 'suggestion');
	const manager = createManager([itemA, itemB]);
	manager.activeIndices.suggestion = 1;

	const event = createKeyboardEvent('Enter');
	manager.handleKeydown(event);

	assert.equal(event.defaultPrevented, true);
	assert.equal(itemA.clickCount, 0);
	assert.equal(itemB.clickCount, 1);
});

test('handleKeydown ArrowDown updates active descendant and selected state', () => {
	const itemA = createClickableItem('autocomplete-action-0', 'action');
	const itemB = createClickableItem('autocomplete-action-1', 'action');
	const manager = createManager([itemA, itemB]);

	manager.handleKeydown(createKeyboardEvent('ArrowDown'));

	assert.equal(manager.activeIndices.action, 0);
	assert.equal(itemA.classList.contains('is-active'), true);
	assert.equal(itemA.attributes['aria-selected'], 'true');
	assert.equal(itemB.attributes['aria-selected'], 'false');
	assert.equal(manager.inputElement.attributes['aria-activedescendant'], 'autocomplete-action-0');
});

function createKeyboardEvent(key) {
	return {
		key,
		defaultPrevented: false,
		preventDefault() {
			this.defaultPrevented = true;
		},
	};
}

function createManager(items) {
	const inputElement = createInputElement();
	const dropdownElement = {
		id: 'autocompleteDropdown',
		querySelectorAll: () => items,
		setAttribute() {},
	};

	return new AutocompleteManager(inputElement, dropdownElement);
}

function createInputElement() {
	return {
		attributes: {},
		setAttribute(name, value) {
			this.attributes[name] = value;
		},
	};
}

function createClickableItem(id, itemType) {
	const classes = new Set(['autocomplete-item', 'is-clickable']);

	return {
		id,
		dataset: {itemType},
		attributes: {'aria-selected': 'false'},
		clickCount: 0,
		classList: {
			add(value) {
				classes.add(value);
			},
			remove(value) {
				classes.delete(value);
			},
			contains(value) {
				return classes.has(value);
			},
		},
		setAttribute(name, value) {
			this.attributes[name] = value;
		},
		click() {
			this.clickCount += 1;
		},
	};
}
