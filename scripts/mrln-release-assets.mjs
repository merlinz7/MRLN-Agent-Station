#!/usr/bin/env node
/** MRLN artwork release audit: fail CLOSED for public distributions.
 * Code license != media redistribution license. All inherited raster/vector assets
 * remain unresolved until there is written evidence of rights or original replacement.
 * This script is intentionally not a "green" certificate by default.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const assets=path.join(root,'frontend','assets');
const media=/\.(?:png|webp|jpe?g|gif|svg|ico|icns|bmp|woff2?|ttf|otf|mp3|ogg|wav)$/i;
function list(dir,found=[]){
 if(!fs.existsSync(dir))return found;
 for(const n of fs.readdirSync(dir,{withFileTypes:true})){
  const absolute=path.join(dir,n.name);
  if(n.isDirectory())list(absolute,found);
  else if(n.isFile()&&media.test(n.name))found.push(absolute);
 }
 return found;
}
const files=list(assets).sort();
const originalDeclared=new Set([
 'frontend/assets/brand/mrln-wordmark.svg'
]);
const report={
  schema:1,
  scope:'MRLN independent redistribution rights',
  policy:'UNVERIFIED IS BLOCKING for public distribution. MIT code license never silently clears original media.',
  verifiedOriginal:[],
  unresolvedInherited:[],
  totals:{files:0,declaredOriginal:0,unresolved:0,unresolvedBytes:0},
  checks:{
    originalCharacterGenerator:fs.existsSync(path.join(root,'frontend/app/mrln-crew-art.js')),
    originalIndustrialMaterialGenerator:fs.existsSync(path.join(root,'frontend/app/mrln-materials.js')),
    updaterDisabled: false,
    appIdentifierDistinct: false
  }
};
for(const f of files){
 const relative=path.relative(root,f).replaceAll(path.sep,'/');
 const item={path:relative,bytes:fs.statSync(f).size};
 if(originalDeclared.has(relative))report.verifiedOriginal.push(item);
 else report.unresolvedInherited.push({...item,reason:'Inherited asset, ownership/relicense not verified'});
}
const tauriPath=path.join(root,'src-tauri/tauri.conf.json');
if(fs.existsSync(tauriPath)){
 const t=JSON.parse(fs.readFileSync(tauriPath,'utf8'));
 report.checks.updaterDisabled=!!(t.bundle?.createUpdaterArtifacts===false&&Array.isArray(t.plugins?.updater?.endpoints)&&t.plugins.updater.endpoints.length===0);
 report.checks.appIdentifierDistinct=t.identifier==='com.mrln.agentstation';
}
report.totals={
 files:files.length,declaredOriginal:report.verifiedOriginal.length,
 unresolved:report.unresolvedInherited.length,
 unresolvedBytes:report.unresolvedInherited.reduce((n,f)=>n+f.bytes,0)
};
report.releaseEligible=report.totals.unresolved===0&&Object.values(report.checks).every(Boolean);
const output=path.join(root,'.mrln-audit','assets.json');
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log('MRLN media audit: '+JSON.stringify({...report.totals,releaseEligible:report.releaseEligible,checks:report.checks}));
console.log('Full evidence written to .mrln-audit/assets.json');
if(process.argv.includes('--strict-public')&&!report.releaseEligible){
 console.error('BLOCKED: independently distributable MRLN release not cleared. Review unresolved assets, obtain licenses or replace.');
 process.exitCode=2;
}
