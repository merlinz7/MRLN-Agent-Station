/* MRLN AGENT STATION — original "Ion Veil" space environment.
 * No reused StarNet bitmap/art; all marks are authored procedurally.
 * A fixed-size, deterministic deep-space scene with three parallax layers
 * and a navigational nebula arch, presented by SpaceBG in its real picker.
 */
'use strict';
const MRLNSky = (() => {
  const TW=1024, TH=640;
  const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
  function random(seed){let s=seed>>>0;return ()=>{s+=0x6D2B79F5;let x=s;x=Math.imul(x^(x>>>15),x|1);x^=x+Math.imul(x^(x>>>7),x|61);return ((x^(x>>>14))>>>0)/4294967296;};}
  const rgba=(rgb,a)=>'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+','+a.toFixed(3)+')';
  function glow(c,x,y,r,tint,alpha){
    const gr=c.createRadialGradient(x,y,0,x,y,r);
    gr.addColorStop(0,rgba(tint,alpha));gr.addColorStop(.35,rgba(tint,alpha*.46));gr.addColorStop(1,rgba(tint,0));
    c.fillStyle=gr;c.fillRect(x-r,y-r,2*r,2*r);
  }
  function cover(ctx,tile,ox,oy,w,h){
    const x0=((Math.round(ox)%TW)+TW)%TW-TW;
    const y0=((Math.round(oy)%TH)+TH)%TH-TH;
    for(let y=y0;y<h;y+=TH)for(let x=x0;x<w;x+=TW)ctx.drawImage(tile,x,y);
  }
  function nebula(c,rnd){
    c.fillStyle='#030916';c.fillRect(0,0,TW,TH);
    const blue=[26,157,204],cyan=[31,210,204],violet=[130,72,188],amber=[226,134,66];
    // Four large, offset knots create an asymmetrical signed "veil" arch.
    const knots=[
      {x:125,y:420,r:246,a:.15,cl:violet},
      {x:330,y:300,r:274,a:.18,cl:blue},
      {x:586,y:184,r:255,a:.13,cl:cyan},
      {x:844,y:310,r:233,a:.10,cl:amber},
      {x:953,y:437,r:285,a:.08,cl:violet}
    ];
    for(const k of knots)glow(c,k.x,k.y,k.r,k.cl,k.a);
    // Fibrous gas, generated along angular arcs, not stock radial wallpapers.
    // Whole-pixel micro-marks keep a pixel texture within the soft gas.
    const path=(x,u)=>TH*.50-134*Math.sin((x/TW)*Math.PI*1.5)+
      35*Math.sin((x/TW)*Math.PI*4)+u;
    for(let ring=0;ring<6;ring++){
      const off=(ring-2.5)*18,ink=[cyan,blue,violet,blue,cyan,amber][ring];
      for(let k=0;k<340;k++){
        const x=rnd()*TW,y=path(x,off+(rnd()-.5)*70);
        if(y<0||y>=TH)continue;
        const t=rnd(),len=2+Math.floor(rnd()*17);
        c.fillStyle=rgba(ink,.025+(1-t)*.075);
        c.fillRect(Math.floor(x),Math.floor(y),len,1+Math.floor(rnd()*2));
      }
    }
    // Irregular pockets of cloud texture, curved around the illuminated filament.
    for(let i=0;i<420;i++){
      const x=rnd()*TW,y=path(x,(rnd()-.5)*165);
      if(y<0||y>TH)continue;
      const radius=7+rnd()*33,choice=rnd();
      glow(c,x,y,radius,choice<.46?blue:choice<.88?cyan:violet,.013+rnd()*.045);
    }
    // Off-axis dark lanes produce spatial depth and prevent a bright flat gradient.
    for(let i=0;i<74;i++){
      const x=rnd()*TW,y=path(x,(rnd()-.5)*65);
      glow(c,x,y,14+rnd()*44,[1,4,11],.16+rnd()*.20);
    }
  }
  function stars(c,rnd,near){
    const n=near?245:890;
    for(let i=0;i<n;i++){
      const x=Math.floor(rnd()*TW),y=Math.floor(rnd()*TH);
      const tint=near?(rnd()<.73?[164,227,242]:[255,209,170])
        :rnd()<.77?[157,190,219]:[186,171,239];
      const size=near&&rnd()<.095?2:1,bright=(near?.50:.17)+rnd()*(near?.45:.34);
      c.fillStyle=rgba(tint,bright);c.fillRect(x,y,size,size);
      if(near&&size===2&&rnd()<.32){
        c.fillStyle=rgba(tint,bright*.24);c.fillRect(x-2,y,6,1);c.fillRect(x,y-2,1,6);
      }
    }
  }
  function telemetry(c,rnd){
    // A sparse fictional deep-space surveying lattice with its own visual vocabulary.
    c.strokeStyle='rgba(61,182,206,.085)';c.lineWidth=1;c.beginPath();
    for(let x=0;x<TW;x+=64){c.moveTo(x,0);c.lineTo(x,TH);}
    for(let y=0;y<TH;y+=64){c.moveTo(0,y);c.lineTo(TW,y);}
    c.stroke();
    for(let i=0;i<19;i++){
      const x=Math.floor(rnd()*TW),y=Math.floor(rnd()*TH);
      c.strokeStyle='rgba(81,234,214,.18)';
      c.strokeRect(x-6,y-6,12,12);
      c.fillStyle='rgba(137,252,230,.35)';
      c.fillRect(x-1,y-1,2,2);
      c.fillStyle='rgba(81,234,214,.19)';
      c.fillRect(x+9,y,12+Math.floor(rnd()*17),1);
    }
    c.strokeStyle='rgba(57,218,214,.22)';
    for(const [x,y] of [[24,24],[TW-24,TH-24]]) {
      c.beginPath();c.moveTo(x-11,y);c.lineTo(x+11,y);c.moveTo(x,y-11);c.lineTo(x,y+11);c.stroke();
    }
  }
  const backdrop={
    label:'MRLN · ION VEIL',
    blurb:'Original cyan-violet nebula, survey beacons and drifting star layers.',
    base:'#030916',
    fixedTile:()=>[TW,TH],
    build(){
      const neb=mk(TW,TH),far=mk(TW,TH),close=mk(TW,TH),hud=mk(TW,TH);
      nebula(neb.getContext('2d'),random(0x4D524C4E));
      stars(far.getContext('2d'),random(0x0BE4AB1E),false);
      stars(close.getContext('2d'),random(0x1CEB0A1D),true);
      telemetry(hud.getContext('2d'),random(0x1E105EED));
      return {neb,far,close,hud};
    },
    draw(ctx,w,h,now,cam,st){
      const panX=cam&&Number.isFinite(cam.panX)?cam.panX:0;
      const panY=cam&&Number.isFinite(cam.panY)?cam.panY:0;
      const drift=typeof now==='number'?now/1000:0;
      cover(ctx,st.neb,panX*.018+drift*.32,panY*.018-drift*.08,w,h);
      cover(ctx,st.far,panX*.11+drift*.4,panY*.07,w,h);
      cover(ctx,st.close,panX*.23+drift*1.15,panY*.19+drift*.12,w,h);
      // Lattice layer should read as instruments in space, not HUD pasted on screen.
      ctx.globalAlpha=.60;cover(ctx,st.hud,panX*.08,panY*.06,w,h);ctx.globalAlpha=1;
    }
  };
  return Object.freeze(backdrop);
})();
if(typeof module!=='undefined'&&module.exports)module.exports=MRLNSky;
