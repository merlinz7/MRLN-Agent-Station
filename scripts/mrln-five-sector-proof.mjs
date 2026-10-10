#!/usr/bin/env node
/* MRLN real five-sector station, seeded in temporary workspace.
   Captures actual renderer; no mockup assets, no user data, no model calls.
*/
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { sleep, launchChrome, connectCDP, evalJS, capture, collectDiagnostics } from './lib/cdp.mjs';
import { materializeSeedWorkspace, bootSeededSidecar, waitUp, waitDevReady } from './lib/seed.mjs';

const temp=fs.mkdtempSync(path.join(os.tmpdir(),'mrln-five-sector-'));
const out=process.env.MRLN_PROOF_OUT || path.join(process.cwd(),'.uishots-mrln-multi');
fs.mkdirSync(out,{recursive:true});
const port=process.env.MRLN_PROOF_PORT || '8971';
const cdpPort=Number(process.env.MRLN_CDP_PORT || 9371);
const url='http://127.0.0.1:'+port+'/';
const scratch=path.join(temp,'workspaces');
materializeSeedWorkspace(scratch);
const save=path.join(scratch,'agent.save.json'),doc=JSON.parse(fs.readFileSync(save));
doc.doc.agent.skin='mrln_nova';fs.writeFileSync(save,JSON.stringify(doc,null,2));
let chrome=null,sidecar=null,cdp=null,diagnostics={consoleMsgs:[],exceptions:[]};
const report={ready:false,rooms:0,preset:'',exceptions:[],console:[]};
let code=1;
try{
  sidecar=bootSeededSidecar({port,scratchDir:scratch});
  if(!await waitUp(url))throw Error('sidecar did not boot');
  chrome=launchChrome({cdpPort,win:'1600,900',profileDir:path.join(temp,'chrome')});
  cdp=await connectCDP(cdpPort);diagnostics=collectDiagnostics(cdp);
  await cdp.send('Page.enable');await cdp.send('Runtime.enable');
  await cdp.send('Page.navigate',{url});
  if(!await waitDevReady(cdp,evalJS,{tries:30,url}))throw Error('in-game world did not load');
  const result=await evalJS(cdp,`(async () => {
    const next=StationTemplates.build('mrln-studio', WorldModel, PropSprites);
    const active=WorldModel.create(next);
    World.loadStation(active);
    await new Promise(resolve=>setTimeout(resolve,2200));
    const doc=World.stationDoc();
    return {rooms:doc.order.filter(id=>doc.rooms[id] && doc.rooms[id].kind!=='corridor').length,corridors:doc.order.filter(id=>doc.rooms[id] && doc.rooms[id].kind==='corridor').length,preset:doc.meta.templateId,novas:(typeof MRLNCrewArt!=='undefined'&&MRLNCrewArt.skinIds.length===24&&MRLNCrewArt.skinIds.includes('mrln_nova'))};
  })()`);
  if(!result||result.rooms!==5||result.preset!=='mrln-studio'||!result.novas)
    throw Error('unexpected MRLN station: '+JSON.stringify(result));
  await sleep(1000);
  // Hold the completed visual frame without implying any work actually ran.
  await evalJS(cdp,'World.stop(); true');
  await capture(cdp,out,'five-sector');
  report.ready=true;report.rooms=result.rooms;report.preset=result.preset;
  code=0;
}catch(error){report.error=String(error.stack||error);console.error(report.error);}
finally{
  report.exceptions=diagnostics.exceptions;report.console=diagnostics.consoleMsgs;
  if(report.exceptions.length)code=1;
  fs.writeFileSync(path.join(out,'five-sector.json'),JSON.stringify(report,null,2));
  try{cdp?.ws.close();}catch{}
  try{chrome?.proc.kill('SIGKILL');}catch{}
  try{sidecar?.kill('SIGKILL');}catch{}
  try { fs.rmSync(temp,{recursive:true,force:true,maxRetries:10,retryDelay:300}); }
  catch (cleanupError) { console.warn('Temporary Chrome profile cleanup deferred:',cleanupError.message); }
}
console.log(JSON.stringify(report));
process.exit(code);
