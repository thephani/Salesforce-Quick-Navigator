import test from 'node:test';
import assert from 'node:assert/strict';

import {parseCommandInput} from '../src/features/autocomplete.js';

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
