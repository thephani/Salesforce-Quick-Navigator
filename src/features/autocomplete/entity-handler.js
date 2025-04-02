import SessionManager from '../core/session-manager.js';
import ObjectNavigator from './object-navigator.js';
import ProfileNavigator from './profile-navigator.js';
import FlowNavigator from './flow-navigator.js';
import {STATES} from './state-manager.js';

const ENTITY_HANDLERS = {
	objects: {
		query: session => ObjectNavigator.queryAvailableObjects(session),
		filterKeys: ['label', 'apiName'],
		render: (data, instance) => ObjectNavigator.renderObjectSuggestions(data, instance.dropdownElement, instance.inputElement),
	},
	profiles: {
		query: session => ProfileNavigator.queryAvailableProfiles(session),
		filterKeys: ['name'],
		render: (data, instance) => ProfileNavigator.renderProfileSuggestions(data, instance.dropdownElement, instance.inputElement),
	},
	flows: {
		query: session => FlowNavigator.queryAvailableFlows(session),
		filterKeys: ['label'],
		render: (data, instance) => FlowNavigator.renderFlowSuggestions(data, instance.dropdownElement, instance.inputElement),
	},
};

export async function handleInitialAutocomplete(input, instance) {
	const session = await SessionManager.retrieveSession();
	const entityType = Object.keys(ENTITY_HANDLERS).find(type => input.startsWith(type + '.'));

	if (!entityType) return;

	const {query, filterKeys, render} = ENTITY_HANDLERS[entityType];
	const modifiedInput = input.replace(`${entityType}.`, '');

	const items = await query(session);
	const filteredItems = items.filter(item => filterKeys.some(key => item[key].toLowerCase().includes(modifiedInput)));

	console.log(`Filtered ${entityType}:`, filteredItems);
	await render(filteredItems, instance);
}

export function handleActionAutocomplete(input, instance) {
	if (!input.includes('.')) {
		instance.currentState = STATES.INITIAL;
		instance.selectedItem = null;
		instance.dropdownElement.style.display = 'none';
		instance.dropdownElement.innerHTML = '';
	}
}
