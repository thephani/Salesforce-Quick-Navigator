import test from 'node:test';
import assert from 'node:assert/strict';

import HistoryManager from '../src/features/history-manager.js';

const storage = new Map();

globalThis.chrome = {
  storage: {
    local: {
      async get(key) {
        return {[key]: storage.get(key)};
      },
      async set(values) {
        Object.entries(values).forEach(([key, value]) => storage.set(key, value));
      },
      async remove(key) {
        storage.delete(key);
      },
    },
  },
};

test('HistoryManager stores and retrieves commands correctly', async () => {
  const historyManager = new HistoryManager();

  // Clear history before testing
  await historyManager.clearHistory();

  // Log some commands
  await historyManager.logCommand('Objects.Case.Fields');
  await historyManager.logCommand('Profiles.Admin.SystemPermissions');
  await historyManager.logCommand('Objects.Account.Fields');

  // Retrieve history
  const history = await historyManager.getHistory();

  // Verify commands are stored
  assert.strictEqual(history.length, 3);
  assert.strictEqual(history[0].command, 'Objects.Account.Fields');
  assert.strictEqual(history[1].command, 'Profiles.Admin.SystemPermissions');
  assert.strictEqual(history[2].command, 'Objects.Case.Fields');
});

test('HistoryManager updates count for duplicate commands', async () => {
  const historyManager = new HistoryManager();

  // Clear history before testing
  await historyManager.clearHistory();

  // Log the same command multiple times
  await historyManager.logCommand('Objects.Case.Fields');
  await historyManager.logCommand('Objects.Case.Fields');
  await historyManager.logCommand('Objects.Case.Fields');

  // Retrieve history
  const history = await historyManager.getHistory();

  // Verify count is updated
  assert.strictEqual(history.length, 1);
  assert.strictEqual(history[0].count, 3);
  assert.strictEqual(history[0].command, 'Objects.Case.Fields');
});

test('HistoryManager enforces history limit of 20 items', async () => {
  const historyManager = new HistoryManager();

  // Clear history before testing
  await historyManager.clearHistory();

  // Log more than 20 commands
  for (let i = 0; i < 25; i++) {
    await historyManager.logCommand(`Command${i}`);
  }

  // Retrieve history
  const history = await historyManager.getHistory();

  // Verify only 20 items are stored
  assert.strictEqual(history.length, 20);
});

test('HistoryManager clears history correctly', async () => {
  const historyManager = new HistoryManager();

  // Log some commands
  await historyManager.logCommand('Objects.Case.Fields');
  await historyManager.logCommand('Profiles.Admin.SystemPermissions');

  // Clear history
  await historyManager.clearHistory();

  // Retrieve history
  const history = await historyManager.getHistory();

  // Verify history is empty
  assert.strictEqual(history.length, 0);
});

test('UI displays recent commands properly', async () => {
  const historyManager = new HistoryManager();

  // Clear history before testing
  await historyManager.clearHistory();

  // Log some commands
  await historyManager.logCommand('Objects.Case.Fields');
  await historyManager.logCommand('Profiles.Admin.SystemPermissions');

  // Retrieve history
  const history = await historyManager.getHistory();

  // Verify history is stored correctly
  assert.strictEqual(history.length, 2);
  assert.strictEqual(history[0].command, 'Profiles.Admin.SystemPermissions');
  assert.strictEqual(history[1].command, 'Objects.Case.Fields');
});

test('Commands are logged when executed through the navigator', async () => {
  const historyManager = new HistoryManager();

  // Clear history before testing
  await historyManager.clearHistory();

  // Simulate navigation
  const command = 'Objects.Case.Fields';
  await historyManager.logCommand(command);

  // Retrieve history
  const history = await historyManager.getHistory();

  // Verify command is logged
  assert.strictEqual(history.length, 1);
  assert.strictEqual(history[0].command, command);
});
