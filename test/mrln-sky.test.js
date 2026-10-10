'use strict';
/* Original MRLN Ion Veil sky: real source renderer contract without image fixtures.
 * A Chrome visual proof must separately validate the actual pixels.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'), vm=require('node:vm'), path=require('node:path');
const script=fs.readFileSync(path.join(__dirname,'../frontend/app/mrln-sky.js'),'utf8');
let imageBlits=0,marked=0;
const ctx=()=>({
 fillStyle:'',strokeStyle:'',lineWidth:1,globalAlpha:1,
 fillRect(x,y,w,h){assert.ok([x,y,w,h].every(Number.isFinite));marked++;},
 strokeRect(x,y,w,h){assert.ok([x,y,w,h].every(Number.isFinite));},
 beginPath(){},moveTo(){},lineTo(){},stroke(){},
 createRadialGradient(...nums){
  assert.ok(nums.every(Number.isFinite));
  return {addColorStop:(s,c)=>{assert.ok(s>=0&&s<=1);assert.equal(typeof c,'string');}};
 },
 drawImage(img,x,y){assert.ok(img && Number.isFinite(x) && Number.isFinite(y));imageBlits++;}
});
const makeCanvas=()=>({width:0,height:0,getContext:()=>ctx()});
const context={document:{createElement:tag=>{assert.equal(tag,'canvas');return makeCanvas();}},module:{exports:{}}};
vm.runInNewContext(script,context,{filename:'mrln-sky.js'});
const sky=context.module.exports;
assert.equal(sky.label,'MRLN · ION VEIL');
assert.equal(sky.base,'#030916');
assert.equal(sky.fixedTile()[0],1024);
assert.equal(sky.fixedTile()[1],640);
const built=sky.build();
assert.deepEqual(Object.keys(built).sort(),['close','far','hud','neb']);
assert.equal(built.neb.width,1024);
assert.equal(built.close.height,640);
sky.draw(ctx(),1280,720,1000,{panX:156,panY:-28},built);
assert.ok(imageBlits>15,'should render tiled parallax layers');
assert.ok(marked>1000,'generated original nebula and stars, not an empty background');
console.log('MRLN original Ion Veil sky: '+marked+' authored drawing operations; '+imageBlits+' parallax tile draws');
