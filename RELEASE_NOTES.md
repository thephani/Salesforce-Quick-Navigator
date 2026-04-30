# Release Notes

## 6.0.0 - 04/30/2026

### Added

- Added a refreshed popup UI with a focused command panel, inline quick guide, and clearer Salesforce-only state.
- Added quick prefix buttons for Objects, Profiles, Permission Sets, Flows, Apps, Labels, and ESD commands.
- Added clickable guide examples that populate the command input.
- Added local command history with replay and clear actions.
- Added autocomplete keyboard navigation with Arrow Up, Arrow Down, and Enter.
- Added a visible cursor indicator for the active autocomplete option.
- Added listbox option semantics for autocomplete suggestions and actions.

### Changed

- Updated Salesforce host permissions to match all paths on supported Salesforce domains.
- Improved popup initialization so unsupported domains hide the main command UI.
- Updated autocomplete dropdown visibility handling to use the shared hidden state class.
- Improved the footer and feedback link presentation.

### Notes

- Command history is stored locally in browser storage.
- No analytics, tracking, or external telemetry services were added.
