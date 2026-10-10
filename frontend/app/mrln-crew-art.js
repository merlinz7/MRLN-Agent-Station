/* MRLN ORIGINAL CREW — procedural pixel sprites.
 * Copyright (c) 2026 MRLN Agent Station contributors.
 * Original silhouettes and palettes, independent of StarNet's excluded artwork.
 * Generates self-contained SVG frames for the existing Image-based renderer.
 * No external assets, textures, fonts, or fetches are required.
 */
'use strict';
const MRLNCrewArt = (() => {
  const CHARACTERS = Object.freeze([
    { id:'mrln_nova',  set:'mrln_nova',  name:'Nova · Command',    suit:'#5973a8', trim:'#a9ddf4', light:'#53dafa', dark:'#263b65', badge:'#ffd38c', kit:'captain' },
    { id:'mrln_scout', set:'mrln_scout', name:'Scout · Research',  suit:'#318e87', trim:'#a8f5df', light:'#65f2cd', dark:'#174c61', badge:'#d4ff92', kit:'scanner' },
    { id:'mrln_forge', set:'mrln_forge', name:'Forge · Fabrication',suit:'#a76336',trim:'#f2b47f', light:'#ffb15e', dark:'#593648', badge:'#ffe19b', kit:'smith' },
    { id:'mrln_vera',  set:'mrln_vera',  name:'Vera · Validation', suit:'#77579d', trim:'#e4b7ff', light:'#c992ff', dark:'#3c345d', badge:'#8dfbe9', kit:'prism' },
    { id:'mrln_echo',  set:'mrln_echo',  name:'Echo · Archive',    suit:'#9b9950', trim:'#f1eea2', light:'#e9ed91', dark:'#4a564c', badge:'#a0e5ff', kit:'scribe' },
    { id:'mrln_relay', set:'mrln_relay', name:'Relay · Comms',     suit:'#4a8caa', trim:'#e0f5ff', light:'#8bdcff', dark:'#25416e', badge:'#aaf9e5', kit:'antenna' }
  ]);
  // Every archetype has four actual outfit silhouettes; variant keys are persisted as skins.
  // This stays a selectable art catalog, not a random-color CSS filter over identical poses.
  const OUTFITS = Object.freeze([
    { id:'vanguard', name:'Vanguard', colors:{suit:'#536986',trim:'#e4f4ff',light:'#75cffa',dark:'#273a58',badge:'#fdc582'} },
    { id:'specter', name:'Specter', colors:{suit:'#38415e',trim:'#bcabf7',light:'#79e5eb',dark:'#171f38',badge:'#f0a3dc'} },
    { id:'explorer', name:'Explorer', colors:{suit:'#827a65',trim:'#e7c8a4',light:'#a5eada',dark:'#393d42',badge:'#fad278'} }
  ]);
  const VARIANT_CHARACTERS = Object.freeze(CHARACTERS.flatMap(c => OUTFITS.map(outfit => Object.freeze({
    ...c,
    id:c.id+'_'+outfit.id,
    set:c.set+'_'+outfit.id,
    name:c.name+' / '+outfit.name,
    variant:outfit.id,
    ...outfit.colors
  }))));
  const ALL_CHARACTERS = Object.freeze([...CHARACTERS, ...VARIANT_CHARACTERS]);
  const DIRECTIONS = Object.freeze(['south','south-east','east','north-east','north','north-west','west','south-west']);
  const cache = new Map();
  const bySet = new Map(ALL_CHARACTERS.map(c => [c.set,c]));
  const r = (x,y,w,h,fill) => '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'"/>';
  const poly = (pts,fill) => '<polygon points="'+pts+'" fill="'+fill+'"/>';
  function sprite(c, action, direction, frame) {
    const side = direction.includes('east') || direction.includes('west');
    const left = direction.includes('west');
    const away = direction.includes('north');
    const diag = side && (direction.includes('south') || direction.includes('north'));
    const profile = side && !diag;
    const idleBlink = action === 'blink';
    const moving = action === 'walk';
    const typing = action === 'type';
    const sitting = action === 'sit' || typing;
    const talking = action === 'talk';
    const stride = moving ? [-3,-2,-1,1,3,2,1,-1][frame % 8] : 0;
    const bob = moving ? [0,-1,0,1,0,-1,0,1][frame % 8] : (action === 'rot' && frame % 2 ? -1 : 0);
    const wave = talking && frame % 2 ? 3 : 0;
    const y0 = bob;
    const o = [];
    const add = (x,y,w,h,fill) => o.push(r(x,y+y0,w,h,fill));
    const line = '#0d172a', shadow = '#15253c', metal = '#d9e7ef', trim = c.trim, suit = c.suit;
    // Pixelated contact marker drawn into the frame, distinct from world contact shadow.
    o.push(r(19,60,26,2,'#0a1726'));
    o.push(r(23,59,18,1,'#29405c'));
    // Backpack and role-specific silhouette behind torso.
    if (away || c.kit === 'antenna' || c.kit === 'scribe') {
      add(19,27,26,22,line);add(21,29,22,18,c.dark);
      add(23,31,18,3,shadow);add(25,38,14,4,c.light);
      add(27,39,10,2,metal);
    }
    if (c.kit === 'captain') {
      add(12,26,10,8,line);add(42,26,10,8,line);
      add(13,27,8,5,c.badge);add(43,27,8,5,c.badge);
      add(30,7,4,9,line);add(31,8,2,8,c.badge);
    } else if (c.kit === 'scanner') {
      add(16,11,3,18,line);add(17,9,2,13,c.light);add(15,7,6,3,c.badge);
      add(47,32,6,13,line);add(48,34,4,9,c.light);
    } else if (c.kit === 'smith') {
      add(10,27,13,11,line);add(11,28,11,8,c.dark);
      add(42,28,12,13,line);add(43,29,10,12,c.badge);
      add(46,42,6,5,shadow);
    } else if (c.kit === 'prism') {
      o.push(poly('32,7 13,24 17,32 47,32 51,24',line));
      o.push(poly('32,10 17,25 21,29 43,29 47,25',c.dark));
      add(15,29,4,20,c.suit);add(45,29,4,20,c.suit);
    } else if (c.kit === 'scribe') {
      add(16,26,31,30,line);add(18,29,27,24,c.dark);
      add(22,32,19,5,c.trim);
    } else if (c.kit === 'antenna') {
      add(16,7,3,21,line);add(45,7,3,21,line);
      add(15,5,5,5,c.light);add(44,5,5,5,c.light);
      add(16,9,2,16,c.badge);add(46,9,2,16,c.badge);
    }
    // Boots, gait is directional and comes from the same clock as the engine.
    const lLeg = sitting ? 0 : stride, rLeg = sitting ? 0 : -stride;
    add(24+lLeg,46,7,sitting?6:13,line);add(34+rLeg,46,7,sitting?6:13,line);
    add(25+lLeg,48,5,sitting?5:9,c.dark);add(35+rLeg,48,5,sitting?5:9,c.dark);
    add(22+lLeg,56-(sitting?8:0),11,4,line);add(33+rLeg,56-(sitting?8:0),11,4,line);
    add(23+lLeg,57-(sitting?8:0),9,2,c.suit);add(34+rLeg,57-(sitting?8:0),9,2,c.suit);
    // Armor body, thick outline with side piping, emissive reactor and badge.
    add(19,27,26,24,line);add(21,29,22,19,suit);
    add(23,29,18,3,trim);add(21,34,3,13,c.dark);add(40,34,3,13,c.dark);
    add(24,44,16,3,c.dark);add(29,34,6,7,shadow);
    add(30,35,4,4,c.light);add(31,36,2,2,metal);
    if (!away) { add(37,35,4,4,c.badge);add(37,41,4,2,trim); }
    if (away) { add(24,34,16,12,c.dark);add(26,36,12,8,suit);add(30,37,4,6,c.light); }
    // Arms and work/talk animation. Every frame preserves arm anchoring.
    const ah = typing ? 4 : 14, ay = typing ? 34 : 31;
    add(13,ay,9,ah+3,line);add(42,ay-wave,9,ah+3,line);
    add(15,ay+2,6,ah,suit);add(43,ay+2-wave,6,ah,c.dark);
    add(16,ay+2,4,3,trim);add(44,ay+2-wave,4,3,trim);
    add(16,ay+ah+1,5,3,metal);add(44,ay+ah+1-wave,5,3,metal);
    if (typing) {add(21,38,8,5,metal);add(35,38,8,5,metal);}
    // Head silhouette; away faces show helmet vents, not front-face eyes.
    add(20,14,24,18,line);
    add(22,15,20,15,c.dark);
    add(23,15,18,3,trim);add(21,19,3,9,c.suit);add(40,19,3,9,c.suit);
    if (c.kit === 'smith') {add(23,13,18,4,shadow);add(25,15,14,4,c.badge);}
    if (c.kit === 'scribe') {add(18,16,5,14,c.suit);add(41,16,5,14,c.suit);}
    if (away) {
      add(25,20,14,9,suit);add(27,22,10,3,shadow);
      add(29,23,6,2,c.badge);
    } else if (profile) {
      add(left?21:31,20,12,8,shadow);
      add(left?22:32,21,9,6,c.light);
      if (!idleBlink) add(left?25:35,23,3,2,metal);
    } else {
      add(23,20,18,9,shadow);add(24,21,16,7,c.light);
      if (!idleBlink) {
        add(26,23,4,2,metal);add(34,23,4,2,metal);
      } else {add(26,24,4,1,shadow);add(34,24,4,1,shadow);}
      add(24,29,16,2,c.dark);
      if (diag) add(left?21:40,21,3,7,c.dark);
    }
    // Forehead badge / face-specific identity, not a recolored stock sprite.
    if (c.kit === 'captain') {add(30,16,4,3,c.badge);add(31,17,2,1,metal);}
    if (c.kit === 'scanner') {add(42,22,6,4,c.badge);add(44,23,3,2,metal);}
    if (c.kit === 'smith') {add(17,18,5,8,c.badge);}
    if (c.kit === 'prism') {o.push(poly('32,14 27,19 37,19',c.light));add(31,15,2,2,metal);}
    if (c.kit === 'scribe') {add(28,17,8,2,c.badge);add(29,15,6,2,trim);}
    if (c.kit === 'antenna') {add(30,15,4,3,c.badge);add(31,16,2,1,metal);}
    // These additions change outlines and equipment silhouettes, not only suit colors.
    if (c.variant === 'vanguard') {
      add(10,28,6,19,line);add(11,29,4,13,c.trim);
      add(49,28,6,19,line);add(50,29,4,13,c.trim);
      add(23,39,18,5,c.dark);add(27,39,10,3,c.badge);
      add(26,51,4,8,c.trim);add(35,51,4,8,c.trim);
    } else if (c.variant === 'specter') {
      add(16,17,5,15,c.trim);add(43,17,5,15,c.trim);
      add(13,19,4,8,c.light);add(47,19,4,8,c.light);
      add(25,5,14,3,line);add(27,6,10,2,c.light);
      add(27,43,10,3,c.trim);
    } else if (c.variant === 'explorer') {
      add(15,14,34,4,line);add(17,15,30,2,c.badge);
      add(23,10,18,6,c.dark);add(25,12,14,3,c.trim);
      add(15,38,8,9,c.dark);add(16,40,5,6,c.badge);
      add(41,38,8,9,c.dark);add(43,40,4,6,c.badge);
      add(27,45,10,3,c.trim);
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 64 64" shape-rendering="crispEdges"><title>'+c.name+'</title>'+o.join('')+'</svg>';
  }
  function frameURLs(set, action, dir) {
    const c = bySet.get(set);
    if (!c || !DIRECTIONS.includes(dir)) return [];
    const state = ['rot','walk','blink','sit','talk','type'].includes(action) ? action : 'rot';
    const key = set+'.'+state+'.'+dir;
    if (cache.has(key)) return cache.get(key);
    const n = state === 'walk' ? 8 : 2;
    const urls = Object.freeze(Array.from({length:n},(_,i) =>
      'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(sprite(c,state,dir,i))));
    cache.set(key,urls);
    return urls;
  }
  function still(set) { return frameURLs(set,'rot','south')[0] || ''; }
  function register() {
    if (typeof DATA === 'undefined' || !DATA.SKINS) return;
    for (const c of ALL_CHARACTERS) {
      DATA.SKINS[c.id] = { name:c.name, set:c.set, scale:0.26, sourceStandingHeight:103, originalArt:true };
    }
    DATA.DEFAULT_SKIN = 'mrln_nova';
  }
  function install(manifest) {
    if (!manifest || typeof manifest !== 'object') return false;
    if (!manifest.sprites || typeof manifest.sprites !== 'object') manifest.sprites = {};
    for (const c of ALL_CHARACTERS) {
      for (const dir of DIRECTIONS) {
        for (const state of ['rot','walk','blink','sit','talk','type'])
          manifest.sprites[c.set+'.'+state+'.'+dir] = frameURLs(c.set,state,dir);
      }
    }
    return true;
  }
  register();
  const api = { CHARACTERS:ALL_CHARACTERS, BASE_CHARACTERS:CHARACTERS, DIRECTIONS, skinIds:Object.freeze(ALL_CHARACTERS.map(c=>c.id)), register, install, frameURLs, still,
    isOriginalSet:set=>bySet.has(set), isOriginalSkin:id=>ALL_CHARACTERS.some(c=>c.id===id) };
  return Object.freeze(api);
})();
if (typeof module !== 'undefined' && module.exports) module.exports = MRLNCrewArt;
