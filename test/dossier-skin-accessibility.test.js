'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const A = require('./_assert.js');

const source = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'app', 'stationui.js'), 'utf8');
const start = source.indexOf('  function agCommand(a) {');
const end = source.indexOf('\n  function agGrowth(a) {', start);

A.ok(start >= 0 && end > start, 'the dossier skin renderer can be isolated from stationui.js');

const render = vm.runInNewContext(
  source.slice(start, end) + '\n  agCommand;',
  {
    DATA: {
      DEFAULT_SKIN: 'cadet',
      SKINS: {
        cadet: { name: 'Cadet', set: 'cadet' },
        bear: { name: 'Teddy Bear', set: 'bear' }
      }
    },
    access: { config: { crewCount: () => 1 } },
    present: [{ id: 'agent' }],
    esc: value => String(value)
  }
);

for (const selected of ['cadet', 'bear']) {
  const html = render({ id: 'agent', role: 'orchestrator', skin: selected });
  const buttons = [...html.matchAll(/<button type="button" class="skin-thumb ag-skin-thumb([^"]*)"[^>]*data-skin="([^"]+)"[^>]*aria-pressed="([^"]+)"/g)]
    .map(match => ({ className: match[1], skin: match[2], pressed: match[3] }));

  A.eq(buttons.length, 2, 'every dossier skin button exposes its pressed state');
  A.eq(buttons.filter(button => button.pressed === 'true').length, 1, 'exactly one dossier skin is announced as selected');
  const announced = buttons.find(button => button.pressed === 'true');
  const visual = buttons.find(button => button.skin === selected);
  A.eq(announced && announced.skin, selected, 'aria-pressed follows the skin the agent actually wears');
  A.ok(visual && visual.className.includes('sel'), 'the visual selection matches the announced selection');
  A.ok(buttons.filter(button => button.skin !== selected).every(button => button.pressed === 'false'),
    'every unselected dossier skin is announced as unpressed');
}

// Existing stations can retain the retired Minion ID. Its approved replacement must still
// announce exactly one selected tile, without silently rewriting the saved agent record.
const production = vm.createContext({ access: { config: { crewCount: () => 26 } }, present: [], esc: String });
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'frontend/app/data-shim.js'), 'utf8'), production);
const renderProduction = vm.runInContext(source.slice(start, end) + '\n agCommand;', production);
const legacyAgent = { id: 'existing-agent', skin: 'minionchar' };
const legacyHtml = renderProduction(legacyAgent);
const selected = [...legacyHtml.matchAll(/data-skin="([^"]+)"[^>]*aria-pressed="true"/g)].map(m => m[1]);
A.eq(selected, ['station_minion'], 'retired saved ID highlights its approved replacement');
A.eq(legacyAgent.skin, 'minionchar', 'rendering the picker preserves the saved ID');
A.ok(legacyHtml.includes('assets/sprites/approved_station_minion/rot_south.png'), 'replacement tile shows approved artwork');
// MRLN's generator publishes SVG data-URI thumbnails; never silently request
// missing PNG masters for one of the new selectable animated crew outfits.
const mrlnCtx = vm.createContext({
  DATA: {
    DEFAULT_SKIN: 'mrln_nova',
    SKINS: {
      cadet: { name: 'Legacy Cadet', set: 'cadet' },
      mrln_nova: { name: 'MRLN Nova', set: 'mrln_nova' },
      mrln_atlas: { name: 'MRLN Atlas', set: 'mrln_atlas' }
    }
  },
  MRLNCrewArt: {
    skinIds: ['mrln_nova', 'mrln_atlas'],
    isOriginalSet: set => set.startsWith('mrln_'),
    still: set => 'data:image/svg+xml;charset=utf-8,' + set
  },
  esc: String
});
const renderMrln = vm.runInContext(source.slice(start, end) + '\n agCommand;', mrlnCtx);
const mrlnHtml = renderMrln({ id: 'agent', skin: 'cadet' });
A.ok(mrlnHtml.indexOf('data-skin="mrln_nova"') < mrlnHtml.indexOf('data-skin="cadet"'),
  'MRLN original skins appear before legacy choices in an existing agent dossier');
A.ok(mrlnHtml.includes('src="data:image/svg+xml;charset=utf-8,mrln_atlas"'),
  'MRLN original Atlas uses its generated real thumbnail, never a missing PNG path');
A.ok(mrlnHtml.includes('src="assets/sprites/cadet/rot_south.png"'),
  'saved upstream skin remains available with its unchanged image');
A.ok(/data-skin="cadet"[^>]*aria-pressed="true"/.test(mrlnHtml),
  'reordering choices does not replace the user-selected saved legacy skin');

A.report('dossier-skin-accessibility.test');
