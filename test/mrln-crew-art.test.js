'use strict';
/* MRLN original sprite generator: pure Node smoke test.
 * Run: node test/mrln-crew-art.test.js
 * Does not replace a browser screenshot/render test.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname,'../frontend/app/mrln-crew-art.js'),'utf8');
const context = {module:{exports:{}}, DATA:{SKINS:{},DEFAULT_SKIN:'blank'}};
vm.runInNewContext(source,context,{filename:'mrln-crew-art.js'});
const crew=context.module.exports;
assert.equal(crew.CHARACTERS.length,6);
assert.equal(crew.DIRECTIONS.length,8);
assert.equal(context.DATA.DEFAULT_SKIN,'mrln_nova');
assert.equal(crew.skinIds.length,6);
const manifest={sprites:{}};
assert.equal(crew.install(manifest),true);
for(const c of crew.CHARACTERS){
  assert.ok(context.DATA.SKINS[c.id]);
  assert.ok(crew.still(c.set).startsWith('data:image/svg+xml;charset=utf-8,'));
  for(const d of crew.DIRECTIONS){
    for(const a of ['rot','walk','blink','sit','talk','type']){
      const key=c.set+'.'+a+'.'+d;
      const tracks=manifest.sprites[key];
      assert.equal(tracks.length,a==='walk'?4:2,key);
      for(const dataUrl of tracks){
        const xml=decodeURIComponent(dataUrl.slice(dataUrl.indexOf(',')+1));
        assert.ok(xml.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'));
        assert.ok(xml.endsWith('</svg>'));
        assert.ok(!xml.includes('http://') || xml.includes('http://www.w3.org/2000/svg'));
      }
    }
  }
}
assert.equal(Object.keys(manifest.sprites).length,6*8*6);
console.log('MRLN original crew generator: 6 skins, 288 animated tracks verified');
