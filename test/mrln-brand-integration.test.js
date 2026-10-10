'use strict';
/* Independent MRLN product identity: no accidental upstream update or account claims.
 * Run: node test/mrln-brand-integration.test.js
 * Source contract only; this is not a browser or Windows installation proof.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const app = read('frontend/app/app.js');
const html = read('frontend/index.html');
const conf = JSON.parse(read('src-tauri/tauri.conf.json'));
assert.equal(conf.identifier, 'com.mrln.agentstation');
assert.equal(conf.productName, 'MRLN Agent Station');
assert.equal(conf.bundle.createUpdaterArtifacts, false);
assert.deepEqual(conf.plugins.updater.endpoints, []);
assert.match(app, /operating from a workstation aboard MRLN Agent Station/);
const section = app.split('function foundationClause() {')[1]?.split('// the orchestrator')[0];
assert.ok(section, 'foundationClause source must be present');
assert.match(section, /inside MRLN Agent Station/);
assert.match(section, /fork of the open-source StarNet agent runtime/);
assert.doesNotMatch(section, /You are a StarNet agent on the StarNet harness/);
assert.match(html, /aria-label="MRLN Agent Station booting"/);
assert.match(html, /aria-label="MRLN Agent Station boot screen"/);
assert.match(html, /EXTERNAL STARNET ACCOUNT/);
assert.doesNotMatch(html, /UPDATE STARNET/);
const gate = app.split('function showFutureSaveGate(version) {')[1]?.split('function showSaveRecoveryGate(')[0];
assert.ok(gate, 'newer-save protection gate must remain');
assert.match(gate, /This MRLN test build does not support automatic updates/);
assert.match(gate, /merlinz7\/MRLN-Agent-Station\/actions\/workflows\/mrln-windows-build.yml/);
assert.match(gate, /show\('screen-future'\)/);
assert.match(app, /gateActive = true/);
const updates = read('frontend/app/updates.js');
assert.match(updates, /const MANUAL_ONLY = true/);
assert.match(updates, /MRLN WINDOWS TEST BUILDS/);
assert.match(updates, /merlinz7\/MRLN-Agent-Station\/actions\/workflows\/mrln-windows-build.yml/);
assert.match(updates, /Automatic installation is disabled for MRLN test builds/);
console.log('MRLN brand, legacy credit labeling, safe newer-save gate and updater isolation verified');
