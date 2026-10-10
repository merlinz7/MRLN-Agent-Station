#!/usr/bin/env node
'use strict';
/* Fork-specific T5 distribution gate: upstream StarNet signed-update fixtures
 * cannot establish MRLN release authority when MRLN has NO updater feed.
 * This gate verifies independent identity and fails closed for uncleared art.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const ROOT=path.resolve(__dirname,'..');
const conf=JSON.parse(fs.readFileSync(path.join(ROOT,'src-tauri/tauri.conf.json'),'utf8'));
assert.equal(conf.identifier,'com.mrln.agentstation','MRLN app identity differs from upstream');
assert.equal(conf.productName,'MRLN Agent Station');
assert.equal(conf.bundle.createUpdaterArtifacts,false,'must not produce StarNet updater artifacts');
assert.deepEqual(conf.plugins.updater.endpoints,[],'must not use StarNet public update feed');
const manifest=path.join(ROOT,'scripts/mrln-release-assets.mjs');
const run=spawnSync(process.execPath,[manifest,'--strict-public'],{cwd:ROOT,encoding:'utf8',maxBuffer:5*1024*1024});
if(run.error)throw run.error;
const report=JSON.parse(fs.readFileSync(path.join(ROOT,'.mrln-audit/assets.json'),'utf8'));
assert.equal(report.scope,'MRLN independent redistribution rights');
assert.ok(report.checks.updaterDisabled);
assert.ok(report.checks.appIdentifierDistinct);
assert.ok(report.distribution.windowsBundledUnresolved);
assert.ok(report.distribution.sourceOnlyUnresolved);
assert.ok(report.totals.unresolved===report.unresolvedInherited.length,'no untracked clearance exemptions');
assert.equal(report.releaseEligible,
  report.totals.unresolved===0&&Object.values(report.checks).every(Boolean),
  'only all cleared assets and safe product identity allow release');
if(report.releaseEligible){
 assert.equal(run.status,0,'cleared release must pass strict audit');
}else{
 assert.equal(run.status,2,'uncleared release must be BLOCKED');
 assert.match(run.stderr,/BLOCKED: independently distributable MRLN release not cleared/);
}
assert.ok(report.largestUnresolvedDirectories instanceof Array);
console.log('MRLN public distribution truth gate: '+(report.releaseEligible?'ELIGIBLE':'BLOCKED')+
 ' | installed-runtime unresolved='+report.distribution.windowsBundledUnresolved.files+
 ' | source-tree unresolved='+report.totals.unresolved);
