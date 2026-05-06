# Salesforce Quick Navigator

Salesforce Quick Navigator is a Chrome extension for jumping directly to Salesforce setup and metadata pages with short commands.

## Features

- Command prefixes for Objects, Profiles, Permission Sets, Flows, Apps, Labels, Custom Metadata, Custom Settings, and Embedded Service Deployments.
- Autocomplete suggestions for matching metadata records.
- Keyboard navigation in autocomplete results with Arrow Up, Arrow Down, and Enter.
- A visible cursor on the active autocomplete option.
- Quick prefix buttons and clickable guide examples for common commands.
- Local command history with replay, pinning, and clear recent actions.
- Salesforce-domain validation before the extension UI is shown.
- Support for production, sandbox, setup, Lightning, and Visualforce Salesforce hostnames.
- Visible popup errors for session or metadata lookup failures.

## Command Format

Commands follow this shape:

```text
Prefix.Record.Action
```

Examples:

```text
Objects.Case.Fields
Profiles.System Administrator.SystemPermissions
PermSets.MyPermSet.assign users
Flows.Case Routing.builder
Apps.My Connected App.view
Labels.My Label.edit
CustomMetadata.My Metadata__mdt.manage
CustomSettings.My Setting__c.manager
ESD.My Deployment.branding
```

## Supported Salesforce Domains

- `*.salesforce.com`
- `*.sandbox.salesforce.com`
- `*.salesforce-setup.com`
- `*.my.salesforce-setup.com`
- `*.sandbox.salesforce-setup.com`
- `*.sandbox.my.salesforce-setup.com`
- `*.my.salesforce.com`
- `*.sandbox.my.salesforce.com`
- `*.lightning.force.com`
- `*.sandbox.lightning.force.com`
- `*.vf.force.com`
- `*.sandbox.vf.force.com`

## Release Notes

See [RELEASE_NOTES.md](RELEASE_NOTES.md) for the current release notes.

## Privacy Policy

### 1. Introduction

Salesforce Quick Navigator ("the Extension") is committed to protecting your privacy. This Privacy Policy explains how we handle information when you use our Chrome Extension.

### 2. Information Collection and Use

#### 2.1 No Personal Data Collection

- The Extension does not collect, store, or transmit personal user data to external services.
- No personally identifiable information (PII) is gathered.
- No user activity is tracked by analytics services.

#### 2.2 Chrome Tab Permissions

- The Extension only accesses active Salesforce tabs.
- Permission is used solely for reading the current Salesforce domain and navigating to specific setup pages.
- No access to tab content outside supported Salesforce domains is required for normal operation.

### 3. Permissions Explanation

#### 3.1 activeTab and tabs Permissions

- Used to interact with the current browser tab and open Salesforce setup pages.
- Limited to user-initiated extension actions.

#### 3.2 storage Permission

- Used to store command history locally in the browser.
- History remains on the user's machine and can be cleared from the extension UI.

#### 3.3 cookies Permission

- Used only as needed to support Salesforce session-aware navigation.

### 4. Data Security

- Extension functionality runs locally in the browser.
- No remote code execution is used.
- No analytics, tracking, or external telemetry services are used.

### 5. User Consent

- By installing the extension, you agree to these terms.
- Users can uninstall the extension at any time.

### 6. Third-Party Services

- The Extension operates independently.
- No analytics or tracking services are used.
- No data is shared with external parties.

### 7. Changes to Privacy Policy

- This policy may be updated periodically.
- Users are advised to review it periodically.
- Significant changes will be communicated through release notes or store listing updates.

### 8. Compliance

- Adheres to Chrome Web Store policies.
- Follows web extension best practices.
- Describes extension capabilities transparently.

### 9. Disclaimer

The extension is provided "as is" without warranties. Users are responsible for their Salesforce configuration actions.

---

Last Updated: 05/06/2026  
Version: 8.1.1

© thePhani.com - All Rights Reserved
