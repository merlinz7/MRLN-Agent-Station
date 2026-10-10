'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../frontend/app/mrln-materials.js'),'utf8');
const pixels=[];
function fakeCanvas(){
 const ctx={fillStyle:'',fillRect:(x,y,w,h)=>{assert.ok([x,y,w,h].every(Number.isFinite));assert.ok(w>=0&&h>=0);pixels.push(1);}};
 return {width:0,height:0,getContext:()=>ctx};
}
const context={module:{exports:{}},document:{createElement:tag=>{assert.equal(tag,'canvas');return fakeCanvas();}}};
vm.runInNewContext(source,context,{filename:'mrln-materials.js'});
const mat=context.module.exports;
for(const name of ['remaster/floors/plate','remaster/floors/basalt-v2','remaster/walls/bulkhead-v3','remaster/walls/pipework-v3','floor-flightdeck','wall-utility']){
 assert.equal(mat.supports(name),true,name);
 const cv=mat.build(name);
 assert.ok(cv&&cv.width>0&&cv.height>0,name);
}
assert.equal(mat.build('unsupported'),null);
assert.ok(pixels.length>1000);
console.log('MRLN procedural materials: wall/floor sheets generated with '+pixels.length+' finite geometry operations');
