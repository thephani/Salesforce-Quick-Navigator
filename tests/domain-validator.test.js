import test from 'node:test';
import assert from 'node:assert/strict';

import DomainValidator from '../src/utils/domain-validator.js';

test('isSalesforceHostname accepts supported Salesforce domains', () => {
	assert.equal(DomainValidator.isSalesforceHostname('mydomain.my.salesforce.com'), true);
	assert.equal(DomainValidator.isSalesforceHostname('mydomain.lightning.force.com'), true);
	assert.equal(DomainValidator.isSalesforceHostname('mydomain.salesforce-setup.com'), true);
});

test('isSalesforceHostname rejects lookalike domains', () => {
	assert.equal(DomainValidator.isSalesforceHostname('salesforce.com.example.org'), false);
	assert.equal(DomainValidator.isSalesforceHostname('fake-lightning.force.com.example.org'), false);
});

test('getCookieDomainCandidates returns normalized Salesforce cookie hosts', () => {
	const candidates = DomainValidator.getCookieDomainCandidates('mydomain.lightning.force.com');

	assert.ok(candidates.includes('mydomain.lightning.force.com'));
	assert.ok(candidates.includes('mydomain.my.salesforce.com'));
	assert.ok(candidates.includes('mydomain.salesforce.com'));
});
