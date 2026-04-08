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

test('parseCommandInput supports ApexClasses command flow', () => {
	const parsed = parseCommandInput('ApexClasses.CaseRouter.security');

	assert.deepEqual(parsed, {
		entityKey: 'apexclasses',
		searchTerm: 'caserouter',
		actionTerm: 'security',
		endsWithDot: false,
	});
});

test('parseCommandInput supports Queues command flow with spaces', () => {
	const parsed = parseCommandInput('Queues.Case Queue.members');

	assert.deepEqual(parsed, {
		entityKey: 'queues',
		searchTerm: 'case queue',
		actionTerm: 'members',
		endsWithDot: false,
	});
});

test('parseCommandInput supports CMDT command flow and trailing dot', () => {
	const parsed = parseCommandInput('CMDT.Invoice_Config__mdt.');

	assert.deepEqual(parsed, {
		entityKey: 'cmdt',
		searchTerm: 'invoice_config__mdt',
		actionTerm: '',
		endsWithDot: true,
	});
});

test('parseCommandInput returns null for unsupported prefixes', () => {
	assert.equal(parseCommandInput('foo.bar'), null);
});
