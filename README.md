# Salesforce Quick Navigator

Chrome extension for jumping to Salesforce setup pages and metadata screens with short commands such as `Objects.Account.` or `Profiles.System Administrator.`.

## Current command flow

- `Objects.<object>.`
- `Profiles.<profile>.`
- `PermissionSets.<permset>.`
- `Flows.<flow>.`
- `Apps.<connected app>.`
- `Labels.<label>.`
- `ESD.<deployment>.`

Typing the entity prefix shows matching records. Typing a trailing `.` after an exact match opens the available action list for that item.

## Project structure

- [`popup.html`](popup.html): popup shell
- [`popus.js`](popus.js): popup bootstrap
- [`background.js`](background.js): cookie-backed session lookup
- [`src/features/autocomplete.js`](src/features/autocomplete.js): command parsing and suggestion flow
- [`src/features/menuItems`](src/features/menuItems): entity-specific query and navigation config
- [`src/core/api-service.js`](src/core/api-service.js): Salesforce REST/Tooling access
- [`src/utils/domain-validator.js`](src/utils/domain-validator.js): shared domain and cookie-host validation

## Local development

1. Load the extension as unpacked in Chrome from this repository root.
2. Open a Salesforce tab.
3. Open the extension popup and type commands like `Objects.Case.`.

## Tooling

- `npm test`: runs the small Node test suite
- `npm run check:syntax`: syntax-checks the main JS modules
- `npm run lint`: runs ESLint

## Permissions

- `cookies`: reads the Salesforce `sid` cookie for the active org host
- `tabs`: inspects the active tab URL to determine the current Salesforce domain
- `storage`: stores session data in extension session storage

## Notes

- The background worker is an ES module in Manifest V3.
- Command parsing is case-insensitive.
- Action routing still depends on Salesforce URL stability, so new entities and actions should be validated against a real org before release.

## Roadmap

- richer action autocomplete after the second dot
- keyboard navigation in suggestion lists
- recent commands and pinned shortcuts
- support for more metadata targets like Apex classes, queues, and custom metadata types

## Privacy

The privacy policy lives in [`PRIVACY.md`](PRIVACY.md).
