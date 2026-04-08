import test from 'node:test';
import assert from 'node:assert/strict';

import {buildRecentCommands, MAX_RECENT_COMMANDS, normalizeCommand} from '../src/core/command-history.js';

test('normalizeCommand trims and collapses whitespace', () => {
	assert.equal(normalizeCommand('  Objects.   Case.   Details  '), 'Objects. Case. Details');
});

test('buildRecentCommands dedupes commands and keeps most recent first', () => {
	const recent = buildRecentCommands('Objects.Case.details', [
		'Profiles.Admin.View',
		'Objects.Case.details',
		'Objects.Account.fields',
	]);

	assert.deepEqual(recent, [
		'Objects.Case.details',
		'Profiles.Admin.View',
		'Objects.Account.fields',
	]);
});

test('buildRecentCommands caps results to MAX_RECENT_COMMANDS', () => {
	const existing = Array.from({length: MAX_RECENT_COMMANDS + 5}, (_, index) => `Objects.Command${index}.view`);
	const recent = buildRecentCommands('Objects.Newest.view', existing, MAX_RECENT_COMMANDS);

	assert.equal(recent.length, MAX_RECENT_COMMANDS);
	assert.equal(recent[0], 'Objects.Newest.view');
});
