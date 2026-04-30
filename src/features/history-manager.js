class HistoryManager {
  constructor() {
    this.HISTORY_LIMIT = 20;
    this.HISTORY_KEY = 'commandHistory';
    this._lastTimestamp = 0;
  }

  async logCommand(command) {
    const history = await this._getHistoryFromStorage();
    const now = this._getNextTimestamp();

    const existingEntryIndex = history.findIndex(
      (entry) => entry.command === command
    );

    if (existingEntryIndex !== -1) {
      history[existingEntryIndex].count += 1;
      history[existingEntryIndex].timestamp = now;
    } else {
      history.push({
        command,
        timestamp: now,
        count: 1,
      });
    }

    history.sort((a, b) => b.timestamp - a.timestamp);

    if (history.length > this.HISTORY_LIMIT) {
      history.length = this.HISTORY_LIMIT;
    }

    await this._saveHistoryToStorage(history);
  }

  async getHistory() {
    return await this._getHistoryFromStorage();
  }

  async clearHistory() {
    await chrome.storage.local.remove(this.HISTORY_KEY);
  }

  async _getHistoryFromStorage() {
    const result = await chrome.storage.local.get(this.HISTORY_KEY);
    return result[this.HISTORY_KEY] || [];
  }

  async _saveHistoryToStorage(history) {
    await chrome.storage.local.set({ [this.HISTORY_KEY]: history });
  }

  _getNextTimestamp() {
    const now = Date.now();
    this._lastTimestamp = Math.max(now, this._lastTimestamp + 1);
    return this._lastTimestamp;
  }
}

export default HistoryManager;
