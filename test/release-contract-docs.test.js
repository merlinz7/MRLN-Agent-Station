'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const releaseTrain = read('.github/workflows/release-train.yml');
const install = read('INSTALL.md');
const readme = read('README.md');
const download = read('docs/DOWNLOAD_PAGE.md');
const runbook = read('docs/RELEASE_RUNBOOK.md');
const tauri = JSON.parse(read('src-tauri/tauri.conf.json'));
const isMrlnFork = tauri.identifier === 'com.mrln.agentstation';
const hostVerifier = read('scripts/verify-update-host.mjs');
const website = [
  read('website/index.html'),
  read('website/docs/getting-started.html'),
  read('website/docs/troubleshooting.html')
].join('\n');

const buildMatrix = releaseTrain.match(/\n  build:\n[\s\S]*?\n    runs-on:/);
assert.ok(buildMatrix, 'release train build matrix is readable');
assert.match(buildMatrix[0], /target: win-x64/);
assert.match(buildMatrix[0], /target: darwin-arm64/);
assert.match(buildMatrix[0], /target: darwin-x64/);
assert.doesNotMatch(buildMatrix[0], /target: linux/,
  'the tagged public release train does not build a Linux leg');

assert.match(install, /Linux is not[\s\S]{0,80}supported release target/i,
  'install guide says Linux is not a supported public target');
if (isMrlnFork) {
  // MRLN currently ships an INTERNAL Windows CI installer. It must not
  // impersonate the signed Windows+macOS StarNet release train or its downloads.
  assert.match(readme, /Windows test builds \(GitHub Actions\)/,
    'MRLN README links only to its own internal Windows test builds');
  assert.match(readme, /installer build passing does not alone prove/i,
    'MRLN README distinguishes installer compilation from installed launch proof');
  assert.match(readme, /internal test use only/i,
    'MRLN README explicitly discloses test-only release status');
  assert.match(readme, /inherited StarNet graphical assets/i,
    'MRLN README discloses uncleared upstream artwork');
  assert.doesNotMatch(readme, /\[Download\]\(https:\/\/github\.com\/androoAGI\/starnet-releases/i,
    'MRLN README does not send users to StarNet installers');
} else {
  assert.match(readme, /pipeline requirements, not proof/i,
    'upstream README distinguishes workflow requirements from installed evidence');
}
assert.match(install, /release-pipeline requirements[\s\S]{0,180}not installed proof/i,
  'install guide does not turn release workflow code into installed proof');
assert.match(download, /pipeline contract, not installed proof/i,
  'download copy preserves the evidence boundary');
assert.match(hostVerifier,
  /const DEFAULT_REQUIRE = 'windows-x86_64,darwin-aarch64,darwin-x86_64';/,
  'the canonical updater verifier defaults to the same three supported targets as the train');
assert.match(runbook, /all three supported platform keys[\s\S]{0,180}windows-x86_64, darwin-aarch64, and darwin-x86_64/i,
  'the release runbook requires the same three supported targets');
assert.doesNotMatch(runbook, /all five platform keys/i,
  'the release runbook does not restore the retired five-platform public contract');
assert.match(website, /release checks do not prove that an installer works on your computer/i,
  'website preserves the evidence boundary');

const stale = /unsigned and un-notarized|isn't Apple-notarized|Until StarNet is Apple-notarized|None of the builds are code-signed|Linux builds come off[\s\S]{0,80}release train|fully supported from day one/i;
for (const [name, source] of [
  ['README', readme],
  ['install guide', install],
  ['download copy', download],
  ['website install pages', website]
]) {
  assert.doesNotMatch(source, stale, name + ' does not restore the pre-signing/pre-platform-contract copy');
}

assert.match(install, /Do \*\*not\*\* clear quarantine with[\s\S]{0,40}`xattr`/i,
  'public Mac instructions do not normalize bypassing a missing notarization verdict');
assert.match(website, /Do not clear quarantine/i,
  'website treats a public Mac Gatekeeper failure as reportable, not expected');

// The arm64 DMG targets aarch64-apple-darwin with no chip gate, so the public copy describes the family
// ("M1 or later"), never a closed list that goes stale the day a new chip ships (an M5 Pro customer asked).
// It must not claim any particular chip was tested either.
const desktopBuild = read('.github/workflows/desktop-build.yml');
const searchIndex = read('website/docs/search-index.js');
const closedChipList = /\bM1\s*(?:[–-]|\/\s*M2\s*\/\s*M3\s*\/)\s*M4\b|\bM1 \/ M2 \/ M3 \/ M4\b/;
for (const [name, source] of Object.entries({ readme, install, download, website, desktopBuild, searchIndex })) {
  assert.doesNotMatch(source, closedChipList, name + ' must not hard-code a closed Apple Silicon chip list');
}
for (const [name, source] of Object.entries(isMrlnFork
  ? { install, download, website }
  : { readme, install, download, website })) {
  assert.match(source, /Apple Silicon[\s\S]{0,60}M1 or later/, name + ' describes supported Apple Silicon as M1 or later');
}

console.log('release contract docs tests passed');
