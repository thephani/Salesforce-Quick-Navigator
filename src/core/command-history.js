const STORAGE_KEYS = {
	recent: 'commandHistoryRecent',
	pinned: 'commandHistoryPinned',
};

const MAX_RECENT_COMMANDS = 20;

export function normalizeCommand(command = '') {
	return command.trim().replace(/\s+/g, ' ');
}

function uniqMostRecent(commands) {
	const seen = new Set();
	const deduped = [];

	commands.forEach(command => {
		if (!command || seen.has(command)) {
			return;
		}

		seen.add(command);
		deduped.push(command);
	});

	return deduped;
}

export function buildRecentCommands(nextCommand, existing = [], max = MAX_RECENT_COMMANDS) {
	const normalized = normalizeCommand(nextCommand);
	if (!normalized) {
		return uniqMostRecent(existing.map(normalizeCommand)).slice(0, max);
	}

	const allCommands = [normalized, ...existing.map(normalizeCommand)];
	return uniqMostRecent(allCommands).slice(0, max);
}

function readStorage(keys) {
	return chrome.storage.local.get(keys);
}

function writeStorage(data) {
	return chrome.storage.local.set(data);
}

class CommandHistoryService {
	static async listRecent() {
		const result = await readStorage([STORAGE_KEYS.recent]);
		const recent = result[STORAGE_KEYS.recent] || [];
		return uniqMostRecent(recent.map(normalizeCommand)).slice(0, MAX_RECENT_COMMANDS);
	}

	static async listPinned() {
		const result = await readStorage([STORAGE_KEYS.pinned]);
		const pinned = result[STORAGE_KEYS.pinned] || [];
		return uniqMostRecent(pinned.map(normalizeCommand));
	}

	static async addRecent(command) {
		const recent = await CommandHistoryService.listRecent();
		const nextRecent = buildRecentCommands(command, recent, MAX_RECENT_COMMANDS);
		await writeStorage({[STORAGE_KEYS.recent]: nextRecent});
		return nextRecent;
	}

	static async pinCommand(command) {
		const normalized = normalizeCommand(command);
		if (!normalized) {
			return CommandHistoryService.listPinned();
		}

		const pinned = await CommandHistoryService.listPinned();
		const nextPinned = uniqMostRecent([normalized, ...pinned]);
		await writeStorage({[STORAGE_KEYS.pinned]: nextPinned});
		return nextPinned;
	}

	static async unpinCommand(command) {
		const normalized = normalizeCommand(command);
		const pinned = await CommandHistoryService.listPinned();
		const nextPinned = pinned.filter(item => item !== normalized);
		await writeStorage({[STORAGE_KEYS.pinned]: nextPinned});
		return nextPinned;
	}
}

export {MAX_RECENT_COMMANDS};
export default CommandHistoryService;
