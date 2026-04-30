import test from 'node:test';
import assert from 'node:assert/strict';

import DomainValidator from '../src/utils/domain-validator.js';

test('DomainValidator recognizes only Salesforce hostnames', () => {
	assert.equal(DomainValidator.isSalesforceHostname('example.my.salesforce.com'), true);
	assert.equal(DomainValidator.isSalesforceHostname('example.lightning.force.com'), true);
	assert.equal(DomainValidator.isSalesforceHostname('example--c.vf.force.com'), true);
	assert.equal(DomainValidator.isSalesforceHostname('example.salesforce-setup.com'), true);
	assert.equal(DomainValidator.isSalesforceHostname('not-salesforce.com'), false);
	assert.equal(DomainValidator.isSalesforceHostname('salesforce.com.evil.test'), false);
});

test('DomainValidator normalizes UI hostnames to API hostnames', () => {
	assert.equal(DomainValidator.getApiHostname('example.lightning.force.com'), 'example.my.salesforce.com');
	assert.equal(DomainValidator.getApiHostname('example.salesforce-setup.com'), 'example.my.salesforce.com');
	assert.equal(DomainValidator.getApiHostname('example.my.salesforce.com'), 'example.my.salesforce.com');
	assert.equal(DomainValidator.getApiHostname('example--c.vf.force.com'), 'example.my.salesforce.com');
	assert.equal(
		DomainValidator.getApiHostname('example--dev--c.sandbox.vf.force.com'),
		'example--dev.sandbox.my.salesforce.com'
	);
});

test('DomainValidator returns cookie candidates for a Lightning hostname', () => {
	assert.deepEqual(DomainValidator.getCookieDomainCandidates('example.lightning.force.com'), [
		'example.my.salesforce.com',
		'example.lightning.force.com',
		'example.salesforce.com',
	]);
});
