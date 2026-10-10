#!/usr/bin/env node
/**
 * MRLN internal Windows build identity.
 * Creates original launcher and installer artwork and changes the local Tauri build
 * configuration without contacting or trusting the upstream StarNet update feed.
 * This is NOT a release/signing/asset-clearance claim.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createCanvas } from '@napi-rs/canvas';

const root=path.resolve(import.meta.dirname,'..');
const tauri=path.join(root,'src-tauri');
const icons=path.join(tauri,'icons');
const installer=path.join(tauri,'installer');
fs.mkdirSync(icons,{recursive:true});
fs.mkdirSync(installer,{recursive:true});

function icon(size) {
  const cv=createCanvas(size,size),c=cv.getContext('2d');
  const u=size/128;
  c.fillStyle='#061222';c.fillRect(0,0,size,size);
  c.strokeStyle='#237080';c.lineWidth=3*u;c.strokeRect(4*u,4*u,size-8*u,size-8*u);
  c.fillStyle='#092339';c.fillRect(12*u,12*u,104*u,104*u);
  c.strokeStyle='#45dce8';c.lineWidth=2*u;c.beginPath();c.arc(64*u,64*u,46*u,0,2*Math.PI);c.stroke();
  c.strokeStyle='#77eff6';c.lineWidth=12*u;c.lineJoin='miter';c.lineCap='square';
  c.beginPath();c.moveTo(31*u,89*u);c.lineTo(31*u,43*u);c.lineTo(52*u,66*u);c.lineTo(64*u,47*u);c.lineTo(76*u,66*u);c.lineTo(97*u,43*u);c.lineTo(97*u,89*u);c.stroke();
  c.fillStyle='#efae70';for(const [x,y] of [[64,9],[119,64],[64,119],[9,64]]){c.fillRect((x-3)*u,(y-3)*u,6*u,6*u);}
  return cv.toBuffer('image/png');
}
const sizes=[16,32,64,128,256];
const pngs=sizes.map(n=>({n,buf:icon(n)}));
for(const [n,file] of [[32,'32x32.png'],[128,'128x128.png'],[256,'128x128@2x.png']])
  fs.writeFileSync(path.join(icons,file),pngs.find(v=>v.n===n).buf);

function writeICO(file,pics) {
  const count=pics.length,header=Buffer.alloc(6+count*16);
  header.writeUInt16LE(0,0);header.writeUInt16LE(1,2);header.writeUInt16LE(count,4);
  let offset=header.length;
  pics.forEach((p,i)=>{
    const k=6+i*16;
    header[k]=p.n===256?0:p.n;header[k+1]=p.n===256?0:p.n;
    header[k+2]=0;header[k+3]=0;
    header.writeUInt16LE(1,k+4);
    header.writeUInt16LE(32,k+6);
    header.writeUInt32LE(p.buf.length,k+8);
    header.writeUInt32LE(offset,k+12);
    offset+=p.buf.length;
  });
  fs.writeFileSync(file,Buffer.concat([header,...pics.map(p=>p.buf)]));
}
writeICO(path.join(icons,'icon.ico'),pngs);

function writeBMP(filename,cv) {
  const width=cv.width,height=cv.height,scan=((width*3+3)>>2)<<2,pixelBytes=scan*height,total=54+pixelBytes;
  const out=Buffer.alloc(total);
  out.write('BM',0,'ascii');out.writeUInt32LE(total,2);out.writeUInt32LE(54,10);
  out.writeUInt32LE(40,14);out.writeInt32LE(width,18);out.writeInt32LE(height,22);
  out.writeUInt16LE(1,26);out.writeUInt16LE(24,28);out.writeUInt32LE(pixelBytes,34);
  const dat=cv.getContext('2d').getImageData(0,0,width,height).data;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const s=(y*width+x)*4,d=54+(height-y-1)*scan+x*3;
    out[d]=dat[s+2];out[d+1]=dat[s+1];out[d+2]=dat[s];
  }
  fs.writeFileSync(path.join(installer,filename),out);
}
function panel(w,h){
  const cv=createCanvas(w,h),c=cv.getContext('2d');
  c.fillStyle='#071320';c.fillRect(0,0,w,h);
  c.fillStyle='#132738';for(let y=8;y<h;y+=19)c.fillRect(0,y,w,1);
  c.fillStyle='#1ba8bf';c.fillRect(0,0,4,h);
  c.strokeStyle='#55dce7';c.lineWidth=1;c.strokeRect(8,8,w-16,h-16);
  c.fillStyle='#8fe5ed';c.font='bold 22px Consolas';c.fillText('MRLN',15,Math.min(h-16,36));
  return cv;
}
writeBMP('header.bmp',panel(150,57));
const sidebar=panel(164,314),sc=sidebar.getContext('2d');
sc.font='14px Consolas';sc.fillStyle='#91cbd2';
for(const [i,line] of ['AGENT','STATION','LOCAL','CREW'].entries())sc.fillText(line,16,135+i*27);
writeBMP('sidebar.bmp',sidebar);

const confpath=path.join(tauri,'tauri.conf.json');
const conf=JSON.parse(fs.readFileSync(confpath,'utf8'));
conf.productName='MRLN Agent Station';
conf.identifier='com.mrln.agentstation';
conf.bundle.publisher='MRLN Agent Station';
conf.bundle.createUpdaterArtifacts=false;
conf.bundle.icon=['icons/32x32.png','icons/128x128.png','icons/128x128@2x.png','icons/icon.ico'];
// IMPORTANT: never let an MRLN test binary poll or install an upstream StarNet release.
conf.plugins??={};
conf.plugins.updater??={};
conf.plugins.updater.endpoints=[];
conf.bundle.windows??={};
conf.bundle.windows.nsis??={};
conf.bundle.windows.nsis.installerIcon='icons/icon.ico';
conf.bundle.windows.nsis.headerImage='installer/header.bmp';
conf.bundle.windows.nsis.sidebarImage='installer/sidebar.bmp';
// The inherited NSIS hooks inspect StarNet uninstall registry keys and executable names.
// They must never be executed by an unrelated MRLN installer.
delete conf.bundle.windows.nsis.installerHooks;
// Build a distinct executable name, not just a changed display label.
const cargoPath=path.join(tauri,'Cargo.toml');
const cargo=fs.readFileSync(cargoPath,'utf8');
const rewritten=cargo.replace(/^name\s*=\s*"skynet-desktop"/m,'name = "mrln-agent-station"');
if(!/^name\s*=\s*"mrln-agent-station"/m.test(rewritten))
  throw new Error('MRLN native executable name missing');
if(rewritten!==cargo)fs.writeFileSync(cargoPath,rewritten);

fs.writeFileSync(confpath,JSON.stringify(conf,null,2)+'\n');
const assert=JSON.parse(fs.readFileSync(confpath,'utf8'));
if(assert.productName!=='MRLN Agent Station'||assert.identifier!=='com.mrln.agentstation'||
  assert.plugins.updater.endpoints.length||assert.bundle.createUpdaterArtifacts!==false)
  throw new Error('MRLN safe build identity not applied');
console.log('MRLN Windows internal-test identity and original installer graphics staged; updater disabled.');
