import {APPS_MENU_CONFIG} from './apps.menu.js';
import {CUSTOM_METADATA_MENU_CONFIG} from './custom-metadata.menu.js';
import {CUSTOM_SETTINGS_MENU_CONFIG} from './custom-settings.menu.js';
import {ESD_MENU_CONFIG} from './esd.menu.js';
import {FLOWS_MENU_CONFIG} from './flows.menu.js';
import {LABELS_MENU_CONFIG} from './labels.menu.js';
import {OBJECTS_MENU_CONFIG} from './objects.menu.js';
import {PERMSETS_MENU_CONFIG} from './permsets.menu.js';
import {PROFILES_MENU_CONFIG} from './profiles.menu.js';

export const MENU_CONFIGS = {
	objects: OBJECTS_MENU_CONFIG,
	apps: APPS_MENU_CONFIG,
	profiles: PROFILES_MENU_CONFIG,
	flows: FLOWS_MENU_CONFIG,
	permsets: PERMSETS_MENU_CONFIG,
	labels: LABELS_MENU_CONFIG,
	esd: ESD_MENU_CONFIG,
	custommetadata: CUSTOM_METADATA_MENU_CONFIG,
	customsettings: CUSTOM_SETTINGS_MENU_CONFIG,
};
