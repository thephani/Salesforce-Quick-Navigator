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
        pinned: false,
      });
    }

    await this._saveHistoryToStorage(this._sortAndLimitHistory(history));
  }

  async getHistory() {
    const history = await this._getHistoryFromStorage();
    return this._sortAndLimitHistory(history);
  }

  async clearHistory() {
    const history = await this._getHistoryFromStorage();
    const pinnedHistory = history.filter((entry) => entry.pinned);

    if (pinnedHistory.length === 0) {
      await chrome.storage.local.remove(this.HISTORY_KEY);
      return;
    }

    await this._saveHistoryToStorage(this._sortAndLimitHistory(pinnedHistory));
  }

  async togglePinned(command) {
    const history = await this._getHistoryFromStorage();
    const now = this._getNextTimestamp();
    let entry = history.find((historyEntry) => historyEntry.command === command);

    if (!entry) {
      entry = {
        command,
        timestamp: now,
        count: 0,
        pinned: true,
        pinnedAt: now,
      };
      history.push(entry);
    } else {
      entry.pinned = !entry.pinned;
      entry.pinnedAt = entry.pinned ? now : undefined;
    }

    await this._saveHistoryToStorage(this._sortAndLimitHistory(history));
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

  _sortAndLimitHistory(history) {
    const normalizedHistory = history.map((entry) => ({
      ...entry,
      count: entry.count ?? 1,
      pinned: Boolean(entry.pinned),
    }));

    const pinnedHistory = normalizedHistory
      .filter((entry) => entry.pinned)
      .sort((a, b) => (b.pinnedAt || b.timestamp) - (a.pinnedAt || a.timestamp));

    const recentHistory = normalizedHistory
      .filter((entry) => !entry.pinned)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, this.HISTORY_LIMIT);

    return [...pinnedHistory, ...recentHistory];
  }
}

export default HistoryManager;
