'use strict';
/* MRLN advertised-product claim authority: explicitly honest development scope.
 * Upstream StarNet's 37-claim public release ledger is tied to its frozen code
 * snapshot and must never be rebranded as an MRLN certification.
 *
 * This verifies the claims actually made by the MRLN fork and fails closed
 * while licensed media, signed distribution, or native build proof are absent.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const conf=JSON.parse(read('src-tauri/tauri.conf.json'));
assert.equal(conf.identifier,'com.mrln.agentstation');
assert.equal(conf.productName,'MRLN Agent Station');
assert.equal(conf.bundle.createUpdaterArtifacts,false);
assert.deepEqual(conf.plugins.updater.endpoints,[]);

const readme=read('README.md');
const truthClaims=[
  ['identifies parent fork',/development fork of \[StarNet\]/i],
  ['warns installer is internal',/internal test use only/i],
  ['corrects GitHub ZIP confusion',/source code.*not an installer/i],
  ['points to fork Windows workflow',/merlinz7\/MRLN-Agent-Station\/actions\/workflows\/mrln-windows-build.yml/i],
  ['warns unsigned build',/unsigned/i],
  ['warns about noncleared assets',/MIT license covers source code/i],
  ['does not claim public release',/not.*public.*release/i]
];
for(const [label,pattern] of truthClaims)assert.match(readme,pattern,label);
assert.doesNotMatch(readme,/https:\/\/github\.com\/androoAGI\/starnet-releases\/releases\/latest/,
  'MRLN documentation must not send users to upstream StarNet installer');
assert.match(read('NOTICE.md'),/StarNet|Andrew/i,'keep upstream attribution');
const app=read('frontend/app/app.js');
assert.match(app,/fork of the open-source StarNet agent runtime/);
assert.match(app,/MRLN Agent Station/);
const ci=read('.github/workflows/mrln-windows-build.yml');
assert.match(ci,/Install and launch built MRLN/);
assert.match(ci,/mrln-windows-installed-smoke\.ps1/);
const proof=read('.github/workflows/mrln-visual-proof.yml');
assert.match(proof,/mrln-five-sector-proof\.mjs/);
const releaseGate=read('scripts/mrln-release-assets.mjs');
assert.match(releaseGate,/--strict-public/);
assert.match(releaseGate,/releaseEligible/);
assert.match(releaseGate,/windowsBundledUnresolved/);
assert.match(releaseGate,/sourceOnlyUnresolved/);
assert.match(read('frontend/index.html'),/EXTERNAL STARNET ACCOUNT/);
assert.match(read('frontend/app/mrln-sky.js'),/MRLN · ION VEIL/);
assert.match(read('frontend/app/mrln-crew-art.js'),/const CHARACTERS/);
const auditReport=path.join(root,'.mrln-audit/assets.json');
if(fs.existsSync(auditReport)){
  const audit=JSON.parse(fs.readFileSync(auditReport,'utf8'));
  assert.equal(audit.releaseEligible,audit.totals.unresolved===0&&Object.values(audit.checks).every(Boolean));
  assert.equal(audit.windowsInstallerRightsCleared,audit.distribution.windowsBundledUnresolved.files===0);
  assert.equal(audit.sourceRepositoryRightsCleared,audit.totals.unresolved===0);
}
console.log('MRLN scoped product claims: internal build evidence verifiable; public redistribution remains separately gated');
