/* MRLN ORIGINAL MATERIAL ATLAS — all imagery drawn from deterministic canvas primitives.
 * No upstream StarNet pixel texture or bitmap is used in this material generator.
 * Floor: 8×8 tile sheet (512²); wall: 4 bays (384×128).
 * The existing geometry, occlusion, lighting and furniture engines remain unchanged.
 */
'use strict';
const MRLNMaterials = (() => {
  const clamp=x=>Math.max(0,Math.min(255,Math.round(x)));
  function rand(seed){let a=seed>>>0;return ()=>{a^=a<<13;a^=a>>>17;a^=a<<5;return (a>>>0)/4294967296;};}
  function hash(s){let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0;}
  function color(rgb,alpha=1){return 'rgba('+rgb.map(clamp).join(',')+','+alpha+')';}
  const schemes={
    cobalt:{base:[35,55,80],edge:[12,25,42],metal:[70,104,130],glow:[79,217,241]},
    bronze:{base:[78,55,44],edge:[38,25,28],metal:[144,93,68],glow:[244,152,76]},
    violet:{base:[65,49,80],edge:[27,23,47],metal:[118,79,139],glow:[218,137,249]},
    teal:{base:[33,71,72],edge:[15,35,45],metal:[70,134,127],glow:[79,239,202]},
    olive:{base:[67,67,48],edge:[30,33,29],metal:[120,119,69],glow:[220,225,125]},
    steel:{base:[55,62,72],edge:[23,30,42],metal:[106,124,143],glow:[111,198,244]}
  };
  const tags=['cobalt','bronze','violet','teal','olive','steel'];
  function palette(name){return schemes[tags[hash(name)%tags.length]];}
  function panel(g,x,y,w,h,p,random,i,floor){
    const e=()=>random();
    const base=p.base,edge=p.edge,mid=p.metal,lit=p.glow;
    g.fillStyle=color(edge);g.fillRect(x,y,w,h);
    g.fillStyle=color(base);g.fillRect(x+3,y+3,w-6,h-6);
    g.fillStyle=color(mid,.38);g.fillRect(x+3,y+3,w-6,2);g.fillRect(x+3,y+3,2,h-6);
    g.fillStyle=color([3,9,18],.65);g.fillRect(x+3,y+h-5,w-6,2);g.fillRect(x+w-5,y+3,2,h-6);
    // Four dark corners, fasteners and small bevel pixels.
    for(const [ax,ay] of [[x+7,y+7],[x+w-9,y+7],[x+7,y+h-9],[x+w-9,y+h-9]]){
      g.fillStyle=color([4,10,18],.9);g.fillRect(ax-2,ay-2,5,5);
      g.fillStyle=color(mid,.9);g.fillRect(ax-1,ay-1,3,3);
      g.fillStyle='#dde5e8';g.fillRect(ax-1,ay-1,1,1);
    }
    // Purposeful panel structures rather than a flat repeated grid.
    const v=i%6;
    if(v===0){
      g.fillStyle=color(edge,.85);g.fillRect(x+18,y+18,w-36,h-36);
      g.fillStyle=color(mid,.75);g.fillRect(x+21,y+21,w-42,h-42);
      g.fillStyle=color(edge,.75);g.fillRect(x+24,y+24,w-48,h-48);
    }else if(v===1){
      for(let n=0;n<4;n++){g.fillStyle=color(edge,.9);g.fillRect(x+15,y+15+n*9,w-30,4);
        g.fillStyle=color(mid,.50);g.fillRect(x+15,y+15+n*9,w-30,1);}
    }else if(v===2){
      g.fillStyle=color(edge);g.fillRect(x+27,y+11,10,h-22);
      g.fillStyle=color(mid,.75);g.fillRect(x+28,y+11,2,h-22);
      g.fillStyle=color(lit,.57);g.fillRect(x+30,y+18,4,13);
    }else if(v===3){
      g.fillStyle=color(mid,.45);g.fillRect(x+10,y+20,w-20,2);
      g.fillRect(x+10,y+40,w-20,2);
      g.fillStyle=color(lit,.68);g.fillRect(x+14,y+16,14,2);
    }else if(v===4){
      for(let n=0;n<3;n++){
        g.fillStyle=color(edge,.75);g.fillRect(x+15+n*12,y+12,8,h-24);
        g.fillStyle=color(mid,.35);g.fillRect(x+15+n*12,y+12,2,h-24);
      }
    }else{
      g.fillStyle=color(edge);g.fillRect(x+12,y+23,w-24,14);
      g.fillStyle=color(mid,.45);g.fillRect(x+14,y+25,w-28,8);
      g.fillStyle=color(lit,.60);g.fillRect(x+20,y+28,12,2);
    }
    if(i%9===0){g.fillStyle=color(lit,.7);g.fillRect(x+11,y+h-14,19,2);
      g.fillStyle=color(lit,.35);g.fillRect(x+11,y+h-11,12,1);}
    // Grain and scuffs are seeded, clipped to the panel so tile seams stay coherent.
    for(let n=0;n<(floor?95:65);n++){
      let px=x+4+Math.floor(e()*(w-8)),py=y+4+Math.floor(e()*(h-8));
      g.fillStyle=e()<.55?'rgba(0,0,0,.12)':'rgba(219,236,249,.12)';
      g.fillRect(px,py,e()<.2?4:1,1);
    }
  }
  function floor(name){
    const cv=document.createElement('canvas');cv.width=cv.height=512;
    const g=cv.getContext('2d');if(!g)return null;
    const p=palette(name),rr=rand(hash(name));
    g.fillStyle=color(p.edge);g.fillRect(0,0,512,512);
    for(let y=0;y<8;y++)for(let x=0;x<8;x++){
      const k=y*8+x,xx=x*64,yy=y*64;
      panel(g,xx,yy,64,64,p,rr,k,true);
      // Thin illuminated seams only at selected joins, stable across all 64 source cells.
      if((x+y)%5===0){g.fillStyle=color(p.glow,.60);g.fillRect(xx+17,yy,22,1);}
    }
    return cv;
  }
  function wall(name){
    const cv=document.createElement('canvas');cv.width=384;cv.height=128;
    const g=cv.getContext('2d');if(!g)return null;
    const p=palette(name),rr=rand(hash(name));
    g.fillStyle=color(p.edge);g.fillRect(0,0,384,128);
    for(let b=0;b<4;b++){
      const x=b*96;
      g.fillStyle=color(p.base);g.fillRect(x+3,5,90,117);
      g.fillStyle=color(p.metal,.58);g.fillRect(x+5,5,86,5);
      g.fillStyle=color(p.edge);g.fillRect(x+5,100,86,20);
      g.fillStyle=color(p.metal,.50);g.fillRect(x+9,105,78,4);
      g.fillStyle=color(p.edge);g.fillRect(x+12,18,72,70);
      g.fillStyle=color(p.base);g.fillRect(x+16,22,64,62);
      g.fillStyle=color(p.metal,.40);g.fillRect(x+16,22,64,3);
      // Axial columns, rivets, cables and equipment, each structural bay has its own silhouette.
      for(const xx of [x+4,x+88]){
        g.fillStyle=color(p.edge);g.fillRect(xx,0,5,128);
        g.fillStyle=color(p.metal,.8);g.fillRect(xx+1,0,2,128);
        for(let h=9;h<128;h+=18){g.fillStyle='#b9c0c3';g.fillRect(xx+1,h,2,2);}
      }
      if(b===0){
        for(let t=0;t<4;t++){g.fillStyle=color(p.edge);g.fillRect(x+20,30+t*12,56,5);
          g.fillStyle=color(p.glow,.3);g.fillRect(x+22,30+t*12,52,1);}
      }else if(b===1){
        for(const a of [32,42,52,62]){g.fillStyle=color(p.metal,.75);g.fillRect(x+a,20,5,60);
          g.fillStyle=color(p.edge);g.fillRect(x+a+1,20,2,60);}
      }else if(b===2){
        g.fillStyle=color(p.edge);g.fillRect(x+20,25,56,49);
        g.fillStyle=color(p.glow,.5);g.fillRect(x+24,28,48,39);
        g.fillStyle=color(p.base);g.fillRect(x+29,32,38,31);
        for(let a=0;a<4;a++){g.fillStyle=color(p.glow,.75);g.fillRect(x+33,36+a*7,15+a*3,2);}
      }else{
        g.fillStyle=color(p.metal,.65);g.fillRect(x+21,21,53,12);
        for(let a=0;a<5;a++){g.fillStyle=color(p.edge);g.fillRect(x+25+a*9,37,6,37);}
        g.fillStyle=color(p.glow,.75);g.fillRect(x+30,81,32,3);
      }
      for(let n=0;n<130;n++){
        g.fillStyle=rr()<.52?'rgba(0,0,0,.18)':'rgba(210,220,230,.08)';
        g.fillRect(x+10+Math.floor(rr()*76),13+Math.floor(rr()*99),1,1);
      }
      g.fillStyle=color(p.glow,.62);g.fillRect(x+36,114,24,2);
    }
    return cv;
  }
  function supports(name){return typeof name==='string' && (/^(remaster\/(floors|walls)\/|floor-(flightdeck|lunar|maggrid|habitat)$|wall-(pressure|radiator|utility|acoustic)$)/.test(name));}
  function build(name){
    if(!supports(name)||typeof document==='undefined')return null;
    return name.startsWith('remaster/walls/')||name.startsWith('wall-')?wall(name):floor(name);
  }
  return Object.freeze({build,supports,floor,wall});
})();
if(typeof module!=='undefined'&&module.exports)module.exports=MRLNMaterials;
