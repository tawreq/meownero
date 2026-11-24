(()=>{
'use strict';
// ================= constants =================
const W=1280,H=720;            // screen
const WW=1900;                 // world width
const GY=640;                  // ground (world y == screen y at ground)
const HZ=455;                  // horizon line on screen
const LEFT=200,RIGHT=WW-200,FH=430,SC=FH/310;
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
const V='33';
const TAU=Math.PI*2;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>1-Math.pow(1-clamp(t,0,1),3);

// ================= roster =================
// sp.t: 'p' projectile, 'd' dash.  fx: projectile look.
const R=[
 {n:1,name:'EL GATO LOCO',c:'#E8382B',sp:{t:'d',name:'FLYING MEOWSAULT'},spd:1.05,pow:1.05},
 {n:2,name:'GILDED FANG',c:'#E0A82E',sp:{t:'p',name:'GOLD FANG',fx:'orb'},spd:1,pow:1},
 {n:3,name:'FROSTBITE',c:'#7FD3FF',sp:{t:'p',name:'ICE SHARD',fx:'shard'},spd:.95,pow:1.05},
 {n:4,name:'TUSK',c:'#C2261E',sp:{t:'d',name:'BULL RUSH'},spd:.92,pow:1.15},
 {n:5,name:'ANKH',c:'#8D5BE8',sp:{t:'p',name:'CURSE OF RA',fx:'orb'},spd:1,pow:1},
 {n:6,name:'WILDWOOD',c:'#6DBE45',sp:{t:'p',name:'THORN SEED',fx:'shard'},spd:.97,pow:1.05},
 {n:7,name:'RAZOR CLAW',c:'#F2B01E',sp:{t:'d',name:'BERSERKER FURY'},spd:1.08,pow:1.02},
 {n:8,name:'RED EYE',c:'#FF2A2A',sp:{t:'p',name:'EYE LASER',fx:'beam'},spd:1.02,pow:1},
 {n:9,name:'HEX',c:'#A46BFF',sp:{t:'p',name:'HEX BOLT',fx:'orb'},spd:1,pow:1},
 {n:10,name:'TOXIN',c:'#8CFF3A',sp:{t:'p',name:'GAS BOMB',fx:'orb'},spd:.98,pow:1.02},
 {n:11,name:'LOTUS',c:'#F2C14E',sp:{t:'p',name:'GOLDEN PALM',fx:'orb'},spd:1.05,pow:.95},
 {n:12,name:'CRIMSON',c:'#E0123C',sp:{t:'d',name:'BLOOD RUSH'},spd:1.06,pow:1},
 {n:13,name:'STORM',c:'#5AB8FF',sp:{t:'p',name:'THUNDER CLAP',fx:'beam'},spd:1.04,pow:1},
 {n:14,name:'HELLFIRE',c:'#FF7A1A',sp:{t:'p',name:'HELL SKULL',fx:'orb'},spd:.96,pow:1.1},
 {n:15,name:'TIDECALLER',c:'#2FD0C8',sp:{t:'p',name:'TIDAL ORB',fx:'orb'},spd:1,pow:1},
 {n:16,name:'MANTIS',c:'#9BD13B',sp:{t:'d',name:'PRAYING STRIKE'},spd:1.12,pow:.95},
 {n:17,name:'PRISM',c:'#D59BFF',sp:{t:'p',name:'RAINBOW SHARD',fx:'shard'},spd:1.02,pow:1},
 {n:18,name:'DRAGON LORD',c:'#FF4D1F',sp:{t:'p',name:'DRAGON BREATH',fx:'orb'},spd:.95,pow:1.12},
 {n:19,name:'NOMAD',c:'#D8B07A',sp:{t:'d',name:'SANDSTORM'},spd:1.08,pow:.98},
 {n:20,name:'ECLIPSE',c:'#6F5BFF',sp:{t:'p',name:'BLACK SUN',fx:'orb'},spd:1,pow:1.03},
 {n:21,name:'PLAGUE',c:'#5BFF7E',sp:{t:'p',name:'MIASMA',fx:'orb'},spd:.97,pow:1.03},
 {n:22,name:'IRONCLAD',c:'#C9A27A',sp:{t:'d',name:'IRON CHARGE'},spd:.88,pow:1.2},
 {n:23,name:'FROST JARL',c:'#A8DCFF',sp:{t:'p',name:'WINTER AXE',fx:'shard'},spd:.94,pow:1.12},
 {n:24,name:'QUETZAL',c:'#1FC7A0',sp:{t:'p',name:'FEATHER STORM',fx:'shard'},spd:1.05,pow:.98},
 {n:25,name:'WRAITH',c:'#B05CFF',sp:{t:'d',name:'PHANTOM STEP'},spd:1.1,pow:.95},
 {n:26,name:'MAGMA',c:'#FF6A00',sp:{t:'p',name:'LAVA BALL',fx:'orb'},spd:.9,pow:1.18},
 {n:27,name:'LUNA',c:'#E8E4FF',sp:{t:'p',name:'MOON BEAM',fx:'beam'},spd:1.02,pow:1},
 // --- new fighters ---
 {n:29,name:'THUNDER SAGE',c:'#7FB8FF',sp:{t:'p',name:'SKY JUDGEMENT'},spd:1.02,pow:1.02},
 {n:30,name:'WAR CHIEF',c:'#C98A3E',sp:{t:'p',name:'EAGLE STORM'},spd:1,pow:1.06},
 {n:31,name:'GLACIER',c:'#6FD0FF',sp:{t:'p',name:'FROST PATH'},spd:1,pow:1.04},
 {n:32,name:'SHADE',c:'#8A7BA8',sp:{t:'d',name:'SHADOW STEP'},spd:1.12,pow:.97},
 {n:40,name:'THE WARLORD',c:'#E0A030',sp:{t:'d',name:'WARHAMMER QUAKE'},spd:.95,pow:1.2,boss:1},
 {n:41,name:'SAFFRON',c:'#E8B04A',sp:{t:'p',name:'SUN PALM'},spd:1.02,pow:1},
 {n:42,name:'THE AGENT',c:'#7C8CA8',sp:{t:'d',name:'BLADE RUSH'},spd:1.08,pow:1},
 {n:43,name:'JACK O\' BLAZE',c:'#FF6A1A',sp:{t:'p',name:'HELLFIRE HEAD'},spd:.98,pow:1.08},
 {n:44,name:'THE GRINNER',c:'#7BD34A',sp:{t:'p',name:'LAUGHING GAS'},spd:1.02,pow:1},
 {n:45,name:'LA FURIA',c:'#E8302A',sp:{t:'d',name:'DIVING SPLASH'},spd:1.06,pow:1.06},
 {n:46,name:'STARLIGHT',c:'#FF6FB0',sp:{t:'p',name:'MOON TIARA'},spd:1.08,pow:.97},
 {n:47,name:'GOLDEN PALADIN',c:'#E6C04A',sp:{t:'p',name:'HOLY PILLAR'},spd:.94,pow:1.12},
 {n:48,name:'SMOKE SPECTER',c:'#B8BCC8',sp:{t:'p',name:'SMOKE SNARE'},spd:1.04,pow:1},
 {n:33,name:'MOON SAILOR',c:'#FFC94A',sp:{t:'p',name:'MOON HEART'},spd:1.06,pow:.98},
 {n:34,name:'PINK BLOSSOM',c:'#FF8FB8',sp:{t:'d',name:'BLOSSOM CUT'},spd:1.1,pow:.96},
 {n:35,name:'GHOST MASK',c:'#D8D8E0',sp:{t:'d',name:'BEHIND YOU'},spd:1.08,pow:1},
 {n:36,name:'NIGHT BLADE',c:'#C21A2A',sp:{t:'p',name:'GLAIVE THROW'},spd:1.04,pow:1.06},
 {n:37,name:'INFERNO',c:'#FF6A1A',sp:{t:'p',name:'HELL CHAIN'},spd:1.04,pow:1.06},
 {n:38,name:'CHAIN PRIEST',c:'#C21A2A',sp:{t:'p',name:'BINDING CHAINS'},spd:.98,pow:1.06},
 {n:39,name:'SCARECROW',c:'#A8A040',sp:{t:'p',name:'FEAR GAS'},spd:1,pow:1.02},
 {n:50,name:'NIGHTMARE',c:'#E0402A',sp:{t:'d',name:'DREAM CLAWS'},spd:1.08,pow:1},
 {n:51,name:'THE SLASHER',c:'#C8B898',sp:{t:'d',name:'MACHETE FRENZY'},spd:.96,pow:1.12},
 {n:52,name:'THE DROWNED',c:'#7FB8D8',sp:{t:'p',name:'DROWNING TIDE'},spd:1.02,pow:1},
 {n:49,name:'RONIN',c:'#9A2A3A',sp:{t:'p',name:'SHURIKEN STORM'},spd:1.06,pow:1.04},
 {n:28,name:'GEARHEAD',c:'#3FE3E0',sp:{t:'p',name:'STEAM CANNON',fx:'orb'},spd:.96,pow:1.08},
];
// Core players (selectable) and the enemy roster (CPU opponents)
const PLAYER_IDS=[1,33,34,5,37,30,31,38,39,35,50,32,36,29];
const ENEMY_IDS=[42,43,44,45,46,47,48,49,51,52];
const TEST=true;
const byN=n=>R.find(d=>d&&d.n===n);
const SLOTS=PLAYER_IDS.map(byN),ENEMIES=ENEMY_IDS.map(byN);
const POSED=new Set([...PLAYER_IDS,...ENEMY_IDS]);
const PLAYABLE=[...SLOTS,...ENEMIES];
const pad=n=>String(n).padStart(2,'0');

// ================= assets =================
const IMG={body:{},por:{},px:{},punch:{},kick:{},block:{}};
const PANCH={7:.5,1:.442,2:.418,3:.431,4:.419,5:.448,6:.42,8:.41,9:.45,10:.43,11:.436,12:.449,13:.412,14:.453,15:.437,16:.44,17:.43,18:.431,19:.455,20:.426,21:.456,22:.449,23:.441,24:.44,25:.44,26:.427,27:.428,28:.459};
function load(src,tries=0){return new Promise(res=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>{if(tries<6)setTimeout(()=>load(src,tries+1).then(res),800*(tries+1));else res(null)};i.src=src+'?v='+V+(tries?'&r='+tries:'')})}
let loaded=0;const total=PLAYABLE.length*2;
{const li=new Image();li.fetchPriority='high';li.onload=()=>{IMG.logo=li};li.onerror=()=>load('/kombat/logo.webp').then(i=>{IMG.logo=i});li.src='/kombat/logo.webp?v='+V}
function drawLogo(cx,cy,w,glow){const L=IMG.logo;if(!L)return false;const h=w*L.height/L.width;ctx.save();if(glow){ctx.shadowColor='rgba(255,110,30,.55)';ctx.shadowBlur=glow}ctx.drawImage(L,cx-w/2,cy-h/2,w,h);ctx.restore();return true}
PLAYABLE.forEach(f=>{
 load(`/kombat/f/${pad(f.n)}.webp`).then(i=>{IMG.body[f.n]=i;loaded++});
 load(`/kombat/p/${pad(f.n)}.webp`).then(i=>{IMG.por[f.n]=i;loaded++});
 if(POSED.has(f.n))PANCH[f.n]=.5;
 if(PANCH[f.n])load(`/kombat/f/${pad(f.n)}-punch.webp`).then(i=>{if(i)IMG.punch[f.n]=i});
 if(POSED.has(f.n)){for(const k of ['kick','block'])load(`/kombat/f/${pad(f.n)}-${k}.webp`).then(i=>{if(i)IMG[k][f.n]=i})}
});
if(document.fonts)document.fonts.load('80px "Anton"').catch(()=>{});
// pixel sample of a sprite (for the finisher burst)
function pixelsOf(n){if(IMG.px[n])return IMG.px[n];const img=IMG.body[n];if(!img)return[];const c=document.createElement('canvas'),w=46,h=Math.round(46*img.height/img.width);c.width=w;c.height=h;const g=c.getContext('2d');g.drawImage(img,0,0,w,h);let d;try{d=g.getImageData(0,0,w,h).data}catch(e){return[]}const out=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(d[i+3]>140)out.push({u:x/w,v:y/h,c:`rgb(${d[i]},${d[i+1]},${d[i+2]})`})}IMG.px[n]=out;return out}

// ================= storage =================
const store={get(k,d){try{const v=localStorage.getItem('mk_'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('mk_'+k,JSON.stringify(v))}catch(e){}}};

// ================= sound =================
let AC=null,muted=store.get('muted',false);
const muteBtn=document.getElementById('mute');
function syncMute(){muteBtn.textContent=muted?'SOUND OFF':'SOUND ON';muteBtn.setAttribute('aria-pressed',String(muted))}
syncMute();muteBtn.addEventListener('click',()=>{muted=!muted;store.set('muted',muted);syncMute();muteBtn.blur();if(muted&&typeof ambient==='function')ambient('');else if(scene==='fight'&&typeof AMB!=='undefined'){const am=AMB[A.id];if(am){SND.ambName='';ambient(am[0],am[1])}}});
function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();setTimeout(sndInit,0)}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();return AC}
function noise(dur,freq,vol,type='lowpass'){const a=ac();if(!a||muted)return;const n=a.createBufferSource(),b=a.createBuffer(1,Math.floor(a.sampleRate*dur),a.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2);n.buffer=b;const f=a.createBiquadFilter();f.type=type;f.frequency.value=freq;const g=a.createGain();g.gain.value=vol;n.connect(f).connect(g).connect(a.destination);n.start()}
function tone(f0,f1,dur,type,vol){const a=ac();if(!a||muted)return;const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f0,a.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),a.currentTime+dur);g.gain.setValueAtTime(vol,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+dur);o.connect(g).connect(a.destination);o.start();o.stop(a.currentTime+dur)}
const SFX={
 thud:()=>{tone(90,30,.35,'sine',.4);noise(.25,400,.12,'lowpass')},
 whoosh:()=>noise(.14,2200,.16,'bandpass'),
 heavyWhoosh:()=>noise(.22,1200,.22,'bandpass'),
 hit:()=>{noise(.18,800,.55);tone(170,55,.16,'square',.13)},
 heavy:()=>{noise(.3,500,.7);tone(120,35,.3,'sawtooth',.16)},
 block:()=>{tone(1100,600,.07,'square',.08);noise(.05,4000,.14,'highpass')},
 special:()=>{tone(200,900,.32,'sawtooth',.09);noise(.25,3000,.08,'highpass')},
 ko:()=>{tone(300,40,1.1,'sawtooth',.2);noise(.8,350,.5)},
 thunder:()=>{if(!play(Math.random()<.5?'thunder':'thunderboom',{vol:.85})){noise(.9,600,.7);tone(90,30,.8,'sawtooth',.15)}},
 select:()=>tone(660,990,.08,'square',.07),
 move:()=>tone(440,440,.03,'square',.04),
 bell:()=>{tone(880,860,.7,'triangle',.15);tone(1320,1300,.6,'sine',.06)},
 land:()=>noise(.1,300,.25),
};
// guard
// ================= guard (block) visuals — tinted per fighter =================
function mixC(hex,to,k){const a=parseInt(hex.slice(1),16),b=parseInt(to.slice(1),16);const r=Math.round(((a>>16)&255)*(1-k)+((b>>16)&255)*k),g=Math.round(((a>>8)&255)*(1-k)+((b>>8)&255)*k),bl=Math.round((a&255)*(1-k)+(b&255)*k);return '#'+((1<<24)|(r<<16)|(g<<8)|bl).toString(16).slice(1)}
function guardImpact(def,att,hy){const c=def.def.c,x=def.x+def.facing*88*SC;def.guardHit=1;def.guardY=hy;def.guardCr=[...Array(3+Math.floor(Math.random()*3))].map(()=>{const pts=[[0,0]];let a=(Math.random()-.5)*2.4,x0=0,y0=0;for(let i=0;i<4;i++){a+=(Math.random()-.5)*.9;x0+=Math.cos(a)*14*SC;y0+=Math.sin(a)*14*SC;pts.push([x0,y0])}return pts});
 spark(x,hy,mixC(c,'#ffffff',.55),14,.9);spark(x,hy,'#ffffff',6,.7);lightsPulse.push({x,y:hy,c,t:0,life:.25,r:420*SC,a:.45});
 const fx=def.x-def.facing*10*SC,d=-def.facing;for(let i=0;i<8;i++)aura.push({e:'smoke',x:fx+(Math.random()-.5)*60*SC,y:GY-4,vx:d*(80+Math.random()*120),vy:-20-Math.random()*40,t:0,life:.6,s:(10+Math.random()*8)*SC,c:mixC(c,'#6a5a50',.7)});
 const sx=def.x;addFx(1.2,(k)=>{ctx.save();ctx.globalAlpha=.35*(1-k);ctx.strokeStyle='#1a1410';ctx.lineWidth=3;for(const o of [-22,22]){ctx.beginPath();ctx.moveTo(sx+o*SC,GY+1);ctx.lineTo(sx+o*SC-def.facing*40*SC,GY+1);ctx.stroke()}ctx.restore()})}
function drawGuard(f,t,w,h){const dt=Math.min(.05,Math.max(0,t-(f._gt??t)));f._gt=t;f.bt=f.st==='block'?Math.min(1,(f.bt||0)+dt*9):Math.max(0,(f.bt||0)-dt*6);f.guardHit=Math.max(0,(f.guardHit||0)-dt*2.6);
 const up=ease(f.bt),gh=f.guardHit||0;if(up<.01&&gh<.01)return;const c=f.def.c,cl=mixC(c,'#ffffff',.6),cd=mixC(c,'#000000',.45);
 const fd=f.facing,R=h*.44*(.85+.15*up)+gh*10*SC,cx=f.x+fd*(88*SC-R),cy=f.y-h*.5,a0=-.95,a1=.95;
 ctx.save();ctx.translate(cx,cy);ctx.scale(fd,1);
 // shield body (thin convex lens, fresnel edges)
 ctx.beginPath();ctx.arc(0,0,R,a0,a1);ctx.arc(-R*.18,0,R*.93,a1,a0,true);ctx.closePath();ctx.save();ctx.clip();
 const g=ctx.createRadialGradient(-R*.2,0,R*.6,0,0,R*1.02);g.addColorStop(0,hexA(c,0));g.addColorStop(.7,hexA(c,.16*up+.18*gh));g.addColorStop(1,hexA(cl,.5*up+.3*gh));ctx.fillStyle=g;ctx.fillRect(-R,-R,R*2.1,R*2);
 // hex lattice
 ctx.globalCompositeOperation='lighter';ctx.strokeStyle=hexA(cl,.16*up+.3*gh);ctx.lineWidth=1;const s=13*SC;for(let yy=-R;yy<R;yy+=s*1.5){for(let xx=R*.45;xx<R*1.05;xx+=s*1.73){const ox=xx+((Math.round(yy/(s*1.5))&1)?s*.86:0);ctx.beginPath();for(let k=0;k<6;k++){const an=k*Math.PI/3+Math.PI/6;ctx.lineTo(ox+Math.cos(an)*s*.55,yy+Math.sin(an)*s*.55)}ctx.closePath();ctx.stroke()}}
 // scan line
 const sy=((t*1.3)%1)*2-1;const sg=ctx.createLinearGradient(0,sy*R-14*SC,0,sy*R+14*SC);sg.addColorStop(0,hexA(cl,0));sg.addColorStop(.5,hexA(cl,.22*up));sg.addColorStop(1,hexA(cl,0));ctx.fillStyle=sg;ctx.fillRect(-R,sy*R-14*SC,R*2.1,28*SC);
 // impact ripple + cracks
 if(gh>0){const iy=(f.guardY??cy)-cy,ix=R*.96;for(let i=0;i<3;i++){const rr=(1-gh)*R*(.6+i*.35);ctx.strokeStyle=hexA(i?cl:'#ffffff',gh*(.8-i*.2));ctx.lineWidth=(3-i)*SC;ctx.beginPath();ctx.arc(ix,iy,Math.max(1,rr),0,TAU);ctx.stroke()}
  ctx.strokeStyle=hexA('#ffffff',gh*.9);ctx.lineWidth=1.6;for(const cr of f.guardCr||[]){ctx.beginPath();cr.forEach(([px,py],k)=>k?ctx.lineTo(ix+px*Math.min(1,(1-gh)*4+.3),iy+py*Math.min(1,(1-gh)*4+.3)):ctx.moveTo(ix,iy));ctx.stroke()}
  const fl=ctx.createRadialGradient(ix,iy,0,ix,iy,R*.6);fl.addColorStop(0,hexA('#ffffff',.6*gh));fl.addColorStop(.3,hexA(c,.35*gh));fl.addColorStop(1,hexA(c,0));ctx.fillStyle=fl;ctx.fillRect(ix-R*.6,iy-R*.6,R*1.2,R*1.2)}
 ctx.restore();
 // rim lines
 ctx.globalCompositeOperation='lighter';ctx.shadowColor=c;ctx.shadowBlur=(8+gh*18)*SC;ctx.strokeStyle=hexA(cl,.75*up+.25*gh);ctx.lineWidth=(2.4+gh*2.5)*SC;ctx.beginPath();ctx.arc(0,0,R,a0+.05,a1-.05);ctx.stroke();
 ctx.shadowBlur=0;ctx.strokeStyle=hexA(cd,.35*up);ctx.lineWidth=1.2*SC;ctx.beginPath();ctx.arc(-R*.18,0,R*.93,a0+.12,a1-.12);ctx.stroke();
 // edge nodes
 for(const an of [a0+.05,a1-.05]){ctx.fillStyle=hexA(cl,.7*up+.3*gh);ctx.beginPath();ctx.arc(Math.cos(an)*R,Math.sin(an)*R,(3+gh*3)*SC,0,TAU);ctx.fill()}
 ctx.restore()}

// ================= sample sound bank (Splice one-shots, see /kombat/sfx) =================
const SNDLIST=["agony", "amb_crowd", "amb_float", "amb_forest", "appear", "armor1", "armor2", "armor3", "armor4", "armor5", "bats", "batwings", "block1", "block2", "bodydrop", "bone1", "bone10", "bone11", "bone12", "bone13", "bone14", "bone15", "bone16", "bone17", "bone18", "bone19", "bone2", "bone3", "bone4", "bone5", "bone6", "bone7", "bone8", "bone9", "breath", "breathe", "carcrash", "chaingate", "cheetah", "clown", "creak1", "creak2", "creak3", "creak4", "creak5", "creak6", "creaturestep", "crow", "crowdchaos", "crunchl1", "crunchl2", "crunchl3", "crunchl4", "darksky", "demented", "dwarflaugh", "explosion", "fhit1", "fhit2", "fhit3", "fireball", "glitch", "goo1", "goo2", "goo3", "goo4", "goo5", "goo6", "gravity", "growl1", "growl2", "growl3", "gusts", "gwhisper", "hammer", "hard1", "hard10", "hard2", "hard3", "hard4", "hard5", "hard6", "hard7", "hard8", "hard9", "heart1", "heart2", "heartbeat", "hitwave", "impactsub", "jbowed", "jstab", "kick1", "kick2", "kick3", "kick4", "kick5", "kidlaugh", "knife1", "knife2", "knifefin", "land1", "land2", "land3", "land4", "land5", "land6", "land7", "lava", "lightcast", "log", "machinery", "meow1", "meow2", "meow3", "meow4", "meow5", "meow6", "meow7", "meowpurr", "mvh1", "mvh2", "mvh3", "mvh4", "mvh5", "mvh6", "mvh7", "ninjajump", "orccough", "owl", "pad1", "pad2", "pad3", "pestab1", "pestab2", "punch1", "punch2", "punch3", "punch4", "punch5", "punch6", "purr", "quake", "rippler", "rumble", "scream1", "scream2", "scream3", "scream4", "screamhit", "sewer", "sheath", "shimmer", "slambarrel", "slamcrack", "slap1", "slap2", "slap3", "slap4", "slap5", "snap1", "snap2", "snap3", "snap4", "snarl", "sniff", "spell", "spit", "splash1", "splash2", "splash3", "splash4", "squelch1", "squelch10", "squelch11", "squelch12", "squelch13", "squelch14", "squelch2", "squelch3", "squelch4", "squelch5", "squelch6", "squelch7", "squelch8", "squelch9", "stab1", "stab2", "stab3", "stab4", "stab5", "strangewind", "subboom", "swell", "swordscrape", "thud", "thunder", "thunderboom", "undead", "unsheathe", "watersplash", "weff1", "weff2", "weff3", "weff4", "weff5", "whisp2", "whisp3", "whispers", "whs1", "whs2", "whs3", "whs4", "whs5", "whs6", "whs7", "whs8", "windstorm", "woodpecker", "wrope1", "wrope2", "wrope3", "wsnarl", "wspin1", "wspin2", "wspin3", "wsw1", "wsw10", "wsw11", "wsw12", "wsw2", "wsw3", "wsw4", "wsw5", "wsw6", "wsw7", "wsw8", "wsw9"];
const SND={buf:{},started:false,active:0,master:null,amb:null,ambName:''};
function sndInit(){const a=AC;if(!a||SND.started)return;SND.started=true;SND.master=a.createGain();SND.master.gain.value=.9;const comp=a.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;SND.master.connect(comp);comp.connect(a.destination);
 let i=0;const next=()=>{if(i>=SNDLIST.length)return;const n=SNDLIST[i++];fetch('/kombat/sfx/'+n+'.mp3?v='+V).then(r=>r.arrayBuffer()).then(ab=>new Promise((res,rej)=>a.decodeAudioData(ab,res,rej))).then(b=>{SND.buf[n]=b}).catch(()=>{}).finally(next)};for(let k=0;k<6;k++)next()}
function play(n,o={}){const a=ac();if(!a||muted||!SND.master)return false;const b=SND.buf[n];if(!b)return false;if(SND.active>28&&!o.force)return true;
 const s=a.createBufferSource();s.buffer=b;s.playbackRate.value=(o.rate||1)*(1+(Math.random()-.5)*(o.jit??.08));const g=a.createGain();g.gain.value=o.vol??.8;s.connect(g);let out=g;
 if(o.pan!=null&&a.createStereoPanner){const p=a.createStereoPanner();p.pan.value=clamp(o.pan,-1,1);g.connect(p);out=p}out.connect(SND.master);SND.active++;s.onended=()=>{SND.active--};s.start(a.currentTime+(o.delay||0));return true}
const pv=(base,count,o)=>play(base+(1+Math.floor(Math.random()*count)),o);
const panOf=f=>f?clamp((f.x-cam.x)/700,-.8,.8):0;
function ambient(name,vol){const a=AC;if(!a||!SND.master)return;if(SND.ambName===name)return;if(SND.amb){try{SND.amb.s.stop()}catch(e){}SND.amb=null}SND.ambName=name;if(!name||muted)return;const b=SND.buf[name];if(!b){SND.ambName='';return}
 const s=a.createBufferSource();s.buffer=b;s.loop=true;const g=a.createGain();g.gain.value=vol;s.connect(g);g.connect(SND.master);s.start();SND.amb={s,g,vol}}
const AMB={tokyo:['amb_crowd',.16],mountain:['amb_float',.22],jungle:['amb_forest',.28]};
// per-character voice (cat vocals only) + action-matched sound sets
const CATV=['meow1','meow2','meow3','meow4','meow5','meow6','meow7'],GRR=['snarl','wsnarl','growl1','growl2','growl3'];
const VOX={};for(const d of R)if(d){const n=d.n,r=.82+((n*37)%40)/100;VOX[n]={rate:r,hurt:[CATV[n%7],CATV[(n*3+1)%7]],ko:GRR[n%5],win:(n%2?'meowpurr':'purr')}}
const vox=f=>VOX[f.def.n]||{rate:1,hurt:['meow1'],ko:'snarl',win:'meowpurr'};
const BLADE=new Set([34,36,49,51,50,32,37]);
// special-move sounds: [cast, impact] — null = keep the original synth
const SPSND={leap:['ninjajump','slambarrel'],homing:['spell',null],teleslash:['unsheathe','knifefin'],sunpillar:['spell','impactsub'],chainhook:['chaingate','stab'],feathers:['batwings',null],
 icepath:['gusts',null],chainsnare:['chaingate',null],cloud:[null,null],phase:['appear','hard'],flurry:['knife1','knife2'],spread:['wspin',null],axe:['wspin','stab'],lightning:['lightcast','thunder'],
 laser:[null,null],skull:['fireball','explosion'],gasbomb:['wsw',null],quake:['ninjajump','quake'],crescent:['wsw',null],palm:[null,'impactsub'],blackhole:['rumble',null],rush:['unsheathe','knifefin'],tornado:['knife1','knife2'],wave:['watersplash','watersplash']};
const pvar=(base,count)=>base+(1+Math.floor(Math.random()*count));
function sndHit(att,def,heavy,blocked,move){const o={pan:panOf(def)};
 if(blocked){if(!pv('block',2,{...o,vol:.75}))SFX.block();return}
 const kick=move==='kick'||move==='akick',up=move==='upper',bl=BLADE.has(att.def.n)&&att.st!=='kick';
 let ok;
 if(kick){ok=pv('kick',5,{...o,vol:.9,rate:heavy?.92:1.05});if(heavy&&Math.random()<.4)pv('kbone',4,{...o,vol:.5})}
 else if(up){ok=pv('hard',10,{...o,vol:.95,rate:.95});if(Math.random()<.4)pv('shat',3,{...o,vol:.5})}
 else{ok=heavy?pv('hard',10,{...o,vol:.95}):pv('punch',6,{...o,vol:.85,rate:1+(Math.random()-.5)*.12})}
 if(!ok)heavy?SFX.heavy():SFX.hit();
 if(Math.random()<(heavy?.55:.25)){const D=vox(def);play(pick(D.hurt),{...o,vol:.45,rate:D.rate,delay:.05})}}
function sndSwing(f,heavy){const kick=f.st==='kick'||f.st==='akick';if(kick){if(!pv('whs',8,{pan:panOf(f),vol:heavy?.65:.5}))SFX.whoosh();return}
 if(BLADE.has(f.def.n)){if(!pv('wsw',12,{pan:panOf(f),vol:.55}))SFX.whoosh();return}heavy?SFX.heavyWhoosh():SFX.whoosh()}
function sndCast(f){const k=f.def.sp&&f.def.sp.k,s=SPSND[k];if(s&&s[0]){const n=s[0]==='wspin'?pvar('wspin',3):s[0]==='wsw'?pvar('wsw',12):s[0];if(play(n,{pan:panOf(f),vol:.8}))return}SFX.special()}
function sndSpecialHit(att,def){const k=att.def.sp&&att.def.sp.k,s=SPSND[k];if(s&&s[1]){const n=s[1]==='hard'?pvar('hard',10):s[1]==='stab'?pvar('stab',5):s[1];if(play(n,{pan:panOf(def),vol:.85}))return}SFX.heavy()}
function sndKO(loser){const V=vox(loser);play(V.ko,{vol:.85,rate:V.rate,force:true});if(!play('bodydrop',{vol:.9,delay:.45,force:true}))SFX.ko()}
function sndWin(w){const V=vox(w);play(V.win,{vol:.7,rate:V.rate,force:true})}
const FINSFX={slam:'slambarrel',gild:'lava',freeze:'gusts',gore:null,sand:'windstorm',roots:'whispers',split:'unsheathe',toxic:'orccough',palm:'impactsub',zap:'thunder',burn:'fireball',bubble:'watersplash',crystal:null,vortex:'rumble',feathers:'batwings',spirit:'gwhisper',meteor:'explosion',beam:null,steam:null,chains:'chaingate',claws:'knife2',crowbar:null,slices:'unsheathe',bullets:'gunload',chop:'unsheathe',lunarfall:'rumble',molten:'lava',impale:'jstab',well:'watersplash',smother:'breathe'};
function sndGore(big){pv('squelch',14,{vol:.75});pv(big?'bone':'snap',big?19:4,{vol:.85,delay:.03});if(big){pv('goo',6,{vol:.65,delay:.08});pv('splash',4,{vol:.55,delay:.12})}}
function gunshot(){noise(.09,3200,.7,'highpass');noise(.18,600,.6);tone(160,50,.12,'square',.12)}

// ================= input =================
const keys={},pressed={};
const KMAP={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',KeyJ:'punch',KeyZ:'punch',KeyK:'kick',KeyX:'kick',KeyL:'special',KeyC:'special',Enter:'start',Space:'start',Escape:'back'};
addEventListener('keydown',e=>{const k=KMAP[e.code];if(!k)return;if(e.target&&e.target.closest&&e.target.closest('a,input,textarea'))return;e.preventDefault();ac();if(!keys[k])pressed[k]=true;keys[k]=true});
addEventListener('keyup',e=>{const k=KMAP[e.code];if(k)keys[k]=false});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false});
document.querySelectorAll('#pad button').forEach(b=>{const k=b.dataset.k;
 const on=e=>{e.preventDefault();ac();if(!keys[k])pressed[k]=true;keys[k]=true;b.classList.add('on');try{b.setPointerCapture(e.pointerId)}catch(_){}};
 const off=()=>{keys[k]=false;b.classList.remove('on')};
 b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('lostpointercapture',off);b.addEventListener('contextmenu',e=>e.preventDefault())});
const take=k=>{const v=pressed[k];pressed[k]=false;return v};
function canvasPoint(e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}}
let click=null,hover=null;
cv.addEventListener('pointerdown',e=>{ac();click=canvasPoint(e)});
cv.addEventListener('pointermove',e=>{if(e.pointerType==='mouse')hover=canvasPoint(e)});

// ================= text helpers =================
const ANTON='"Anton",Impact,sans-serif',DELA='"Dela Gothic One","Anton",sans-serif',MONO='"DM Mono",monospace';
function txt(s,x,y,size,fill,o={}){ctx.save();ctx.font=`${size}px ${o.family||ANTON}`;ctx.textAlign=o.align||'center';ctx.textBaseline='alphabetic';
 if(o.glow){ctx.shadowColor=o.glow;ctx.shadowBlur=size*.5}
 if(o.stroke){ctx.lineJoin='round';ctx.lineWidth=o.sw||size*.14;ctx.strokeStyle=o.stroke;ctx.strokeText(s,x,y)}
 ctx.shadowBlur=0;
 if(o.metal){const g=ctx.createLinearGradient(0,y-size,0,y);g.addColorStop(0,'#fff6d8');g.addColorStop(.45,o.metal);g.addColorStop(.55,'#6b3a0c');g.addColorStop(1,o.metal);ctx.fillStyle=g}else ctx.fillStyle=fill;
 ctx.fillText(s,x,y);ctx.restore()}
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}

// ================= camera =================
const cam={x:WW/2,z:1,tx:WW/2,tz:1,shake:0,kick:0};
function camApply(par){// par = parallax factor (1 = world)
 const zb=1+(cam.z-1)*par,z=1+(cam.z+(typeof cine!=='undefined'?cine.punch:0)-1)*par, x=WW/2+(cam.x-WW/2)*par;
 const sx=(Math.random()-.5)*cam.shake*60,sy=(Math.random()-.5)*cam.shake*40;
 const py=GY-FH*.5,ty=(py*zb+GY-GY*zb)-py*z;
 ctx.setTransform(z,0,0,z,W/2-x*z+sx,ty+sy+cam.kick*8)}
function camReset(){ctx.setTransform(1,0,0,1,0,0)}
function updateCam(dt,a,b,focus){cineUpd(dt);gatherLights(dt);
 if(finish&&(finish.run!=null||finish.armed)){const L=finish.loser,Wn=finish.winner;const lx=L.x+(L.fx?L.fx.ox:0);cam.tx=Math.abs(lx-L.x)>200?lx*.8+Wn.x*.2:lx*.6+Wn.x*.4;cam.tz=cine.z}else if(focus){cam.tx=focus.x;cam.tz=1.35}else if(a&&b){const d=Math.abs(a.x-b.x);cam.tz=clamp(1300/(d+900),.92,1.12);cam.tx=(a.x+b.x)/2}else{cam.tx=WW/2;cam.tz=1}
 const half=W/2/cam.tz;cam.tx=clamp(cam.tx,half,WW-half);
 const k=1-Math.pow(.0009,dt);cam.x+=(cam.tx-cam.x)*k;cam.z+=(cam.tz-cam.z)*k;
 cam.shake=Math.max(0,cam.shake-dt*1.6);cam.kick*=Math.pow(.02,dt)}
// ================= arenas =================
const FAR_W=2300;
function mkCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function seeded(s){return()=>(s=(s*16807)%2147483647)/2147483647}
// fine grain texture used to break up flat colours
const GRAIN=(()=>{const c=mkCanvas(256,256),g=c.getContext('2d'),d=g.createImageData(256,256);for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}g.putImageData(d,0,0);return c})();
function grain(g,x,y,w,h,a,mode='overlay'){g.save();g.globalAlpha=a;g.globalCompositeOperation=mode;const p=g.createPattern(GRAIN,'repeat');g.fillStyle=p;g.fillRect(x,y,w,h);g.restore()}
function blurInto(src,px){const c=mkCanvas(src.width,src.height),g=c.getContext('2d');g.filter=`blur(${px}px)`;g.drawImage(src,0,0);return c}

// ---------- 1. SHADOW TEMPLE ----------
function paintTemple(){const c=mkCanvas(FAR_W,H),g=c.getContext('2d'),rnd=seeded(11);
 const sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#07060c');sky.addColorStop(.6,'#1a1722');sky.addColorStop(1,'#0b0a0f');g.fillStyle=sky;g.fillRect(0,0,FAR_W,H);
 // stone blocks with per-block shading and chips
 for(let y=0;y<HZ+30;y+=34){const off=(Math.floor(y/34)%2)*44;for(let x=-88+off;x<FAR_W;x+=88){const v=24+rnd()*22;const bg=g.createLinearGradient(0,y,0,y+32);bg.addColorStop(0,`rgb(${v+10},${v+8},${v+16})`);bg.addColorStop(1,`rgb(${v-6},${v-8},${v-2})`);g.fillStyle=bg;g.fillRect(x+2,y+2,84,30);if(rnd()<.25){g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.arc(x+rnd()*84,y+rnd()*30,2+rnd()*5,0,TAU);g.fill()}if(rnd()<.15){g.fillStyle='rgba(60,90,50,.25)';g.fillRect(x+2,y+20+rnd()*10,84*rnd(),6)}}}
 grain(g,0,0,FAR_W,HZ+30,.18);
 // arched alcoves with ghost-cat statues and moonlit windows
 for(let i=0;i<7;i++){const x=150+i*330,y=70,w=150,h=300;
  g.save();g.beginPath();g.moveTo(x,y+h);g.lineTo(x,y+w/2);g.arc(x+w/2,y+w/2,w/2,Math.PI,0);g.lineTo(x+w,y+h);g.closePath();
  const ag=g.createLinearGradient(0,y,0,y+h);if(i%2){ag.addColorStop(0,'#33476e');ag.addColorStop(1,'#121829')}else{ag.addColorStop(0,'#0e0d13');ag.addColorStop(1,'#050508')}g.fillStyle=ag;g.fill();g.clip();
  if(i%2){g.fillStyle='rgba(230,235,255,.9)';g.beginPath();g.arc(x+w*.68,y+70,26,0,TAU);g.fill();g.fillStyle='rgba(20,25,45,.9)';for(let k=0;k<5;k++){g.fillRect(x+k*34,y+170+k*8,30,200)}}
  else{// statue silhouette: hooded cat
   const sx=x+w/2,sy=y+h;g.fillStyle='#2a2733';g.beginPath();g.moveTo(sx-50,sy);g.quadraticCurveTo(sx-58,sy-140,sx-30,sy-190);g.lineTo(sx-34,sy-232);g.lineTo(sx-14,sy-205);g.lineTo(sx+14,sy-205);g.lineTo(sx+34,sy-232);g.lineTo(sx+30,sy-190);g.quadraticCurveTo(sx+58,sy-140,sx+50,sy);g.closePath();g.fill();
   g.fillStyle='rgba(255,140,50,.55)';g.beginPath();g.ellipse(sx-12,sy-178,6,4,0,0,TAU);g.ellipse(sx+12,sy-178,6,4,0,0,TAU);g.fill();
   const rim=g.createLinearGradient(sx-60,0,sx+60,0);rim.addColorStop(0,'rgba(255,140,60,.25)');rim.addColorStop(.5,'rgba(0,0,0,0)');g.fillStyle=rim;g.fillRect(sx-60,sy-240,120,240)}
  g.restore();g.strokeStyle='#4a4656';g.lineWidth=12;g.beginPath();g.moveTo(x,y+h);g.lineTo(x,y+w/2);g.arc(x+w/2,y+w/2,w/2,Math.PI,0);g.lineTo(x+w,y+h);g.stroke()}
 // banners
 for(let i=0;i<7;i++){const bx=315+i*330-165;g.fillStyle='#5e140d';g.beginPath();g.moveTo(bx-34,20);g.lineTo(bx+34,20);g.lineTo(bx+34,320);g.lineTo(bx,292);g.lineTo(bx-34,320);g.closePath();g.fill();const sh=g.createLinearGradient(bx-34,0,bx+34,0);sh.addColorStop(0,'rgba(0,0,0,.45)');sh.addColorStop(.5,'rgba(255,255,255,.08)');sh.addColorStop(1,'rgba(0,0,0,.45)');g.fillStyle=sh;g.fill();g.strokeStyle='#b8862e';g.lineWidth=3;g.stroke();
  g.fillStyle='#d9a542';g.fillRect(bx-42,14,84,8);g.save();g.fillStyle='#FA691D';g.globalAlpha=.85;g.font='26px "Dela Gothic One",sans-serif';g.textAlign='center';['ミ','ャ','ウ','ネ','ロ'].forEach((ch,k)=>g.fillText(ch,bx,72+k*42));g.restore()}
 const fade=g.createLinearGradient(0,0,0,HZ+30);fade.addColorStop(0,'rgba(5,4,8,.88)');fade.addColorStop(.55,'rgba(5,4,8,.18)');fade.addColorStop(1,'rgba(5,4,8,.75)');g.fillStyle=fade;g.fillRect(0,0,FAR_W,HZ+30);
 return blurInto(c,.6)}

// ---------- 2. NEON ROOFTOP (rainy city night) ----------
function paintRooftop(){const c=mkCanvas(FAR_W,H),g=c.getContext('2d'),rnd=seeded(7);
 const sky=g.createLinearGradient(0,0,0,HZ);sky.addColorStop(0,'#05060f');sky.addColorStop(.6,'#1b1035');sky.addColorStop(1,'#3a1640');g.fillStyle=sky;g.fillRect(0,0,FAR_W,H);
 // clouds lit by the city
 g.save();g.globalAlpha=.35;for(let i=0;i<40;i++){const x=rnd()*FAR_W,y=20+rnd()*160,r=60+rnd()*140;const cg=g.createRadialGradient(x,y,0,x,y,r);cg.addColorStop(0,'rgba(120,60,140,.5)');cg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=cg;g.fillRect(x-r,y-r,r*2,r*2)}g.restore();
 // three layers of buildings, far ones hazy
 const layer=(base,minH,maxH,col,win,seed)=>{const r=seeded(seed);let x=-40;while(x<FAR_W){const w=60+r()*140,h=minH+r()*(maxH-minH);g.fillStyle=col;g.fillRect(x,base-h,w,h+40);
  if(r()<.3){g.fillRect(x+w*.4,base-h-50,4,50)}
  for(let wy=base-h+12;wy<base-6;wy+=14)for(let wx=x+8;wx<x+w-8;wx+=12){if(r()<win){const k=r();g.fillStyle=k<.6?`rgba(255,210,140,${.35+r()*.5})`:k<.8?`rgba(120,220,255,${.4+r()*.4})`:`rgba(255,90,200,${.4+r()*.4})`;g.fillRect(wx,wy,6,8)}}
  x+=w+4+r()*10}};
 layer(HZ-10,140,330,'#160f24',.18,3);g.fillStyle='rgba(58,22,64,.45)';g.fillRect(0,0,FAR_W,HZ);layer(HZ+10,80,240,'#0d0916',.28,5);layer(HZ+30,40,150,'#07060b',.35,9);
 // neon signs
 const neon=(x,y,txtS,col,sz,vert)=>{g.save();g.font=`${sz}px "Dela Gothic One",sans-serif`;g.textAlign='center';g.shadowColor=col;g.shadowBlur=24;g.fillStyle=col;if(vert)[...txtS].forEach((ch,k)=>g.fillText(ch,x,y+k*sz*1.05));else g.fillText(txtS,x,y);g.shadowBlur=6;g.fillStyle='#fff';g.globalAlpha=.6;if(vert)[...txtS].forEach((ch,k)=>g.fillText(ch,x,y+k*sz*1.05));else g.fillText(txtS,x,y);g.restore()};
 neon(420,120,'ミャウネロ','#ff4fd8',40,true);neon(1150,180,'MEOW','#4ff6ff',58);neon(1820,110,'格闘','#ffb347',46,true);neon(820,250,'$MEOWNERO','#ff6a2a',30);neon(1500,300,'ネコ','#7bff6a',34);
 grain(g,0,0,FAR_W,HZ+30,.12);
 return blurInto(c,.5)}

// ---------- 3. SAKURA SHRINE (dusk) ----------
function paintShrine(){const c=mkCanvas(FAR_W,H),g=c.getContext('2d'),rnd=seeded(5);
 const sky=g.createLinearGradient(0,0,0,HZ);sky.addColorStop(0,'#2a1a3d');sky.addColorStop(.45,'#9a3e4c');sky.addColorStop(.8,'#f39a52');sky.addColorStop(1,'#ffd38a');g.fillStyle=sky;g.fillRect(0,0,FAR_W,H);
 // sun
 const sun=g.createRadialGradient(FAR_W/2+260,HZ-90,10,FAR_W/2+260,HZ-90,260);sun.addColorStop(0,'rgba(255,240,200,1)');sun.addColorStop(.15,'rgba(255,200,120,.8)');sun.addColorStop(1,'rgba(255,140,80,0)');g.fillStyle=sun;g.fillRect(0,0,FAR_W,HZ+40);
 // mountain layers (aerial perspective)
 const mtn=(base,amp,col,seed)=>{const r=seeded(seed);g.fillStyle=col;g.beginPath();g.moveTo(0,HZ+40);let y=base;for(let x=0;x<=FAR_W;x+=20){y+= (r()-.5)*amp;y=clamp(y,base-amp*2.5,base+amp);g.lineTo(x,y)}g.lineTo(FAR_W,HZ+40);g.closePath();g.fill()};
 mtn(HZ-170,26,'rgba(120,60,90,.55)',2);mtn(HZ-110,22,'rgba(80,40,70,.75)',4);mtn(HZ-60,16,'rgba(45,25,45,.95)',8);
 // pagoda silhouette
 const pag=(x,base,s)=>{g.fillStyle='#1b1020';for(let k=0;k<5;k++){const w=(120-k*16)*s,y=base-k*44*s;g.fillRect(x-w*.32,y-34*s,w*.64,34*s);g.beginPath();g.moveTo(x-w*.62,y-30*s);g.quadraticCurveTo(x,y-58*s,x+w*.62,y-30*s);g.lineTo(x+w*.5,y-22*s);g.lineTo(x-w*.5,y-22*s);g.closePath();g.fill()}g.fillRect(x-2*s,base-5*44*s-60*s,4*s,60*s)};
 pag(560,HZ-30,1.1);pag(1900,HZ-50,.8);
 // big torii gate in the centre
 const tx=FAR_W/2,tb=HZ+20;g.fillStyle='#b3231d';g.fillRect(tx-200,tb-300,26,300);g.fillRect(tx+174,tb-300,26,300);g.fillRect(tx-230,tb-250,460,20);g.beginPath();g.moveTo(tx-290,tb-310);g.quadraticCurveTo(tx,tb-340,tx+290,tb-310);g.lineTo(tx+270,tb-285);g.quadraticCurveTo(tx,tb-312,tx-270,tb-285);g.closePath();g.fill();g.fillStyle='#1a0d10';g.fillRect(tx-300,tb-322,600,12);
 const tg2=g.createLinearGradient(tx-220,0,tx+220,0);tg2.addColorStop(0,'rgba(255,200,120,.35)');tg2.addColorStop(.5,'rgba(0,0,0,0)');tg2.addColorStop(1,'rgba(0,0,0,.35)');g.fillStyle=tg2;g.fillRect(tx-300,tb-340,600,340);
 // cherry trees left/right
 const tree=(x,base,s)=>{g.strokeStyle='#2a1518';g.lineCap='round';const br=(x0,y0,a,l,w,d)=>{const x1=x0+Math.cos(a)*l,y1=y0+Math.sin(a)*l;g.lineWidth=w;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();if(d>0){br(x1,y1,a-.4-rnd()*.3,l*.72,w*.68,d-1);br(x1,y1,a+.35+rnd()*.3,l*.72,w*.68,d-1)}else{for(let k=0;k<14;k++){g.fillStyle=`rgba(${240+rnd()*15},${150+rnd()*60},${180+rnd()*40},${.5+rnd()*.4})`;g.beginPath();g.arc(x1+(rnd()-.5)*50,y1+(rnd()-.5)*40,4+rnd()*9,0,TAU);g.fill()}}};br(x,base,-Math.PI/2,120*s,22*s,5)};
 tree(140,HZ+30,1.3);tree(FAR_W-160,HZ+30,1.25);tree(560-200,HZ+30,.7);
 // stone lanterns
 for(const lx of [FAR_W/2-420,FAR_W/2+420]){g.fillStyle='#3a3440';g.fillRect(lx-10,HZ-40,20,70);g.fillRect(lx-32,HZ-80,64,40);g.fillRect(lx-42,HZ-96,84,16);g.fillStyle='rgba(255,190,90,.9)';g.fillRect(lx-18,HZ-72,36,24)}
 grain(g,0,0,FAR_W,HZ+30,.1);
 return blurInto(c,.7)}

const ARENAS=[
 {id:'tokyo',name:'TOKYO GATE',paint:paintRooftop,floor:['#1b1a24','#24222e','#0b0a10'],tile:170,lines:'rgba(120,200,255,.12)',light:'255,150,95',refl:.3,fx:'petals',grade:'rgba(255,110,80,.1)',shafts:null,props:'rooftop',ground:.83},
 {id:'mountain',name:'SUNSET TEMPLE',paint:paintShrine,floor:['#6b4a3a','#5a3b2e','#24160f'],tile:0,lines:'rgba(30,15,8,.55)',light:'255,175,105',refl:.26,fx:'embers',grade:'rgba(255,140,80,.1)',shafts:'255,210,150',props:'shrine',ground:.83},
 {id:'jungle',name:'JUNGLE SHRINE',paint:paintTemple,floor:['#2e2b35','#3a3642','#141318'],tile:130,lines:'rgba(0,0,0,.5)',light:'255,160,80',refl:.24,fx:'embers',grade:'rgba(255,140,60,.1)',shafts:'255,225,170',props:'temple',ground:.86},
];
let arenaIdx=store.get('arena3',Math.floor(Math.random()*ARENAS.length))%ARENAS.length,A=ARENAS[arenaIdx];
const FAR={};function farOf(a){if(!FAR[a.id])FAR[a.id]=a.paint();return FAR[a.id]}
// optional painted backdrops: /kombat/arena/<id>.webp (16:9, horizon at ~63% height). Used automatically when present.
const ART_FILES=['tokyo','mountain','jungle']; // add arena ids here once their images are uploaded, e.g. ['temple']
const ARTIMG={};ARENAS.filter(a=>ART_FILES.includes(a.id)).forEach(a=>{const i=new Image();i.onload=()=>{ARTIMG[a.id]=i};i.src=`/kombat/arena/${a.id}.webp?v=${V}`});
function setArena(i){const n=ARENAS.length;arenaIdx=(i+n)%n;A=ARENAS[arenaIdx];store.set('arena3',arenaIdx);initFx()}

// ---------- world props per arena ----------
const BRAZ=[WW/2-660,WW/2+660];
function flame(x,y,t,s=1){ctx.save();ctx.globalCompositeOperation='lighter';
 for(let i=0;i<8;i++){const fx=x+Math.sin(t*7+i*1.7)*16*s,fh=(62+Math.sin(t*9+i)*18)*s;const gr=ctx.createRadialGradient(fx,y-fh*.3,2,fx,y-fh*.3,fh*.65);gr.addColorStop(0,'rgba(255,236,160,.75)');gr.addColorStop(.4,'rgba(255,120,30,.55)');gr.addColorStop(1,'rgba(255,60,0,0)');ctx.fillStyle=gr;ctx.beginPath();ctx.ellipse(fx,y-fh*.3,20*s,fh*.58,0,0,TAU);ctx.fill()}
 const glow=ctx.createRadialGradient(x,y,10,x,y,380*s);glow.addColorStop(0,'rgba(255,120,30,.22)');glow.addColorStop(1,'rgba(255,120,30,0)');ctx.fillStyle=glow;ctx.fillRect(x-380*s,y-380*s,760*s,760*s);ctx.restore()}
function metal(x0,x1){const g=ctx.createLinearGradient(x0,0,x1,0);g.addColorStop(0,'#1b1920');g.addColorStop(.5,'#3c3945');g.addColorStop(1,'#16141a');return g}
function drawProps(t,layer){
 if(A.props==='temple'){
  if(layer==='mid'){for(const px of [WW/2-860,WW/2+860,WW/2-1400,WW/2+1400]){ctx.fillStyle=metal(px-60,px+60);ctx.fillRect(px-56,-300,112,GY+300-180);ctx.fillStyle='#46434f';ctx.fillRect(px-72,GY-190,144,26);ctx.fillRect(px-72,-40,144,30);
    ctx.strokeStyle='#2a2830';ctx.lineWidth=5;for(let k=0;k<9;k++){ctx.beginPath();ctx.arc(px+18,-260+k*28,8,0,TAU);ctx.stroke()}}}
  else{for(const bx of BRAZ){const y=GY-150;ctx.fillStyle=metal(bx-40,bx+40);ctx.fillRect(bx-40,y,80,18);ctx.fillRect(bx-12,y+18,24,80);ctx.fillRect(bx-32,y+92,64,12);flame(bx,y,t+bx*.001)}}
 }else if(A.props==='rooftop'){
  if(layer==='mid'){// water tank + AC units + antenna
   const wx=WW/2-900;ctx.fillStyle=metal(wx-90,wx+90);ctx.fillRect(wx-90,GY-420,180,200);ctx.fillStyle='#2b2933';for(let k=0;k<5;k++)ctx.fillRect(wx-90,GY-420+k*44,180,4);ctx.fillStyle='#1a181f';ctx.fillRect(wx-80,GY-220,10,60);ctx.fillRect(wx+70,GY-220,10,60);
   const ax=WW/2+920;ctx.fillStyle=metal(ax-6,ax+6);ctx.fillRect(ax-5,GY-640,10,500);ctx.fillStyle=Math.sin(t*4)>0?'#ff2a2a':'#4a0a0a';ctx.beginPath();ctx.arc(ax,GY-646,8,0,TAU);ctx.fill();
   if(Math.sin(t*4)>0){ctx.save();ctx.globalCompositeOperation='lighter';const r=ctx.createRadialGradient(ax,GY-646,0,ax,GY-646,60);r.addColorStop(0,'rgba(255,40,40,.6)');r.addColorStop(1,'rgba(255,0,0,0)');ctx.fillStyle=r;ctx.fillRect(ax-60,GY-706,120,120);ctx.restore()}}
  else{// railings + neon tubes on the edge
   ctx.fillStyle='#14121a';for(let x=0;x<WW;x+=90)ctx.fillRect(x,GY-120,6,60);ctx.fillRect(0,GY-124,WW,7);
   ctx.save();ctx.globalCompositeOperation='lighter';for(const [x,col] of [[WW/2-560,'255,79,216'],[WW/2+560,'79,246,255']]){ctx.fillStyle=`rgba(${col},.95)`;ctx.shadowColor=`rgb(${col})`;ctx.shadowBlur=30;ctx.fillRect(x-80,GY-150,160,6);const r=ctx.createRadialGradient(x,GY-150,0,x,GY-150,340);r.addColorStop(0,`rgba(${col},.22)`);r.addColorStop(1,`rgba(${col},0)`);ctx.shadowBlur=0;ctx.fillStyle=r;ctx.fillRect(x-340,GY-490,680,680)}ctx.restore()}
 }else{
  if(layer==='mid'){// big cherry trunks framing the stage
   for(const [x,s] of [[WW/2-940,1],[WW/2+960,.9]]){ctx.fillStyle='#24120f';ctx.beginPath();ctx.moveTo(x-40*s,GY-160);ctx.quadraticCurveTo(x-10,GY-500,x+30*s,GY-900);ctx.lineTo(x+70*s,GY-900);ctx.quadraticCurveTo(x+30,GY-500,x+40*s,GY-160);ctx.closePath();ctx.fill();
    for(let k=0;k<60;k++){const a=k*2.4,rr2=60+(k*37%180);ctx.fillStyle=`rgba(${245},${160+(k*13%60)},${190+(k*7%40)},.75)`;ctx.beginPath();ctx.arc(x+Math.cos(a)*rr2*1.6,GY-760+Math.sin(a)*rr2*.6,10+(k%5)*3,0,TAU);ctx.fill()}}}
  else{// paper lanterns on posts
   for(const lx of BRAZ){ctx.fillStyle='#2a1a14';ctx.fillRect(lx-6,GY-260,12,110);ctx.fillRect(lx-50,GY-264,100,8);const sw=Math.sin(t*1.5+lx)*4;
    ctx.save();ctx.translate(lx+sw,GY-232);const lg=ctx.createRadialGradient(0,0,4,0,0,44);lg.addColorStop(0,'#fff3c4');lg.addColorStop(.6,'#ff9b3d');lg.addColorStop(1,'#b3231d');ctx.fillStyle=lg;ctx.beginPath();ctx.ellipse(0,0,30,40,0,0,TAU);ctx.fill();ctx.strokeStyle='rgba(80,20,10,.6)';ctx.lineWidth=2;for(let k=-2;k<=2;k++){ctx.beginPath();ctx.ellipse(0,0,30,40-Math.abs(k)*12,0,0,TAU);ctx.stroke()}ctx.restore();
    ctx.save();ctx.globalCompositeOperation='lighter';const r=ctx.createRadialGradient(lx,GY-232,0,lx,GY-232,320);r.addColorStop(0,'rgba(255,170,80,.25)');r.addColorStop(1,'rgba(255,170,80,0)');ctx.fillStyle=r;ctx.fillRect(lx-320,GY-552,640,640);ctx.restore()}}
 }}

// ---------- floor ----------
function drawFloor(){const z=cam.z;const proj=(xw,d)=>W/2+(xw-cam.x)*z*lerp(.42,1.55,d);
 const fl=ctx.createLinearGradient(0,HZ,0,H);fl.addColorStop(0,A.floor[0]);fl.addColorStop(.35,A.floor[1]);fl.addColorStop(1,A.floor[2]);ctx.fillStyle=fl;ctx.fillRect(0,HZ,W,H-HZ);
 ctx.strokeStyle=A.lines;ctx.lineWidth=2;
 if(A.tile){for(let xw=-1400;xw<=WW+1400;xw+=A.tile){ctx.beginPath();ctx.moveTo(proj(xw,0),HZ);ctx.lineTo(proj(xw,1),H);ctx.stroke()}}
 const rows=A.tile?9:16;for(let i=1;i<rows;i++){const d=Math.pow(i/rows,1.7),y=HZ+(H-HZ)*d;ctx.globalAlpha=.35+d*.4;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}ctx.globalAlpha=1;
 if(!A.tile){// staggered plank seams
  for(let i=1;i<16;i++){const d0=Math.pow((i-1)/16,1.7),d1=Math.pow(i/16,1.7),y0=HZ+(H-HZ)*d0,y1=HZ+(H-HZ)*d1;for(let xw=-1400+(i%2)*160;xw<WW+1400;xw+=320){ctx.beginPath();ctx.moveTo(lerp(proj(xw,d0),proj(xw,d1),0),y0);ctx.lineTo(proj(xw,d1),y1);ctx.stroke()}}}
 grain(ctx,0,HZ,W,H-HZ,.14);
 ringFloor();
 // reflected sky/light on the floor
 ctx.save();ctx.globalCompositeOperation='lighter';
 if(A.id==='rooftop'){// neon puddles
  for(const [xw,col] of [[WW/2-560,'255,79,216'],[WW/2+560,'79,246,255'],[WW/2,'255,120,60']]){const x=proj(xw,.55),y=HZ+(H-HZ)*.5;const r=ctx.createRadialGradient(x,y,4,x,y,260*z);r.addColorStop(0,`rgba(${col},.22)`);r.addColorStop(1,`rgba(${col},0)`);ctx.fillStyle=r;ctx.save();ctx.translate(x,y);ctx.scale(1,.25);ctx.translate(-x,-y);ctx.fillRect(x-260*z,y-260*z,520*z,520*z);ctx.restore()}}
 const pool=ctx.createRadialGradient(W/2,GY,20,W/2,GY,640*z);pool.addColorStop(0,`rgba(${A.light},.12)`);pool.addColorStop(1,`rgba(${A.light},0)`);ctx.fillStyle=pool;ctx.fillRect(0,HZ,W,H-HZ);ctx.restore()}

function ringFloor(){camApply(1);ctx.save();ctx.translate(WW/2,GY+18);ctx.scale(1,.16);
 const col=A.id==='rooftop'?'rgba(120,220,255,':A.id==='shrine'?'rgba(70,30,15,':'rgba(10,8,14,';
 ctx.lineWidth=26;ctx.strokeStyle=col+'.55)';ctx.beginPath();ctx.arc(0,0,700,0,TAU);ctx.stroke();ctx.lineWidth=8;ctx.strokeStyle=col+'.45)';ctx.beginPath();ctx.arc(0,0,640,0,TAU);ctx.stroke();ctx.beginPath();ctx.arc(0,0,250,0,TAU);ctx.stroke();
 for(let i=0;i<48;i++){const a=i*TAU/48;ctx.beginPath();ctx.moveTo(Math.cos(a)*650,Math.sin(a)*650);ctx.lineTo(Math.cos(a)*690,Math.sin(a)*690);ctx.stroke()}
 ctx.fillStyle=A.id==='rooftop'?'rgba(255,79,216,.12)':'rgba(250,105,29,.08)';ctx.beginPath();ctx.arc(0,0,250,0,TAU);ctx.fill();ctx.restore();camReset()}
// ---------- particles ----------
let fxp=[];
function initFx(){fxp=[];const n=A.fx==='rain'?170:A.fx==='petals'?70:80;for(let i=0;i<n;i++)fxp.push({x:Math.random()*WW,y:Math.random()*GY,v:Math.random(),p:Math.random()*TAU,s:Math.random()})}
initFx();
function drawFx(t,dt){camApply(1);ctx.save();
 if(A.fx==='embers'){ctx.globalCompositeOperation='lighter';for(const e of fxp){if(dt){e.y-=(20+e.v*50)*dt;e.x+=Math.sin(t+e.p)*12*dt;if(e.y<-60){e.y=GY+20;e.x=Math.random()*WW}}const a=.35+.35*Math.sin(t*3+e.p);ctx.fillStyle=`rgba(255,${140+Math.floor(a*80)},60,${a})`;ctx.beginPath();ctx.arc(e.x,e.y,1+e.s*2.4,0,TAU);ctx.fill()}}
 else if(A.fx==='rain'){ctx.strokeStyle='rgba(180,210,255,.35)';ctx.lineWidth=1.4;ctx.beginPath();for(const r of fxp){if(dt){r.y+=(900+r.v*500)*dt;r.x-=120*dt;if(r.y>GY+40){// splash
     if(Math.random()<.3)sparks.push({x:r.x,y:GY+(Math.random()*30-10),vx:(Math.random()-.5)*80,vy:-80-Math.random()*80,t:0,life:.18,c:'#9fc4ff',s:1.4});r.y=-120-Math.random()*200;r.x=Math.random()*WW}}ctx.moveTo(r.x,r.y);ctx.lineTo(r.x+6,r.y-26)}ctx.stroke()}
 else{for(const p of fxp){if(dt){p.y+=(40+p.v*40)*dt;p.x+=(Math.sin(t*1.3+p.p)*40-30)*dt;if(p.y>GY+20){p.y=-60;p.x=Math.random()*(WW+300)}}ctx.save();ctx.translate(p.x,p.y);ctx.rotate(t*2+p.p);ctx.scale(1,.5+.5*Math.sin(t*3+p.p));ctx.fillStyle=`rgba(255,${170+Math.floor(p.s*50)},${200+Math.floor(p.s*30)},.85)`;ctx.beginPath();ctx.ellipse(0,0,6,4,0,0,TAU);ctx.fill();ctx.restore()}}
 ctx.restore()}

function drawArena(t,fighters){
 camReset();
 const art=ARTIMG[A.id];
 if(art){// painted backdrop fills the screen with gentle parallax
  const gf=A.ground||.8,z=1+(cam.z-1)*.6,s=Math.max(W*1.06/art.width,(GY+24)/(art.height*gf))*z,aw=art.width*s,ah=art.height*s;const maxO=(aw-W)/2,ox=clamp((cam.x-WW/2)*.5*cam.z,-maxO,maxO);
  ctx.drawImage(art,W/2-aw/2-ox,GY-ah*gf,aw,ah);
  if(A.shafts){ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const x0=W/2+(i-1)*260-ox*.6+Math.sin(t*.25+i)*25;const g=ctx.createLinearGradient(0,0,0,GY);g.addColorStop(0,`rgba(${A.shafts},.07)`);g.addColorStop(1,`rgba(${A.shafts},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x0-20,0);ctx.lineTo(x0+50,0);ctx.lineTo(x0+200,GY);ctx.lineTo(x0+60,GY);ctx.closePath();ctx.fill()}ctx.restore()}
 }else{
  const fz=1+(cam.z-1)*.35,fx=(cam.x-WW/2)*.35;ctx.save();ctx.translate(W/2,HZ);ctx.scale(fz,fz);ctx.drawImage(farOf(A),-FAR_W/2-fx,-HZ);ctx.restore();
  if(A.shafts){ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const x0=W/2+(i-1.5)*330-(cam.x-WW/2)*.5+Math.sin(t*.3+i)*20;const g=ctx.createLinearGradient(0,0,0,HZ+80);g.addColorStop(0,`rgba(${A.shafts},.09)`);g.addColorStop(1,`rgba(${A.shafts},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x0-30,0);ctx.lineTo(x0+40,0);ctx.lineTo(x0+170,HZ+80);ctx.lineTo(x0+40,HZ+80);ctx.closePath();ctx.fill()}ctx.restore()}
  drawFloor();
  camApply(.8);drawProps(t,'mid');
 }
 camApply(1);if(!art)drawProps(t,'near');
 if(fighters)for(const f of fighters)drawFighter(f,t,true);
}
let storm={t:4,f:0};
function drawAtmos(t,dt){
 drawFx(t,dt);camReset();
 if(A.id==='temple'||A.id==='rooftop'){storm.t-=dt||0;if(storm.t<=0){storm.t=5+Math.random()*8;storm.f=1;if(scene==='fight')SFX.thunder()}if(storm.f>0){storm.f-=(dt||0)*3;ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(170,190,255,${Math.max(0,storm.f)*.25*(Math.random()<.5?1:.4)})`;ctx.fillRect(0,0,W,HZ+60);ctx.restore()}}
 const fog=ctx.createLinearGradient(0,GY-90,0,H);fog.addColorStop(0,'rgba(170,160,190,0)');fog.addColorStop(.6,A.id==='shrine'?'rgba(255,210,170,.1)':'rgba(170,160,190,.08)');fog.addColorStop(1,'rgba(20,18,26,.35)');ctx.fillStyle=fog;ctx.fillRect(0,GY-90,W,H-GY+90);
 const v=ctx.createRadialGradient(W/2,H*.48,H*.35,W/2,H*.5,H*.95);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.74)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
 ctx.save();ctx.globalCompositeOperation='soft-light';ctx.fillStyle=A.grade;ctx.fillRect(0,0,W,H);ctx.restore();
}

// ================= fighters =================
const MOVES={
 punch:{dur:.3,hitAt:.1,reach:235*SC,dmg:6,kb:200,h:.62,heavy:false},
 kick:{dur:.46,hitAt:.18,reach:265*SC,dmg:9,kb:300,h:.3,heavy:true},
 upper:{dur:.5,hitAt:.17,reach:200*SC,dmg:12,kb:150,h:.75,heavy:true,launch:true},
};
function mk(def,x,facing,isCPU){return{def,x,y:GY,vx:0,vy:0,facing,hp:100,hpShown:100,st:'idle',t:0,hitDone:false,spCd:1.2,flash:0,shake:0,isCPU,dashHit:false,ai:{t:0,act:null,until:0},combo:0,comboT:0,spin:0,trail:[],dizzy:0,gone:false}}
let P1,P2,projectiles=[],sparks=[],floaters=[],bolts=[],burst=[],flashScreen=0,hitStop=0,timeScale=1,slowT=0;
const bodyW=f=>{const img=IMG.body[f.def.n];return img?FH*img.width/img.height:200};

// sprite compositor: lights the sprite into a temp canvas
const tc=document.createElement('canvas'),tg=tc.getContext('2d');
// ---------- pseudo-3D light maps: surface normals estimated from the silhouette and detail ----------
const LMAP=new Map();
function lightMaps(img){if(!img)return null;let m=LMAP.get(img);if(m)return m;
 const H0=360,W0=Math.max(8,Math.round(img.width*H0/img.height));const c=document.createElement('canvas');c.width=W0;c.height=H0;const g=c.getContext('2d');g.drawImage(img,0,0,W0,H0);
 let d;try{d=g.getImageData(0,0,W0,H0).data}catch(e){return null}
 const N=W0*H0,al=new Float32Array(N),lum=new Float32Array(N),dist=new Float32Array(N);
 for(let i=0;i<N;i++){al[i]=d[i*4+3]/255;lum[i]=(d[i*4]*.3+d[i*4+1]*.59+d[i*4+2]*.11)/255;dist[i]=al[i]>.5?1e6:0}
 // chamfer distance to the outline
 for(let y=0;y<H0;y++)for(let x=0;x<W0;x++){const i=y*W0+x;if(!dist[i])continue;let v=dist[i];if(x>0)v=Math.min(v,dist[i-1]+1);if(y>0){v=Math.min(v,dist[i-W0]+1);if(x>0)v=Math.min(v,dist[i-W0-1]+1.41);if(x<W0-1)v=Math.min(v,dist[i-W0+1]+1.41)}dist[i]=v}
 for(let y=H0-1;y>=0;y--)for(let x=W0-1;x>=0;x--){const i=y*W0+x;if(!dist[i])continue;let v=dist[i];if(x<W0-1)v=Math.min(v,dist[i+1]+1);if(y<H0-1){v=Math.min(v,dist[i+W0]+1);if(x<W0-1)v=Math.min(v,dist[i+W0+1]+1.41);if(x>0)v=Math.min(v,dist[i+W0-1]+1.41)}dist[i]=v}
 // blurred luminance for surface bumps
 const bl=new Float32Array(N);for(let y=1;y<H0-1;y++)for(let x=1;x<W0-1;x++){const i=y*W0+x;bl[i]=(lum[i]*4+lum[i-1]+lum[i+1]+lum[i-W0]+lum[i+W0])/8}
 const Rr=30,hgt=new Float32Array(N);for(let i=0;i<N;i++){const t=Math.min(dist[i]/Rr,1);hgt[i]=Math.sqrt(1-(1-t)*(1-t))*Rr+bl[i]*3.2}
 const mk=()=>{const k=document.createElement('canvas');k.width=W0;k.height=H0;const kg=k.getContext('2d');return[k,kg,kg.createImageData(W0,H0)]};
 const [cS,gS,dS]=mk(),[cL,gL,dL]=mk(),[cR,gR,dR]=mk(),[cP,gP,dP]=mk(),[cB,gB,dB]=mk();
 const Lk=[.0,-.55,.83],Hs=[0,-.45,.89];
 for(let y=1;y<H0-1;y++)for(let x=1;x<W0-1;x++){const i=y*W0+x,a=al[i];if(a<.02)continue;
  let nx=-(hgt[i+1]-hgt[i-1])*.5,ny=-(hgt[i+W0]-hgt[i-W0])*.5,nz=1;const l=Math.hypot(nx,ny,nz);nx/=l;ny/=l;nz/=l;
  const diff=Math.max(0,nx*Lk[0]+ny*Lk[1]+nz*Lk[2]);const edge=Math.pow(1-nz,1.05);
  const o=i*4;
  dS.data[o+3]=Math.min(255,Math.pow(1-diff,.8)*210*a);
  dL.data[o]=dL.data[o+1]=dL.data[o+2]=255;dL.data[o+3]=Math.min(255,edge*Math.max(0,-nx)*1100*a);
  dR.data[o]=dR.data[o+1]=dR.data[o+2]=255;dR.data[o+3]=Math.min(255,edge*Math.max(0,nx)*1100*a);
  const sp=Math.pow(Math.max(0,nx*Hs[0]+ny*Hs[1]+nz*Hs[2]),28)*Math.max(0,lum[i]-.3)*2.4;dP.data[o]=dP.data[o+1]=dP.data[o+2]=255;dP.data[o+3]=Math.min(255,sp*255*a);
  dB.data[o+3]=a*255}
 gS.putImageData(dS,0,0);gL.putImageData(dL,0,0);gR.putImageData(dR,0,0);gP.putImageData(dP,0,0);gB.putImageData(dB,0,0);
 m={shade:cS,rimL:cL,rimR:cR,spec:cP,sil:cB};LMAP.set(img,m);return m}
const tt=document.createElement('canvas'),ttg=tt.getContext('2d');
function tinted(mask,cw,ch,col){if(tt.width<cw||tt.height<ch){tt.width=Math.max(tt.width,cw);tt.height=Math.max(tt.height,ch)}ttg.globalCompositeOperation='source-over';ttg.clearRect(0,0,cw+2,ch+2);ttg.drawImage(mask,0,0,cw,ch);ttg.globalCompositeOperation='source-in';ttg.fillStyle=col;ttg.fillRect(0,0,cw,ch);ttg.globalCompositeOperation='source-over';return tt}
function warmMaps(def){lightMaps(IMG.body[def.n]);lightMaps(IMG.punch[def.n]);lightMaps(IMG.kick[def.n]);lightMaps(IMG.block[def.n])}
function litSprite(f,w,h,refl,img){img=img||IMG.body[f.def.n];const s=Math.min(2,cam.z*1.15);const cw=Math.ceil(w*s),ch=Math.ceil(h*s);if(tc.width<cw||tc.height<ch){tc.width=Math.max(tc.width,cw);tc.height=Math.max(tc.height,ch)}
 tg.setTransform(1,0,0,1,0,0);tg.clearRect(0,0,cw+2,ch+2);tg.globalCompositeOperation='source-over';tg.imageSmoothingQuality='high';tg.drawImage(img,0,0,cw,ch);
 tg.globalCompositeOperation='source-atop';
 if(!refl){// key light from the near brazier + floor bounce + dark feet
  const near=f.x<WW/2?-1:1;const m=lightMaps(img);
  if(m){// world side of the key light -> sprite side (sprites are flipped when facing left)
   const keyLeft=(near<0)===(f.facing>0);
   tg.globalAlpha=.7;tg.drawImage(m.shade,0,0,cw,ch);tg.globalAlpha=1;
   tg.globalCompositeOperation='lighter';
   tg.globalAlpha=.32;tg.drawImage(tinted(keyLeft?m.rimL:m.rimR,cw,ch,`rgb(${A.light})`),0,0,cw,ch,0,0,cw,ch);
   tg.globalAlpha=.12;tg.drawImage(tinted(keyLeft?m.rimR:m.rimL,cw,ch,'rgb(150,170,220)'),0,0,cw,ch,0,0,cw,ch);
   tg.globalAlpha=.18;tg.drawImage(m.spec,0,0,cw,ch);tg.globalAlpha=1;tg.globalCompositeOperation='source-atop'}
  const g=tg.createLinearGradient(near>0?cw:0,0,near>0?0:cw,0);g.addColorStop(0,`rgba(${A.light},.07)`);g.addColorStop(.45,`rgba(${A.light},0)`);tg.fillStyle=g;tg.fillRect(0,0,cw,ch);
  const v=tg.createLinearGradient(0,0,0,ch);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(.55,'rgba(0,0,0,.04)');v.addColorStop(1,'rgba(0,0,0,.30)');tg.fillStyle=v;tg.fillRect(0,0,cw,ch);
  lightSprite(f,w,h,cw,ch);tg.globalCompositeOperation='source-atop';
  if(f.stunT>0){tg.globalAlpha=.28;tg.fillStyle=f.stunC;tg.fillRect(0,0,cw,ch);tg.globalAlpha=1}
  if(f.fx&&f.fx.tintA>0){tg.globalAlpha=f.fx.tintA;tg.fillStyle=f.fx.tint;tg.fillRect(0,0,cw,ch);tg.globalAlpha=1}
  if(f.flash>0){tg.fillStyle=`rgba(255,255,255,${Math.min(.45,f.flash*3)})`;tg.fillRect(0,0,cw,ch)}
  if(f.st==='special'||f.st==='dash'){tg.fillStyle=f.def.c;tg.globalAlpha=.05;tg.fillRect(0,0,cw,ch);tg.globalAlpha=1}
 }else{tg.fillStyle='rgba(20,18,26,.35)';tg.fillRect(0,0,cw,ch)}
 tg.globalCompositeOperation='source-over';return{cw,ch}}

// pose while showing the dedicated punch image: a short lunge and settle
function punchPose(f){const m=MOVES.punch;const k=f.st==='punch'?clamp((f.t-m.hitAt+.045)/(m.dur-m.hitAt),0,1):clamp((f.t-.12)/.26,0,1);const s=Math.pow(1-k,1.4);
 return{ox:(10+24*s)*SC,oy:0,rot:.02*s,sx:1+.04*s,sy:1-.02*s,top:6*s*SC,leg:0,lift:0,spin:0,pivot:'feet'}}
// pose: returns transform + per-slice warp
function pose(f,t){const p={ox:0,oy:0,rot:0,sx:1,sy:1,top:0,leg:0,lift:0,spin:0,pivot:'feet'};const k=f.t;
 switch(f.st){
 case 'idle':{const b=Math.sin(t*3.2+f.x*.01);p.top=b*5;p.sy=1+b*.012;p.leg=Math.sin(t*1.6)*3;break}
 case 'walk':{const s=Math.sin(t*11);p.oy=-Math.abs(s)*8;p.top=10*Math.sign(f.vx*f.facing);p.leg=s*22;p.rot=.03*Math.sign(f.vx*f.facing);break}
 case 'punch':{const m=MOVES.punch;if(k<m.hitAt){const e=ease(k/m.hitAt);p.top=-26*e;p.ox=-10*e;p.sx=1-.03*e}else{const s=Math.pow(1-clamp((k-m.hitAt)/(m.dur-m.hitAt),0,1),1.6);p.top=95*s;p.ox=34*s;p.sx=1+.07*s;p.leg=-18*s;p.rot=.05*s}break}
 case 'kick':{const m=MOVES.kick;if(k<m.hitAt){const e=ease(k/m.hitAt);p.top=-20*e;p.leg=-30*e;p.oy=-8*e}else{const s=Math.pow(1-clamp((k-m.hitAt)/(m.dur-m.hitAt),0,1),1.3);p.top=-70*s;p.leg=175*s;p.lift=95*s;p.oy=-22*s;p.ox=26*s;p.rot=-.06*s}break}
 case 'upper':{const m=MOVES.upper;if(k<m.hitAt){const e=ease(k/m.hitAt);p.sy=1-.14*e;p.sx=1+.05*e;p.top=-12*e}else{const s=Math.pow(1-clamp((k-m.hitAt)/(m.dur-m.hitAt),0,1),1.4);p.sy=1+.12*s;p.sx=1-.04*s;p.top=60*s;p.oy=-40*s;p.rot=.08*s}break}
 case 'block':{p.sy=.9;p.sx=1.04;p.top=14;p.leg=-10;break}
 case 'hit':{const e=1-clamp(k/.32,0,1);p.top=-70*e;p.leg=20*e;p.ox=Math.sin(k*90)*6*e-10*e;p.sx=1-.05*e;p.rot=-.08*e;break}
 case 'jump':{const air=GY-f.y;if(Math.abs(f.vx)>40){p.spin=(f.spin||0);p.sy=.86;p.sx=.94;p.pivot='center'}else{p.sy=1+clamp(-f.vy/4000,-.1,.12);p.leg=-10}break}
 case 'special':{if(k<.14){p.top=-28;p.sy=.95}else{const s=1-clamp((k-.14)/.25,0,1);p.top=80*s;p.ox=20*s}break}
 case 'dash':if(f.dk==='leap'){p.spin=f.t*TAU*2;p.pivot='center';p.sx=.94;p.sy=.86}else if(f.dk==='tornado'){p.sx=Math.cos(f.t*34);p.top=20}else if(f.dk==='quake'){p.sy=f.y<GY-1?1.08:.86;p.sx=f.y<GY-1?.96:1.1;p.top=-30}else if(f.dk==='phase'){p.top=f.t>.3?60:0;p.oy=f.t>.3?-30:0}else{p.sx=1.16;p.sy=.9;p.top=46;p.leg=-30}break;
 case 'ko':{const e=ease(k/.6);p.rot=-e*Math.PI/2*.94;p.oy=e*8;p.top=-20*e;break}
 case 'dizzy':{p.rot=Math.sin(t*3)*.09;p.top=Math.sin(t*3)*30;p.ox=Math.sin(t*1.5)*8;break}
 case 'win':{const b=Math.abs(Math.sin(t*5));p.oy=-b*16;p.sy=1+b*.03;p.top=-10;break}
 }
 for(const k of ['ox','oy','top','leg','lift'])p[k]*=SC;
 return p}

const wcv=document.createElement('canvas'),wg=wcv.getContext('2d');
function drawWarp(cw,ch,w,h,p,glow){const N=34,s=cw/w,padX=Math.ceil(330*SC*s),padT=Math.ceil(170*SC*s),WW2=cw+padX*2,HH2=ch+padT+4;
 if(wcv.width<WW2||wcv.height<HH2){wcv.width=Math.max(wcv.width,WW2);wcv.height=Math.max(wcv.height,HH2)}
 wg.setTransform(1,0,0,1,0,0);wg.clearRect(0,0,WW2+2,HH2+2);wg.imageSmoothingQuality='high';
 for(let i=0;i<N;i++){const v0=i/N,v=(i+.5)/N;let dx=p.top*Math.pow(1-v,1.7),dy=0;
  if(v>.52){const lv=(v-.52)/.48;dx+=p.leg*Math.pow(lv,1.25);dy=-p.lift*Math.pow(lv,1.1)}
  wg.drawImage(tc,0,v0*ch,cw,ch/N+1,padX+dx*s,padT+v0*ch+dy*s,cw,ch/N+1.2)}
 if(glow){ctx.shadowColor=glow.c;ctx.shadowBlur=glow.b}
 ctx.drawImage(wcv,0,0,WW2,HH2,-w/2-padX/s,-h-padT/s,WW2/s,HH2/s);
 ctx.shadowBlur=0;ctx.shadowColor='transparent'}

function punchFrame(f){if(!IMG.punch[f.def.n])return false;const m=MOVES.punch;return (f.st==='punch'&&f.t>=m.hitAt-.045&&f.t<m.dur-.04)||(f.st==='special'&&f.t>=.12&&f.t<.38)||(POSED.has(f.def.n)&&f.st==='upper'&&f.t>=MOVES.upper.hitAt-.04&&f.t<MOVES.upper.dur-.05)}
function kickFrame(f){if(!IMG.kick[f.def.n])return false;const m=MOVES.kick;return f.st==='kick'&&f.t>=m.hitAt-.06&&f.t<m.dur-.03}
function kickPose(f){const m=MOVES.kick;const k=clamp((f.t-m.hitAt+.06)/(m.dur-m.hitAt),0,1);const s=Math.pow(1-k,1.4);return{ox:16*s*SC,oy:(f.y<GY-1?0:0),rot:-.03*s,sx:1+.03*s,sy:1,top:0,leg:0,lift:0,spin:0,pivot:'feet'}}
const blockPose=()=>({ox:-6*SC,oy:0,rot:0,sx:1,sy:.985,top:0,leg:0,lift:0,spin:0,pivot:'feet'});
function drawFighter(f,t,refl=false){
 const body=IMG.body[f.def.n];if(!body||f.gone)return;const X=f.fx;if(X&&refl)return;const PF=punchFrame(f),KF=!PF&&kickFrame(f),BF=!PF&&!KF&&f.st==='block'&&IMG.block[f.def.n];const img=PF?IMG.punch[f.def.n]:KF?IMG.kick[f.def.n]:BF?IMG.block[f.def.n]:body;const posed=POSED.has(f.def.n);
 const h=PF&&!posed?FH*.9:FH,w=h*img.width/img.height;const p=PF?punchPose(f):KF?kickPose(f):BF?blockPose():pose(f,t);const shiftX=PF?(.5-PANCH[f.def.n])*w:0;
 if(!refl){// floor shadow
  const air=Math.max(0,GY-f.y);const lm=lightMaps(img);
  if(lm&&air<200&&!(X&&(X.clip||X.alpha<1||X.oy<-30||Math.abs(X.ox)>40))){ctx.save();ctx.globalAlpha=.32*(1-air/200);try{ctx.filter='blur(5px)'}catch(e){}ctx.translate(f.x,GY+4);const sk=f.x<WW/2?-.85:.85;ctx.transform(1,0,sk,.26,0,0);ctx.scale(f.facing,1);ctx.drawImage(lm.sil,-w/2+(PF?(.5-PANCH[f.def.n])*w:0),-h,w,h);ctx.restore();ctx.filter='none'}
  const sk=Math.max(0,1-air/700)*(X&&X.oy<-30?Math.max(0,1+X.oy/400):1);if(sk>0.02){ctx.save();ctx.fillStyle='rgba(0,0,0,.55)';ctx.beginPath();ctx.ellipse(f.x+(X?X.ox:0),GY+6,w*.36*sk*(X?X.sx:1),14*sk,0,0,TAU);ctx.fill();ctx.restore()}
  // afterimages
  if(!X)for(const tr of f.trail){ctx.save();ctx.globalAlpha=tr.a*.35;ctx.translate(tr.x,tr.y);ctx.scale(f.facing,1);ctx.drawImage(img,-w/2,-h,w,h);ctx.restore()}
 }
 const {cw,ch}=litSprite(f,w,h,refl,img);
 ctx.save();
 const sh=f.shake?Math.sin(f.shake*90)*6:0;
 if(refl){ctx.globalAlpha=A.refl;ctx.translate(f.x+p.ox*f.facing,GY+(GY-f.y)+4);ctx.scale(f.facing,-.55)}
 else{if(X&&X.clip){ctx.beginPath();ctx.rect(-99999,-99999,299999,99999+GY+2);ctx.clip()}ctx.translate(f.x+p.ox*f.facing+sh+(X?X.ox:0),f.y+p.oy+(X?X.oy:0));if(X){ctx.rotate(X.rot);ctx.globalAlpha*=X.alpha}if(f.alpha!=null)ctx.globalAlpha*=f.alpha}
 if(p.pivot==='center'){ctx.translate(0,-h/2);ctx.rotate(p.spin*f.facing);ctx.translate(0,h/2)}else ctx.rotate(p.rot*f.facing);
 if(!refl)ctx.scale(f.facing*p.sx,p.sy);else ctx.scale(p.sx,p.sy);
 if(shiftX)ctx.translate(shiftX,0);
 if(X)ctx.scale(X.sx,X.sy);
 if(X&&X.split){for(const half of [0,1]){ctx.save();ctx.beginPath();if(!half){ctx.moveTo(-w*3,-h*3);ctx.lineTo(w*3,-h*3);ctx.lineTo(w*3,-h*(X.cutA??.38));ctx.lineTo(-w*3,-h*(X.cutB??.62))}else{ctx.moveTo(-w*3,-h*(X.cutB??.62));ctx.lineTo(w*3,-h*(X.cutA??.38));ctx.lineTo(w*3,h);ctx.lineTo(-w*3,h)}ctx.closePath();ctx.clip();const tm=X.tm||[-.6,-.35],bm=X.bm||[.5,.15];ctx.translate(X.split*(half?bm[0]:tm[0]),X.split*(half?bm[1]:tm[1]));ctx.rotate(half?.08*X.split/150*(X.bm?.2:1):-(X.trot??.25)*X.split/150);drawWarp(cw,ch,w,h,p,null);ctx.restore()}}
 else drawWarp(cw,ch,w,h,p,refl||X||f.st==='ko'||!(f.st==='special'||f.st==='dash')?null:{c:hexA(f.def.c,.35),b:14*cam.z});
 ctx.restore();
 if(refl)return;
 // attack trails
 const arc=(m,yy,col,width)=>{const k=(f.t-m.hitAt)/.14;if(k<0||k>1)return;ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(1-k)*.9;ctx.strokeStyle=col;ctx.lineWidth=width*(1-k)+3;ctx.lineCap='round';ctx.shadowColor=col;ctx.shadowBlur=18;ctx.beginPath();const cx=f.x+f.facing*(w*.2+m.reach*.38);const r=(70+k*40)*SC;ctx.arc(cx,f.y-h*yy,r,f.facing>0?-1.1:Math.PI-1.1+0,f.facing>0?1.1:Math.PI+1.1);ctx.stroke();
  // speed lines
  ctx.lineWidth=2;for(let i=0;i<5;i++){const yy2=f.y-h*yy+(i-2)*14;ctx.beginPath();ctx.moveTo(f.x+f.facing*(w*.1),yy2);ctx.lineTo(f.x+f.facing*(w*.1+m.reach*(.55+.1*i%2)),yy2);ctx.stroke()}ctx.restore()};
 if(f.st==='punch'&&!PF)arc(MOVES.punch,.6,'#ffffff',12);
 if(PF&&f.st==='punch'){const k=(f.t-MOVES.punch.hitAt)/.12;if(k>=0&&k<1){const fx=f.x+f.facing*(w*(1-PANCH[f.def.n])+p.ox-10*SC),fy=f.y-h*.8;ctx.save();ctx.globalCompositeOperation='lighter';const r=(30+k*70)*SC,g=ctx.createRadialGradient(fx,fy,0,fx,fy,r);g.addColorStop(0,`rgba(255,255,255,${1-k})`);g.addColorStop(.4,hexA(f.def.c,.7*(1-k)));g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(fx-r,fy-r,r*2,r*2);ctx.restore()}}if(f.st==='kick')arc(MOVES.kick,.28,f.def.c,16);if(f.st==='upper')arc(MOVES.upper,.7,'#ffd27a',14);
 if(!refl&&!X)drawGuard(f,t,w*(IMG.block[f.def.n]&&POSED.has(f.def.n)?.55:1),h);
 if(f.st==='special'&&f.t<.16){ctx.save();ctx.globalCompositeOperation='lighter';const r=40+f.t*500,g=ctx.createRadialGradient(f.x+f.facing*60,f.y-h*.55,2,f.x+f.facing*60,f.y-h*.55,r);g.addColorStop(0,'#fff');g.addColorStop(.3,f.def.c);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(f.x-r*2,f.y-h-r,r*4,h+r*2);ctx.restore()}
 if(f.st==='dizzy'&&!X){for(let i=0;i<3;i++){const a=t*4+i*TAU/3;txt('★',f.x+Math.cos(a)*50,f.y-h-10+Math.sin(a)*12,26,'#FFE14D',{stroke:'#000',sw:4})}}
}


// ================= elements =================
function hexA(h,a){const n=parseInt(h.slice(1),16);return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`}
const EL={};for(const [e,ns] of Object.entries({fire:[2,14,18,26,37,40,43,50],bolt:[8,13,27,29],frost:[3,23,31],toxic:[10,21,39,44],arcane:[5,9,17,20,25,32,33,35,46,48],nature:[6,16,24,30,34],water:[15,52],ki:[1,4,7,11,12,19,22,28,36,38,41,42,45,47,49,51]}))for(const n of ns)EL[n]=e;
let aura=[];
function emitAura(f,dt){if(f.gone||f.st==='ko'||f.fx)return;const w=bodyW(f),h=FH,e=EL[f.def.n]||'ki';const hot=f.st==='special'||f.st==='dash';let rate=(hot?26:0)*dt;
 while(rate>0){if(Math.random()<rate){const side=Math.random()<.5?-1:1;const x=f.x+side*w*(.18+Math.random()*.24),y=f.y-h*(.05+Math.random()*.85);
  const P={e,x,y,vx:(Math.random()-.5)*30,vy:-40-Math.random()*90,t:0,life:.5+Math.random()*.6,s:(4+Math.random()*8)*SC,c:f.def.c,r:Math.random()*TAU};
  if(e==='fire'){P.vy=-120-Math.random()*160;P.life=.45+Math.random()*.35;P.s=(9+Math.random()*12)*SC}
  else if(e==='bolt'){P.life=.09;P.vy=0}
  else if(e==='frost'){P.vy=30+Math.random()*40;P.life=1}
  else if(e==='nature'){P.vy=40+Math.random()*30;P.vx=(Math.random()-.5)*60;P.life=1.2}
  else if(e==='water'){P.vy=60+Math.random()*80;P.life=.6}
  aura.push(P)}rate-=1}}
function erupt(x,y,f){const e=EL[f.def.n]||'ki',c=f.def.c;
 if(e==='fire'){for(let i=0;i<34;i++)aura.push({e:'fire',x:x+(Math.random()-.5)*260*SC,y:GY,vx:(Math.random()-.5)*60,vy:-200-Math.random()*380,t:0,life:.5+Math.random()*.5,s:(12+Math.random()*18)*SC,c})}
 else if(e==='bolt'){for(let i=0;i<3;i++)bolts.push(floorBolt(x,(Math.random()<.5?-1:1)*(180+Math.random()*220)*SC,c))}
 else{ring(x,GY-10,c,true);for(let i=0;i<24;i++){const a=Math.random()*Math.PI;aura.push({e,x:x+Math.cos(a)*40,y:GY-Math.sin(a)*20,vx:Math.cos(a)*260,vy:-Math.sin(a)*320,t:0,life:.6,s:(6+Math.random()*8)*SC,c,r:Math.random()*TAU})}}
 }
function floorBolt(x,len,c){const pts=[];const n=9;for(let i=0;i<=n;i++)pts.push([x+len*i/n,GY-6-Math.abs(Math.sin(i))*0-(i%2?Math.random()*40:Math.random()*10)]);return{pts,c,t:0}}
function updAura(dt){for(const p of aura){p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.e==='fire')p.vy*=.97}aura=aura.filter(p=>p.t<p.life)}
function drawAura(){ctx.save();ctx.globalCompositeOperation='lighter';
 for(const p of aura){const k=p.t/p.life,a=1-k;
  if(p.e==='smoke'){ctx.globalCompositeOperation='source-over';const r=p.s*(1+k*1.6);const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r);g.addColorStop(0,hexA(p.c,.45*a));g.addColorStop(1,hexA(p.c,0));ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,r,0,TAU);ctx.fill();ctx.globalCompositeOperation='lighter';continue}
  if(p.e==='fire'){const r=p.s*(1-k*.5);const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r);g.addColorStop(0,`rgba(255,240,190,${.8*a})`);g.addColorStop(.4,hexA(p.c,.6*a));g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(p.x,p.y,r*.7,r*1.3,0,0,TAU);ctx.fill()}
  else if(p.e==='bolt'){ctx.strokeStyle=hexA(p.c,.9);ctx.lineWidth=2;ctx.shadowColor=p.c;ctx.shadowBlur=10;ctx.beginPath();let x=p.x,y=p.y;ctx.moveTo(x,y);for(let i=0;i<4;i++){x+=(Math.random()-.5)*30*SC;y+=(Math.random()-.3)*24*SC;ctx.lineTo(x,y)}ctx.stroke();ctx.shadowBlur=0}
  else if(p.e==='toxic'){ctx.strokeStyle=hexA(p.c,.7*a);ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,p.s*.6*(.5+k),0,TAU);ctx.stroke()}
  else if(p.e==='frost'){ctx.fillStyle=`rgba(230,245,255,${.9*a})`;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r+p.t*2);ctx.fillRect(-p.s*.4,-1,p.s*.8,2);ctx.fillRect(-1,-p.s*.4,2,p.s*.8);ctx.restore()}
  else if(p.e==='nature'){ctx.fillStyle=hexA(p.c,.8*a);ctx.save();ctx.translate(p.x+Math.sin(p.t*5+p.r)*10,p.y);ctx.rotate(p.r+p.t*3);ctx.beginPath();ctx.ellipse(0,0,p.s*.6,p.s*.3,0,0,TAU);ctx.fill();ctx.restore()}
  else{const r=p.s*.45*(1-k*.4);const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r*2.2);g.addColorStop(0,`rgba(255,255,255,${.9*a})`);g.addColorStop(.35,hexA(p.c,.7*a));g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(p.x-r*2.2,p.y-r*2.2,r*4.4,r*4.4)}}
 ctx.restore()}

function setSt(f,st){f.st=st;f.t=0;f.hitDone=false}
const busy=f=>['punch','kick','upper','hit','special','dash','ko','win','dizzy'].includes(f.st);

function spark(x,y,c,n,spd=1){for(let i=0;i<n;i++){const a=Math.random()*TAU,v=(200+Math.random()*520)*spd;sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-140,t:0,life:.3+Math.random()*.35,c,s:2+Math.random()*4})}}
function ring(x,y,c,big){sparks.push({ring:true,x,y,t:0,life:big?.35:.22,c,r:big?140:80})}

function damage(def,att,dmg,kb,o={}){
 if(def.st==='ko'||def.gone||roundOver)return false;
 const blocking=def.st==='block'&&Math.sign(att.x-def.x)===def.facing&&def.y>=GY-1;
 const hy=def.y-FH*(o.h||.55);
 if(blocking){def.hp=Math.max(0,def.hp-dmg*.12);def.vx=kb*.4*att.facing;sndHit(att,def,false,true);guardImpact(def,att,hy);hitStop=.05;cam.shake=Math.min(.35,cam.shake+.12);return 'block'}
 def.hp=Math.max(0,def.hp-dmg);def.vx=kb*SC*att.facing;def.flash=.16;def.shake=.18;setSt(def,'hit');if(o.stun){def.stunT=o.stun;def.stunC=o.stunC||'#bfe6ff';def.vx*=.2}
 if(o.launch||def.y<GY-1){def.vy=-820;def.vx=kb*SC*.8*att.facing}
 if(att.comboT>0)att.combo++;else att.combo=1;att.comboT=.9;
 const heavy=o.heavy||dmg>=11;
 hitStop=o.tick?.02:heavy?.11:.065;if(heavy)erupt(def.x,GY,att);cam.shake=Math.min(.5,cam.shake+(heavy?.28:.15));cam.kick=heavy?1:.5;if(heavy)flashScreen=.12;
 if(o.tick){if(Math.random()<.4)SFX.hit()}else if(!o.proj&&att.st!=='dash')sndHit(att,def,heavy,false,att.st);
 spark(def.x-att.facing*20,hy,att.def.c,heavy?28:16);spark(def.x-att.facing*20,hy,'#fff',8);ring(def.x-att.facing*10,hy,att.def.c,heavy);
 if(att.st==='dash'&&!o.tick)specialImpact(def,att.def.c,true,att);
 if(att.combo>=2)floaters.push({x:att.x,y:att.y-FH-40,s:`${att.combo} HIT COMBO`,t:0,c:'#FFE14D',small:true,anchor:att});
 return 'hit'}

// ================= special-move FX layer (cast, trails, dynamic light, impacts) =================
let lights=[],callouts=[];
function castFX(f){sndCast(f);const c=f.def.c,e=EL[f.def.n]||'ki',hx=f.x+f.facing*100*SC,hy=f.y-FH*.58;
 cine.punch=Math.min(.3,cine.punch+.06);hitStop=Math.max(hitStop,.035);
 // floor sigil
 const x0=f.x;addFx(.9,(k,t)=>{const a=(k<.15?k/.15:1)*(1-Math.max(0,k-.55)/.45);ctx.save();ctx.translate(x0,GY+2);ctx.scale(1,.22);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a*.9;ctx.strokeStyle=c;ctx.shadowColor=c;ctx.shadowBlur=18;
  const R=(150+40*ease(Math.min(1,k*3)))*SC;ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,R,0,TAU);ctx.stroke();ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,R*.78,0,TAU);ctx.stroke();
  ctx.rotate(t*2.2);ctx.beginPath();for(let i=0;i<=6;i++){const an=i*TAU*2/6;ctx.lineTo(Math.cos(an)*R*.76,Math.sin(an)*R*.76)}ctx.stroke();
  for(let i=0;i<12;i++){ctx.rotate(TAU/12);ctx.fillStyle=c;ctx.fillRect(R*.84,-3,14*SC,6)}
  const g=ctx.createRadialGradient(0,0,0,0,0,R);g.addColorStop(0,hexA(c,.35*a));g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,R,0,TAU);ctx.fill();ctx.restore()});
 // charge: converging motes + flash at the hand
 for(let i=0;i<22;i++){const an=Math.random()*TAU,r=(120+Math.random()*120)*SC;aura.push({e,x:hx+Math.cos(an)*r,y:hy+Math.sin(an)*r*.7,vx:-Math.cos(an)*r*5,vy:-Math.sin(an)*r*3.5,t:0,life:.2,s:(6+Math.random()*6)*SC,c,r:Math.random()*TAU})}
 addFx(.35,(k)=>{const fx=f.x+f.facing*100*SC,fy=f.y-FH*.58;ctx.globalCompositeOperation='lighter';glowDot(fx,fy,(40+k*140)*SC,c,(1-k));ctx.strokeStyle=hexA(c,1-k);ctx.lineWidth=4*(1-k)+1;ctx.beginPath();ctx.arc(fx,fy,(20+k*120)*SC,0,TAU);ctx.stroke()});
 lightsPulse.push({x:hx,y:hy,c,t:0,life:.35,r:520*SC,a:.5});
 callouts.push({s:f.def.sp.name,c,t:0,f})}
let lightsPulse=[];
function specialImpact(o,c,big,att){if(att)sndSpecialHit(att,o);const x=o.x,y=o.y-FH*.55;cine.punch=Math.min(.35,cine.punch+(big?.12:.06));hitStop=Math.max(hitStop,big?.13:.08);cam.shake=Math.min(.7,cam.shake+.3);
 ring(x,y,'#fff',true);ring(x,y,c,true);spark(x,y,c,34,1.4);spark(x,y,'#fff',14,1.1);erupt(x,GY,{def:{n:0,c}});
 const e=EL[(o===P1?P2:P1).def.n]||'ki';for(let i=0;i<26;i++){const an=Math.random()*TAU,v=(200+Math.random()*500);aura.push({e,x,y,vx:Math.cos(an)*v,vy:Math.sin(an)*v-120,t:0,life:.45+Math.random()*.3,s:(8+Math.random()*10)*SC,c,r:Math.random()*TAU})}
 addFx(.55,(k)=>{ctx.save();ctx.translate(x,GY+2);ctx.scale(1,.2);ctx.globalCompositeOperation='lighter';ctx.strokeStyle=hexA(c,(1-k)*.9);ctx.lineWidth=10*(1-k)+2;ctx.beginPath();ctx.arc(0,0,(60+k*420)*SC,0,TAU);ctx.stroke();ctx.restore()});
 lightsPulse.push({x,y,c,t:0,life:.4,r:700*SC,a:1})}
function gatherLights(dt){lights=[];for(const p of projectiles){if(p.dead||p.light===false||(p.from>p.t+.2&&!p.landed))continue;lights.push({x:p.x,y:p.y,c:p.c,r:(p.lr||460)*SC,a:p.la||.55})}
 for(const L of lightsPulse){L.t+=dt;lights.push({x:L.x,y:L.y,c:L.c,r:L.r,a:L.a*Math.max(0,1-L.t/L.life)})}lightsPulse=lightsPulse.filter(L=>L.t<L.life);
 for(const k of callouts)k.t+=dt;callouts=callouts.filter(k=>k.t<1.3)}
function lightSprite(f,w,h,cw,ch){if(!lights.length)return;tg.globalCompositeOperation='source-atop';const s=cw/w;
 for(const L of lights){if(L.a<=.01)continue;const dx=(L.x-f.x)*f.facing,dy=L.y-(f.y-h);if(Math.abs(dx)>L.r+w)continue;const u=(dx+w/2)*s,v=dy*s,r=L.r*s;
  const g=tg.createRadialGradient(u,v,0,u,v,r);g.addColorStop(0,hexA(L.c,.3*L.a));g.addColorStop(.5,hexA(L.c,.1*L.a));g.addColorStop(1,hexA(L.c,0));tg.fillStyle=g;tg.fillRect(0,0,cw,ch)}}
function drawFloorLights(){ctx.save();ctx.globalCompositeOperation='lighter';for(const L of lights){const hgt=Math.max(0,GY-L.y),fall=Math.max(0,1-hgt/700);if(fall<=0)continue;ctx.save();ctx.translate(L.x,GY+2);ctx.scale(1,.24);const r=L.r*.9;const g=ctx.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,hexA(L.c,.32*L.a*fall));g.addColorStop(1,hexA(L.c,0));ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.fill();ctx.restore()}ctx.restore()}
function drawTrails(){ctx.save();ctx.globalCompositeOperation='lighter';for(const p of projectiles){const H=p.hist;if(!H||H.length<2)continue;for(let i=0;i<H.length;i++){const k=i/H.length;glowDot(H[i][0],H[i][1],(10+30*k)*SC,p.c,.45*k)}}ctx.restore()}
function drawCallouts(){camReset();for(const k of callouts){const left=k.f===P1,a=k.t<.1?k.t/.1:Math.max(0,1-(k.t-.85)/.45),slide=(1-ease(Math.min(1,k.t/.18)))*80*(left?-1:1);const x=(left?36:W-36)+slide,y=152;ctx.save();ctx.globalAlpha=a;
  const g=ctx.createLinearGradient(left?x:x-360,0,left?x+360:x,0);g.addColorStop(left?0:1,hexA(k.c,.6));g.addColorStop(left?1:0,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(left?x-10:x-370,y-30,380,40);ctx.fillStyle=k.c;ctx.fillRect(left?x-10:x+6,y-30,4,40);
  txt(k.s,left?x+8:x-8,y,30,'#fff',{stroke:'#000',sw:5,align:left?'left':'right'});ctx.restore()}camApply(1)}

// ================= unique special moves (L) =================
const SPX={1:['FLYING MEOWSAULT','d','leap'],2:['GOLD RUSH','p','coins'],3:['ICE PATH','p','icepath'],4:['BULL RUSH','d','rush'],5:['CURSE OF RA','p','sunpillar'],6:['THORN SNARE','p','roots'],8:['EYE LASER','p','laser'],9:['HEX BOLT','p','homing'],10:['GAS BOMB','p','gasbomb'],11:['GOLDEN PALM','p','palm',1],12:['BLOOD RUSH','d','teleslash'],29:['SKY JUDGEMENT','p','lightning'],30:['EAGLE STORM','p','feathers'],31:['FROST PATH','p','icepath'],32:['SHADOW STEP','d','phase'],40:['WARHAMMER QUAKE','d','quake'],41:['SUN PALM','p','palm',1],42:['BLADE RUSH','d','teleslash'],43:['HELLFIRE HEAD','p','skull'],44:['LAUGHING GAS','p','gasbomb'],45:['DIVING SPLASH','d','leap'],46:['MOON TIARA','p','crescent'],47:['HOLY PILLAR','p','sunpillar'],48:['SMOKE SNARE','p','cloud'],49:['SHURIKEN STORM','p','spread'],33:['MOON HEART','p','homing'],34:['BLOSSOM CUT','d','teleslash'],35:['BEHIND YOU','d','phase'],36:['GLAIVE THROW','p','axe'],7:['BERSERKER FURY','d','flurry'],13:['THUNDER CLAP','p','lightning'],14:['HELL SKULL','p','skull'],15:['TIDAL WAVE','p','wave'],16:['PRAYING STRIKE','d','flurry'],17:['RAINBOW SPREAD','p','spread'],18:['DRAGON BREATH','p','flame'],19:['SANDSTORM','d','tornado'],20:['BLACK SUN','p','blackhole'],21:['MIASMA','p','cloud'],22:['IRON QUAKE','d','quake'],23:['WINTER AXE','p','axe'],24:['FEATHER STORM','p','feathers'],25:['PHANTOM STEP','d','phase'],26:['LAVA BALL','p','lava'],27:['CRESCENT MOON','p','crescent'],28:['STEAM CANNON','p','cannon']};
Object.assign(SPX,{1:['FLYING MEOWSAULT','d','leap'],33:['MOON HEART','p','homing'],34:['BLOSSOM CUT','d','teleslash'],5:['CURSE OF RA','p','sunpillar'],37:['HELL CHAIN','p','chainhook'],30:['EAGLE STORM','p','feathers'],31:['FROST PATH','p','icepath'],38:['BINDING CHAINS','p','chainsnare'],39:['FEAR GAS','p','cloud'],35:['BEHIND YOU','d','phase'],50:['DREAM CLAWS','d','flurry'],32:['SHURIKEN STORM','p','spread'],36:['GLAIVE THROW','p','axe'],29:['SKY JUDGEMENT','p','lightning'],
 42:['TARGET LOCK','p','laser'],43:['HELLFIRE HEAD','p','skull'],44:['LAUGHING GAS','p','gasbomb'],45:['SUPLEX QUAKE','d','quake'],46:['MOON TIARA','p','crescent'],47:['HOLY SMITE','p','palm',1],48:['SMOKE VORTEX','p','blackhole'],49:['IAI STRIKE','d','rush'],51:['MACHETE FRENZY','d','tornado'],52:['DROWNING TIDE','p','wave']});
for(const d of R)if(d&&SPX[d.n])d.sp={...d.sp,name:SPX[d.n][0],t:SPX[d.n][1],k:SPX[d.n][2],close:!!SPX[d.n][3]};
const BODYY=o=>o.y-FH*.55;
function ent(f,o){return Object.assign({owner:f,c:f.def.c,t:0,x:f.x+f.facing*110*SC,y:f.y-FH*.56,vx:0,vy:0,dmg:12*f.def.pow,kb:320,r:95*SC,hits:1,every:.3,life:4,heavy:true},o)}
const glowDot=(x,y,r,c,a=1)=>{const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(255,255,255,${a})`);g.addColorStop(.35,hexA(c,.9*a));g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2)};
function lobUpd(p,dt){if(p.landed)return;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=1700*dt;p.rot=(p.rot||0)+dt*8;if(p.y>=GY-14&&!p.landed){p.landed=true;p.land(p)}}
function lobVel(f,o,T){return{vx:clamp((o.x-f.x-f.facing*110*SC)/T,-1100,1100),vy:(GY-14-(f.y-FH*.56)-.5*1700*T*T)/T}}
const SPAWN={
 chainhook(f,o){const d=f.facing;f.spDur=.75;projectiles.push(ent(f,{pierce:true,vx:1350*SC*d,dmg:9*f.def.pow,kb:0,stun:.9,stunC:'#ff7a1a',heavy:true,r:80*SC,life:1.6,trail:false,lr:300,
  upd(p,dt,o){if(p.hooked){p.x=o.x;p.y=BODYY(o);const tx=f.x+d*170*SC;o.x+=(tx-o.x)*Math.min(1,dt*9);o.vx=0;if(Math.abs(o.x-tx)<20*SC||p.t-p.hooked>.5)p.dead=true;return}
   if(p.back){p.x-=d*1500*SC*dt;if((p.x-f.x)*d<60*SC)p.dead=true;return}p.x+=p.vx*dt;p.y=f.y-FH*.56;if(Math.abs(p.x-f.x)>900*SC)p.back=true},
  onHit(p,o){p.hooked=p.t;p.vx=0;hitPop(o.x,o.y-FH*.8,'COME HERE!','#FF7A1A');SFX.heavy()},
  draw(p){const hx=f.x+d*90*SC,hy=f.y-FH*.56,L=Math.hypot(p.x-hx,p.y-hy),n=Math.max(2,Math.floor(L/(16*SC))),an=Math.atan2(p.y-hy,p.x-hx);ctx.save();ctx.strokeStyle='#9a8a7a';ctx.lineWidth=3*SC;
   for(let i=0;i<n;i++){const t=i/n,x=hx+(p.x-hx)*t,y=hy+(p.y-hy)*t+Math.sin(t*Math.PI)*(p.hooked?0:14*SC);ctx.save();ctx.translate(x,y);ctx.rotate(an+(i%2?Math.PI/2:0));ctx.beginPath();ctx.ellipse(0,0,8*SC,4*SC,0,0,TAU);ctx.stroke();ctx.restore()}
   ctx.translate(p.x,p.y);ctx.rotate(an);ctx.fillStyle='#c9c2b8';ctx.strokeStyle='#3a2a1a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(30*SC,0);ctx.lineTo(-6*SC,-14*SC);ctx.lineTo(4*SC,0);ctx.lineTo(-6*SC,14*SC);ctx.closePath();ctx.fill();ctx.stroke();ctx.globalCompositeOperation='lighter';glowDot(0,0,40*SC,'#ff7a1a',.6);ctx.restore()}}))},
 chainsnare(f,o){const x=o.x;projectiles.push(ent(f,{x,y:GY-FH*.5,from:.5,until:.85,life:1.6,r:95*SC,dmg:10*f.def.pow,kb:0,stun:1.1,stunC:'#c21a2a',lr:380,test:(p,o)=>Math.abs(p.x-o.x)<p.r&&o.y>GY-220,
  upd(p){if(p.t>.5&&!p.z){p.z=1;SFX.heavy();cam.shake=.4;spark(x,GY-10,'#c21a2a',24)}},
  draw(p){if(p.t<.5){const k=p.t/.5;ctx.save();ctx.translate(x,GY+2);ctx.scale(1,.22);ctx.strokeStyle=hexA('#c21a2a',.4+.5*k);ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,110*SC,0,TAU*k);ctx.stroke();ctx.restore();return}
   const g=Math.min(1,(p.t-.5)*7)*(p.t>1.3?(1.6-p.t)/.3:1);for(let c=0;c<6;c++){const a0=-Math.PI/2+(c-2.5)*.42,len=(260+((c*53)%90))*SC*g,sx=x+Math.cos(a0+Math.PI)*0+(c-2.5)*40*SC,sy=GY;const ex=x+(c-2.5)*12*SC,ey=GY-FH*(.25+.1*(c%3));
    const L=Math.hypot(ex-sx,ey-sy)*g,an=Math.atan2(ey-sy,ex-sx),n=Math.floor(L/(15*SC));ctx.save();ctx.strokeStyle='#8a8078';ctx.lineWidth=3*SC;for(let i=0;i<n;i++){ctx.save();ctx.translate(sx+Math.cos(an)*i*15*SC,sy+Math.sin(an)*i*15*SC);ctx.rotate(an+(i%2?Math.PI/2:0));ctx.beginPath();ctx.ellipse(0,0,7*SC,3.5*SC,0,0,TAU);ctx.stroke();ctx.restore()}
    ctx.translate(sx+Math.cos(an)*L,sy+Math.sin(an)*L);ctx.rotate(an);ctx.fillStyle='#d0c8c0';ctx.beginPath();ctx.moveTo(14*SC,0);ctx.quadraticCurveTo(0,-14*SC,-8*SC,-6*SC);ctx.lineTo(0,0);ctx.closePath();ctx.fill();ctx.restore()}}}))},
 coins(f,o){for(const [vy,dy] of [[-170,-40],[0,0],[150,40]])projectiles.push(ent(f,{y:f.y-FH*.56+dy,vx:950*SC*f.facing,vy,dmg:5*f.def.pow,kb:200,heavy:false,clash:true,r:70*SC,
  upd(p,dt){p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.y>GY-20){p.y=GY-20;p.vy=-Math.abs(p.vy)}},draw(p){ctx.globalCompositeOperation='lighter';glowDot(p.x,p.y,40,'#ffd76a',.6);ctx.globalCompositeOperation='source-over';ctx.translate(p.x,p.y);ctx.scale(Math.cos(p.t*22),1);ctx.fillStyle='#f0bf3a';ctx.strokeStyle='#fff1b0';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,20*SC,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#c8901e';ctx.font=`900 ${22*SC}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('₥',0,1)}}))},
 icepath(f,o){projectiles.push(ent(f,{y:GY-60,vx:720*SC*f.facing,life:1.7,stun:.75,stunC:'#bfe6ff',r:80*SC,dmg:11*f.def.pow,
  upd(p,dt){p.x+=p.vx*dt;p.sp=(p.sp||0)+dt;if(p.sp>.05){p.sp=0;const x=p.x,h=(70+Math.random()*70)*SC;addFx(.7,(k)=>{const g=k<.2?k/.2:1-(k-.2)/.8;ctx.fillStyle='rgba(200,240,255,.85)';ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-18*SC,GY);ctx.lineTo(x,GY-h*g);ctx.lineTo(x+18*SC,GY);ctx.closePath();ctx.fill();ctx.stroke()})}},draw(p){ctx.globalCompositeOperation='lighter';glowDot(p.x,GY-30,90,'#7FD3FF',.5)}}))},
 sunpillar(f,o){const x=o.x;projectiles.push(ent(f,{x,y:GY-FH*.5,from:.5,until:.85,life:1.05,r:85*SC,dmg:13*f.def.pow,kb:150,launch:true,test:(p,o)=>Math.abs(p.x-o.x)<p.r,
  upd(p){if(p.t>.5&&!p.boom){p.boom=1;SFX.thunder();cam.shake=.4;flashScreen=.12;spark(x,GY-20,'#ffd76a',30,1.2)}},
  draw(p){ctx.globalCompositeOperation='lighter';if(p.t<.5){const k=p.t/.5;ctx.strokeStyle=hexA('#ffd76a',.4+.5*k);ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(x,GY+4,(120-60*k)*SC,(20-10*k)*SC,0,0,TAU);ctx.stroke();ctx.fillStyle=hexA('#ffd76a',.15*k);ctx.fillRect(x-8*SC*k,-1400,16*SC*k,GY+1400)}else{const k=clamp((p.t-.5)/.55,0,1),w=(90*SC)*(k<.2?k/.2:1-(k-.2)/.8);const g=ctx.createLinearGradient(x-w,0,x+w,0);g.addColorStop(0,'rgba(255,200,80,0)');g.addColorStop(.5,'rgba(255,250,220,.95)');g.addColorStop(1,'rgba(255,200,80,0)');ctx.fillStyle=g;ctx.fillRect(x-w,-1400,w*2,GY+1400);glowDot(x,GY,w*2,'#f0bf3a',.7)}}}))},
 roots(f,o){const x=o.x;projectiles.push(ent(f,{x,y:GY-FH*.5,from:.45,until:.8,life:1.4,r:90*SC,dmg:10*f.def.pow,kb:60,stun:.9,stunC:'#6DBE45',test:(p,o)=>Math.abs(p.x-o.x)<p.r&&o.y>GY-200,
  draw(p){if(p.t<.45){ctx.fillStyle=hexA('#3f7a2a',.5);ctx.beginPath();ctx.ellipse(x,GY+4,90*SC*(p.t/.45),14*SC*(p.t/.45),0,0,TAU);ctx.fill();return}const g=Math.min(1,(p.t-.45)*6)*(p.t>1.1?(1.4-p.t)/.3:1);ctx.strokeStyle='#3f7a2a';ctx.lineCap='round';for(let i=0;i<6;i++){const x0=x+(i-2.5)*26*SC;ctx.lineWidth=(9-Math.abs(i-2.5)*1.5)*SC;ctx.beginPath();ctx.moveTo(x0,GY);ctx.quadraticCurveTo(x0+Math.sin(i*2)*50*SC,GY-FH*.35*g,x0-(i-2.5)*10*SC,GY-FH*.7*g);ctx.stroke();ctx.fillStyle='#9a3a2a';ctx.beginPath();ctx.arc(x0+Math.sin(i*2)*25*SC,GY-FH*.35*g,5*SC,0,TAU);ctx.fill()}}}))},
 laser(f,o){f.spDur=.55;projectiles.push(ent(f,{from:.05,until:.4,life:.5,dmg:12*f.def.pow,kb:380,test:(p,o)=>{const dx=(o.x-f.x)*f.facing;return dx>0&&dx<1300*SC&&o.y>GY-260},
  upd(p){p.x=f.x+f.facing*70*SC;p.y=f.y-FH*.8},draw(p){const k=p.t/.5,L=1500*SC,d=f.facing,w=(p.t<.05?p.t/.05:1-k)*16*SC+2;ctx.globalCompositeOperation='lighter';ctx.shadowColor=p.c;ctx.shadowBlur=30;for(const yo of [-10*SC,10*SC]){ctx.fillStyle=hexA(p.c,.85);ctx.fillRect(d>0?p.x:p.x-L,p.y+yo-w/2,L,w);ctx.fillStyle='#fff';ctx.fillRect(d>0?p.x:p.x-L,p.y+yo-w/6,L,w/3)}glowDot(p.x,p.y,60,p.c)}}))},
 homing(f,o){projectiles.push(ent(f,{vx:500*SC*f.facing,clash:true,life:3.2,dmg:12*f.def.pow,trail:[],
  upd(p,dt,o){const a=Math.atan2(BODYY(o)-p.y,o.x-p.x),cur=Math.atan2(p.vy,p.vx);let da=((a-cur+Math.PI*3)%TAU)-Math.PI;const na=cur+clamp(da,-2.4*dt,2.4*dt),sp=520*SC;p.vx=Math.cos(na)*sp;p.vy=Math.sin(na)*sp;p.x+=p.vx*dt;p.y+=p.vy*dt;p.trail.push([p.x,p.y]);if(p.trail.length>14)p.trail.shift()},
  draw(p){const hc=p.c;ctx.globalCompositeOperation='lighter';p.trail.forEach(([x,y],i)=>glowDot(x,y,6+i*2,'#ff6fb0',i/14*.6));glowDot(p.x,p.y,50,'#ff6fb0');ctx.save();ctx.translate(p.x,p.y);const hs=(1+Math.sin(p.t*14)*.12)*SC;ctx.scale(hs,hs);ctx.fillStyle='#ff4f9a';ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,14);ctx.bezierCurveTo(-30,-6,-14,-28,0,-12);ctx.bezierCurveTo(14,-28,30,-6,0,14);ctx.fill();ctx.stroke();ctx.restore();ctx.translate(p.x,p.y);ctx.rotate(p.t*4);ctx.strokeStyle=hexA(hc,.8);ctx.strokeStyle='#e6d3ff';ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<=5;i++){const a=i*TAU*2/5;ctx.lineTo(Math.cos(a)*26,Math.sin(a)*26)}ctx.stroke()}}))},
 gasbomb(f,o){const v=lobVel(f,o,.75);projectiles.push(ent(f,{...v,from:99,life:3.5,
  upd:lobUpd,land(p){p.vx=p.vy=0;p.y=GY-FH*.35;p.from=p.t;p.until=p.t+2.2;p.life=p.t+2.6;p.hits=6;p.every=.35;p.dmg=2.6*f.def.pow;p.tick=true;p.heavy=false;p.kb=40;p.r=150*SC;SFX.heavy();spark(p.x,GY-20,'#8CFF3A',26)},
  draw(p){if(!p.landed){ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle='#2f4a1a';ctx.beginPath();ctx.arc(0,0,20*SC,0,TAU);ctx.fill();ctx.fillStyle='#8CFF3A';ctx.fillRect(-4,-30*SC,8,12*SC);glowDot(0,-30*SC,14,'#ffb04a');return}const a=clamp((p.life-p.t)/.5,0,1);for(let i=0;i<9;i++){const x=p.x+Math.sin(i*2.3+p.t)*110*SC,y=GY-40-((i*37)%190)*SC-p.t*10;ctx.fillStyle=`rgba(140,255,58,${.18*a})`;ctx.beginPath();ctx.arc(x,y,(60+i*6)*SC,0,TAU);ctx.fill()}}}))},
 palm(f,o){projectiles.push(ent(f,{x:f.x+f.facing*190*SC,from:.1,until:.3,life:.55,r:150*SC,dmg:16*f.def.pow,kb:650,launch:true,
  upd(p){p.x=f.x+f.facing*190*SC},draw(p){const k=p.t/.55,sz=(120+k*120)*SC,cx=p.x,cy=p.y;ctx.globalCompositeOperation='lighter';ctx.globalAlpha=1-k;ctx.fillStyle='rgba(255,215,106,.55)';ctx.beginPath();ctx.ellipse(cx,cy,sz*.5,sz*.6,0,0,TAU);ctx.fill();for(let i=0;i<5;i++){ctx.beginPath();ctx.ellipse(cx+(i-2)*sz*.21+(i===0?-sz*.15:0),cy-sz*.75+(i===0?sz*.5:Math.abs(i-2.5)*sz*.08),sz*.09,sz*.26,i===0?-.8:0,0,TAU);ctx.fill()}glowDot(cx,cy,sz,'#F2C14E',.6)}}))},
 lightning(f,o){const x=o.x;projectiles.push(ent(f,{x,y:GY-FH*.5,from:.4,until:.6,life:.8,r:90*SC,dmg:13*f.def.pow,kb:200,stun:.35,stunC:'#bfe6ff',test:(p,o)=>Math.abs(p.x-o.x)<p.r,
  upd(p){if(p.t>.4&&!p.z){p.z=1;for(let i=0;i<3;i++)bolts.push(mkBolt(x+(i-1)*30,GY,'#5AB8FF'));SFX.thunder();cam.shake=.45;flashScreen=.2;spark(x,GY-10,'#bfe6ff',30,1.3)}},
  draw(p){if(p.t<.4){ctx.fillStyle='rgba(30,40,70,.6)';for(let i=0;i<5;i++){ctx.beginPath();ctx.arc(x+(i-2)*60*SC,-40+Math.sin(i)*20,(70+i%2*20)*SC,0,TAU);ctx.fill()}ctx.globalCompositeOperation='lighter';ctx.strokeStyle=hexA('#5AB8FF',.6);ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,GY+4,90*SC,14*SC,0,0,TAU);ctx.stroke()}}}))},
 skull(f,o){const y0=f.y-FH*.56;projectiles.push(ent(f,{vx:640*SC*f.facing,clash:true,dmg:13*f.def.pow,
  upd(p,dt){p.x+=p.vx*dt;p.y=y0+Math.sin(p.t*9)*45;for(let i=0;i<2;i++)aura.push({e:'fire',x:p.x-Math.sign(p.vx)*20,y:p.y,vx:-p.vx*.25,vy:-80,t:0,life:.4,s:18*SC,c:'#ff6a1a'})},
  draw(p){ctx.globalCompositeOperation='lighter';glowDot(p.x,p.y,60,'#FF7A1A');ctx.globalCompositeOperation='source-over';ctx.translate(p.x,p.y);ctx.scale(Math.sign(p.vx)*SC,SC);ctx.fillStyle='#fff3e0';ctx.beginPath();ctx.arc(0,-4,22,0,TAU);ctx.fill();ctx.fillRect(-12,10,24,12);ctx.fillStyle='#2a0a00';ctx.beginPath();ctx.arc(-8,-4,6,0,TAU);ctx.arc(9,-4,6,0,TAU);ctx.fill();ctx.fillStyle='#ff3a00';ctx.beginPath();ctx.arc(-8,-4,2.5,0,TAU);ctx.arc(9,-4,2.5,0,TAU);ctx.fill()}}))},
 wave(f,o){projectiles.push(ent(f,{x:f.x+f.facing*90*SC,y:GY-90*SC,vx:600*SC*f.facing,life:2.6,dmg:12*f.def.pow,kb:520,launch:true,pierce:true,r:110*SC,
  draw(p){const g=Math.min(1,p.t*3),H=170*SC*g,d=Math.sign(p.vx),x=p.x;ctx.fillStyle='rgba(47,208,200,.75)';ctx.beginPath();ctx.moveTo(x-d*160*SC,GY);ctx.quadraticCurveTo(x-d*60*SC,GY-H*.3,x-d*10*SC,GY-H);ctx.quadraticCurveTo(x+d*50*SC,GY-H*1.05,x+d*60*SC,GY-H*.7);ctx.quadraticCurveTo(x+d*30*SC,GY-H*.6,x+d*80*SC,GY);ctx.closePath();ctx.fill();ctx.strokeStyle='#e8fbff';ctx.lineWidth=5;ctx.stroke();for(let i=0;i<6;i++){ctx.fillStyle='rgba(255,255,255,.8)';ctx.beginPath();ctx.arc(x+d*(30+Math.sin(p.t*20+i)*30)*SC,GY-H*(.9+Math.random()*.15),4*SC,0,TAU);ctx.fill()}}}))},
 spread(f,o){[-.32,-.1,.12].forEach((a,i)=>projectiles.push(ent(f,{vx:Math.cos(a)*950*SC*f.facing,vy:Math.sin(a)*950*SC,clash:true,dmg:5.5*f.def.pow,heavy:false,kb:220,r:70*SC,hue:i*120,
  draw(p){ctx.globalCompositeOperation='lighter';const c=`hsl(${(p.hue+p.t*400)%360},90%,65%)`;ctx.translate(p.x,p.y);ctx.rotate(Math.atan2(p.vy,p.vx));ctx.shadowColor=c;ctx.shadowBlur=24;ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(34*SC,0);ctx.lineTo(0,10*SC);ctx.lineTo(-40*SC,0);ctx.lineTo(0,-10*SC);ctx.closePath();ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(-10*SC,-2,30*SC,4)}})))},
 flame(f,o){f.spDur=.9;projectiles.push(ent(f,{from:.12,until:.85,life:.9,hits:6,every:.12,dmg:2.6*f.def.pow,tick:true,heavy:false,kb:120,test:(p,o)=>{const dx=(o.x-f.x)*f.facing;return dx>0&&dx<470*SC&&o.y>GY-300},
  upd(p){p.x=f.x+f.facing*90*SC;p.y=f.y-FH*.62;if(p.t>.1&&p.t<.85)for(let i=0;i<5;i++){const s=Math.random();aura.push({e:'fire',x:p.x+f.facing*s*380*SC,y:p.y+(Math.random()-.5)*s*120*SC,vx:f.facing*500,vy:-60-Math.random()*120,t:0,life:.35,s:(10+s*30)*SC,c:'#ff4d1f'})}},
  draw(p){if(p.t<.1||p.t>.85)return;ctx.globalCompositeOperation='lighter';const g=ctx.createLinearGradient(p.x,0,p.x+f.facing*450*SC,0);g.addColorStop(0,'rgba(255,240,180,.9)');g.addColorStop(.4,'rgba(255,110,20,.6)');g.addColorStop(1,'rgba(255,40,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(p.x,p.y-10);ctx.lineTo(p.x+f.facing*450*SC,p.y-90*SC);ctx.lineTo(p.x+f.facing*450*SC,p.y+90*SC);ctx.lineTo(p.x,p.y+10);ctx.closePath();ctx.fill()}}))},
 blackhole(f,o){projectiles.push(ent(f,{vx:300*SC*f.facing,clash:true,life:2.6,hits:4,every:.35,dmg:3.5*f.def.pow,tick:true,heavy:false,kb:-60,r:110*SC,
  upd(p,dt,o){p.x+=p.vx*dt;const dx=p.x-o.x;if(Math.abs(dx)<560*SC&&o.st!=='ko'&&!o.gone)o.x=clamp(o.x+Math.sign(dx)*260*SC*dt,LEFT,RIGHT)},
  draw(p){const r=(52+Math.sin(p.t*12)*4)*SC;ctx.globalCompositeOperation='lighter';glowDot(p.x,p.y,r*2.4,'#6F5BFF',.7);ctx.globalCompositeOperation='source-over';ctx.fillStyle='#000';ctx.beginPath();ctx.arc(p.x,p.y,r*.7,0,TAU);ctx.fill();ctx.strokeStyle='rgba(180,160,255,.9)';ctx.lineWidth=3;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(p.x,p.y,r*(.85+i*.25),-p.t*6+i*2,-p.t*6+i*2+2.4);ctx.stroke()}}}))},
 cloud(f,o){projectiles.push(ent(f,{x:f.x+f.facing*250*SC,y:GY-FH*.4,vx:90*SC*f.facing,life:3,hits:6,every:.4,dmg:2.6*f.def.pow,tick:true,heavy:false,kb:40,r:150*SC,
  draw(p){const a=Math.min(1,p.t*3)*clamp((p.life-p.t)/.5,0,1);for(let i=0;i<10;i++){const x=p.x+Math.sin(i*1.9+p.t*1.5)*120*SC,y=GY-30-((i*41)%240)*SC;ctx.fillStyle=`rgba(91,255,126,${.16*a})`;ctx.beginPath();ctx.arc(x,y,(55+i*5)*SC,0,TAU);ctx.fill()}ctx.fillStyle=`rgba(230,255,230,${.7*a})`;ctx.font=`900 ${34*SC}px sans-serif`;ctx.textAlign='center';ctx.fillText('☠',p.x,GY-FH*.5+Math.sin(p.t*3)*10)}}))},
 axe(f,o){const d=f.facing;projectiles.push(ent(f,{vx:1050*SC*d,clash:true,pierce:true,hits:2,every:.35,life:3,dmg:7*f.def.pow,kb:300,
  upd(p,dt){p.vx-=d*1350*SC*dt;p.x+=p.vx*dt;p.y+=(f.y-FH*.56-p.y)*dt*3;if(p.t>.5&&Math.abs(p.x-f.x)<70*SC)p.dead=true},
  draw(p){ctx.translate(p.x,p.y);ctx.rotate(p.t*18*d);ctx.globalCompositeOperation='lighter';glowDot(0,0,60,'#A8DCFF',.5);ctx.globalCompositeOperation='source-over';ctx.fillStyle='#6b4a2a';ctx.fillRect(-4*SC,-38*SC,8*SC,76*SC);ctx.fillStyle='#d8f0ff';ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(4*SC,-36*SC);ctx.quadraticCurveTo(40*SC,-30*SC,38*SC,-4*SC);ctx.lineTo(4*SC,-12*SC);ctx.closePath();ctx.fill();ctx.stroke()}}))},
 feathers(f,o){for(let i=0;i<5;i++)projectiles.push(ent(f,{wait:i*.08,vx:1000*SC*f.facing,vy:(i-2)*40,dmg:3.2*f.def.pow,heavy:false,kb:120,r:70*SC,col:['#1FC7A0','#E8382B','#F2C14E'][i%3],
  upd(p,dt){if(p.t<p.wait){p.x=f.x+f.facing*110*SC;p.y=f.y-FH*.56;p.from=99;return}p.from=0;p.x+=p.vx*dt;p.y+=p.vy*dt},
  draw(p){if(p.t<p.wait)return;ctx.translate(p.x,p.y);ctx.rotate(Math.atan2(p.vy,p.vx));ctx.fillStyle=p.col;ctx.beginPath();ctx.ellipse(0,0,34*SC,8*SC,0,0,TAU);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-38*SC,0);ctx.lineTo(34*SC,0);ctx.stroke()}}))},
 lava(f,o){const v=lobVel(f,o,.8);projectiles.push(ent(f,{...v,r:80*SC,dmg:12*f.def.pow,life:4,
  upd:lobUpd,land(p){p.vx=p.vy=0;p.y=GY-60;p.r=150*SC;p.until=p.t+.12;SFX.heavy();cam.shake=.35;spark(p.x,GY-20,'#FF6A00',36,1.3);erupt(p.x,GY,f);
   projectiles.push(ent(f,{x:p.x,y:GY-60,life:2.4,hits:4,every:.45,dmg:2.5*f.def.pow,tick:true,heavy:false,kb:60,r:120*SC,test:(q,o)=>Math.abs(q.x-o.x)<q.r&&o.y>GY-60,draw(q){const a=clamp((q.life-q.t)/.5,0,1);ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(255,106,0,${.6*a})`;ctx.beginPath();ctx.ellipse(q.x,GY+4,130*SC,20*SC,0,0,TAU);ctx.fill();ctx.fillStyle=`rgba(255,220,120,${.5*a})`;ctx.beginPath();ctx.ellipse(q.x,GY+4,70*SC,9*SC,0,0,TAU);ctx.fill();if(Math.random()<.3)aura.push({e:'fire',x:q.x+(Math.random()-.5)*200*SC,y:GY,vx:0,vy:-140,t:0,life:.4,s:14*SC,c:'#ff6a00'})}}));p.life=p.t+.15},
  draw(p){if(p.landed)return;ctx.globalCompositeOperation='lighter';glowDot(p.x,p.y,60,'#FF6A00');ctx.globalCompositeOperation='source-over';ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle='#3a1606';ctx.beginPath();ctx.arc(0,0,26*SC,0,TAU);ctx.fill();ctx.strokeStyle='#ffb04a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-14*SC,-8*SC);ctx.lineTo(4*SC,2*SC);ctx.lineTo(12*SC,-14*SC);ctx.moveTo(4*SC,2*SC);ctx.lineTo(0,20*SC);ctx.stroke()}}))},
 crescent(f,o){projectiles.push(ent(f,{vx:1150*SC*f.facing,pierce:true,dmg:12*f.def.pow,kb:420,r:100*SC,
  draw(p){const d=Math.sign(p.vx);ctx.translate(p.x,p.y);ctx.scale(d,1);ctx.globalCompositeOperation='lighter';ctx.shadowColor='#E8E4FF';ctx.shadowBlur=30;ctx.fillStyle='rgba(240,236,255,.95)';ctx.beginPath();ctx.arc(0,0,80*SC,-Math.PI/2,Math.PI/2);ctx.arc(-30*SC,0,72*SC,Math.PI/2,-Math.PI/2,true);ctx.fill();for(let i=1;i<4;i++){ctx.globalAlpha=.25/i;ctx.beginPath();ctx.arc(-i*40*SC,0,80*SC,-Math.PI/2,Math.PI/2);ctx.arc(-30*SC-i*40*SC,0,72*SC,Math.PI/2,-Math.PI/2,true);ctx.fill()}}}))},
 cannon(f,o){f.x=clamp(f.x-f.facing*50*SC,LEFT,RIGHT);cam.shake=.4;for(let i=0;i<14;i++)aura.push({e:'toxic',x:f.x+f.facing*120*SC,y:f.y-FH*.56,vx:f.facing*(100+Math.random()*200),vy:-60-Math.random()*100,t:0,life:.7,s:22*SC,c:'#dddddd'});
  projectiles.push(ent(f,{vx:560*SC*f.facing,clash:true,dmg:17*f.def.pow,kb:720,launch:true,r:115*SC,
  upd(p,dt){p.x+=p.vx*dt;if(Math.random()<.5)aura.push({e:'toxic',x:p.x-Math.sign(p.vx)*40,y:p.y,vx:0,vy:-50,t:0,life:.6,s:16*SC,c:'#cccccc'})},
  draw(p){ctx.translate(p.x,p.y);const g=ctx.createRadialGradient(-10*SC,-12*SC,4,0,0,40*SC);g.addColorStop(0,'#9ab');g.addColorStop(1,'#223');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,38*SC,0,TAU);ctx.fill();ctx.strokeStyle='#3FE3E0';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,38*SC,p.t*6,p.t*6+1.2);ctx.stroke()}}))},
};
// melee / movement specials (state 'dash', f.dk)
function dashUpd(f,o,dt){const d=f.facing,dx=(o.x-f.x)*d,D=12*f.def.pow;const once=k=>!(f.dkd||(f.dkd={}))[k]&&(f.dkd[k]=1);
 const end=()=>{f.vx=0;f.alpha=null;setSt(f,'idle')};
 switch(f.dk){
 case 'leap':{if(once('go')){f.vy=-1250;f.vx=clamp((o.x-f.x)/1.0,-950*SC,950*SC)}
  if(!f.dashHit&&f.vy>0&&Math.abs(o.x-f.x)<150*SC&&Math.abs(o.y-f.y)<FH*.6){f.dashHit=true;damage(o,f,D*1.25,420,{heavy:true,launch:true,h:.8});f.vy=-520;f.vx=-d*240}
  if(f.t>.2&&f.y>=GY-1){ring(f.x,GY-6,f.def.c,true);SFX.land();end()}break}
 case 'teleslash':{f.vx=0;if(f.t>.12&&once('go')){const x0=f.x;if(dx>0&&dx<760*SC){f.x=clamp(o.x+d*170*SC,LEFT,RIGHT);damage(o,f,D*1.15,260,{heavy:true})}else f.x=clamp(f.x+d*500*SC,LEFT,RIGHT);const x1=f.x,y=f.y-FH*.55,c=f.def.c;SFX.heavyWhoosh();addFx(.4,(k)=>{ctx.globalCompositeOperation='lighter';ctx.strokeStyle=c;ctx.shadowColor=c;ctx.shadowBlur=26;ctx.lineWidth=14*(1-k)+2;ctx.globalAlpha=1-k;ctx.beginPath();ctx.moveTo(x0,y+30);ctx.lineTo(x1,y-30);ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=3*(1-k);ctx.stroke()})}
  f.alpha=f.t<.12?1-f.t/.12*.7:1;if(f.t>.42)end();break}
 case 'flurry':{f.vx=f.t<.3&&dx>150*SC?760*SC*d:0;for(const [tt,k,last] of [[.22,'a'],[.36,'b'],[.5,'c',1]])if(f.t>tt&&once(k)){SFX.whoosh();const c=f.def.c,x=f.x+d*120*SC,y=f.y-FH*(.45+Math.random()*.25),s=Math.random()<.5?1:-1;addFx(.22,(q)=>{ctx.globalCompositeOperation='lighter';ctx.strokeStyle=c;ctx.shadowColor=c;ctx.shadowBlur=20;ctx.lineWidth=8*(1-q)+1;ctx.beginPath();ctx.arc(x,y,90*SC,-1+s*.4,1+s*.4);ctx.stroke()});if(dx>0&&dx<240*SC&&Math.abs(o.y-f.y)<150*SC)damage(o,f,D*(last?.5:.35),last?420:120,{heavy:!!last,launch:!!last})}
  if(f.t>.66)end();break}
 case 'tornado':{f.vx=520*SC*d;for(let i=0;i<3;i++)aura.push({e:'nature',x:f.x+(Math.random()-.5)*180*SC,y:GY-Math.random()*FH,vx:(Math.random()-.5)*300,vy:-80,t:0,life:.5,s:7*SC,c:pick(['#8a0010','#c4001c','#c8b898']),r:Math.random()*TAU});if(once('sw')){const ff=f;addFx(.95,(k,t)=>{ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const a0=t*22+i*2.1;ctx.strokeStyle=`rgba(255,240,230,${.7*(1-k)})`;ctx.lineWidth=6;ctx.beginPath();ctx.ellipse(ff.x,ff.y-FH*(.35+i*.18),150*SC,40*SC,0,a0,a0+2);ctx.stroke()}ctx.restore()})}
  f.tk=(f.tk||0)-dt;if(f.tk<=0&&Math.abs(o.x-f.x)<270*SC&&Math.abs(o.y-f.y)<200*SC){f.tk=.2;damage(o,f,D*.3,90,{tick:true,heavy:false});o.vx=f.vx}if(f.t>.9)end();break}
 case 'quake':{if(once('go')){f.vy=-820;f.vx=0}if(f.t>.12&&f.y>=GY-1&&once('slam')){cam.shake=.7;flashScreen=.15;SFX.heavy();ring(f.x,GY-6,f.def.c,true);spark(f.x,GY-10,'#c9a27a',30,1.2);
   for(const s of [-1,1])projectiles.push(ent(f,{x:f.x+s*80*SC,y:GY-50,vx:800*SC*s,life:1,dmg:10*f.def.pow,kb:300,launch:true,r:90*SC,face:s,draw(p){const k=p.t/p.life;ctx.fillStyle=`rgba(120,90,60,${1-k})`;for(let i=0;i<5;i++){const x=p.x-p.face*i*28*SC,h=(70-i*12)*SC*(1-k*.5);ctx.beginPath();ctx.moveTo(x-20*SC,GY);ctx.lineTo(x-6*SC,GY-h);ctx.lineTo(x+10*SC,GY-h*.7);ctx.lineTo(x+22*SC,GY);ctx.closePath();ctx.fill()}}}))}
  if(f.dkd.slam&&f.t>.45)end();break}
 case 'phase':{f.vx=0;if(f.t<.25)f.alpha=1-f.t/.25;else if(once('tp')){f.x=clamp(o.x+(o.x>f.x?1:-1)*150*SC,LEFT,RIGHT);f.facing=o.x>f.x?1:-1;SFX.whoosh();for(let i=0;i<20;i++)aura.push({e:'arcane',x:f.x+(Math.random()-.5)*160*SC,y:GY-Math.random()*FH,vx:0,vy:-60,t:0,life:.6,s:12*SC,c:'#B05CFF'})}
  if(f.t>=.25)f.alpha=Math.min(1,(f.t-.25)/.1);if(f.t>.36&&once('hit')){const ddx=(o.x-f.x)*f.facing;if(ddx>0&&ddx<240*SC&&Math.abs(o.y-f.y)<160*SC)damage(o,f,D*1.1,380,{heavy:true,launch:true})}if(f.t>.6)end();break}
 default:{f.vx=(f.t<.1?0:1100)*SC*d;if(once('glint')){const ff=f;addFx(.18,(k)=>{ctx.globalCompositeOperation='lighter';glowDot(ff.x+ff.facing*40*SC,ff.y-FH*.55,(30+k*60)*SC,'#ffffff',1-k)})}if(!f.dashHit){if(dx>0&&dx<210*SC&&Math.abs(o.y-f.y)<150*SC){f.dashHit=true;{const y=f.y-FH*.5,x0=f.x-d*200*SC,x1=o.x+d*200*SC,cc=f.def.c;addFx(.45,(k)=>{ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(255,255,255,${1-k})`;ctx.shadowColor=cc;ctx.shadowBlur=24;ctx.lineWidth=8*(1-k)+1;ctx.beginPath();ctx.moveTo(x0,y+30);ctx.lineTo(x1,y-30);ctx.stroke()})}damage(o,f,13*f.def.pow,460,{heavy:true});f.vx=-140*d;end()}}if(f.st==='dash'&&f.t>.38)end()}}}

function doSpecial(f){if(f.spCd>0||busy(f)||f.y<GY-1)return false;f.spCd=2.4;SFX.special();erupt(f.x,GY,f);
 castFX(f);
 const o=f===P1?P2:P1;f.spDur=.42;
 if(f.def.sp.t==='p'){setSt(f,'special');const k=f.def.sp.k;if(k==='laser'||k==='flame'||k==='palm'||k==='sunpillar'||k==='roots'||k==='lightning')SPAWN[k](f,o);else setTimeout(()=>{if(f.st==='special'&&scene==='fight')SPAWN[k](f,o)},120)}
 else{setSt(f,'dash');f.dashHit=false;f.dk=f.def.sp.k;f.dkd={};f.tk=0}
 return true}

function updFighter(f,o,dt,c){
 f.t+=dt;f.spCd=Math.max(0,f.spCd-dt);f.stunT=Math.max(0,(f.stunT||0)-dt);f.flash=Math.max(0,f.flash-dt);f.shake=Math.max(0,f.shake-dt);f.comboT=Math.max(0,f.comboT-dt);
 if(!busy(f)&&f.y>=GY-1)f.facing=o.x>f.x?1:-1;
 // trails for fast moves
 if(f.st==='dash'||(f.st==='jump'&&Math.abs(f.vx)>40)||f.st==='upper'){f.trail.push({x:f.x,y:f.y,a:1})}for(const tr of f.trail)tr.a-=dt*5;f.trail=f.trail.filter(tr=>tr.a>0).slice(-5);
 const sp=275*SC*f.def.spd;
 if(f.st==='ko'||f.st==='win'||f.st==='dizzy'){f.vx*=.9}
 else if(f.st==='hit'){f.vx*=.88;if(f.t>.32&&f.y>=GY-1&&!(f.stunT>0))setSt(f,'idle')}
 else if(MOVES[f.st]){const m=MOVES[f.st];f.vx*=.7;if(!f.hitDone&&f.t>=m.hitAt){f.hitDone=true;sndSwing(f,m.heavy);const dx=(o.x-f.x)*f.facing,dy=Math.abs(o.y-f.y);if(dx>0&&dx<m.reach&&dy<160*SC)damage(o,f,m.dmg*f.def.pow,m.kb,m)}if(f.t>=m.dur)setSt(f,'idle')}
 else if(f.st==='special'){f.vx=0;if(f.t>(f.spDur||.42))setSt(f,'idle')}
 else if(f.st==='dash'){dashUpd(f,o,dt)}
 else if(false){f.vx=820*SC*f.facing;if(!f.dashHit){const dx=(o.x-f.x)*f.facing;if(dx>0&&dx<210*SC&&Math.abs(o.y-f.y)<150*SC){f.dashHit=true;damage(o,f,13*f.def.pow,460,{heavy:true});f.vx=-140*f.facing;setSt(f,'idle')}}if(f.st==='dash'&&f.t>.38){f.vx=0;setSt(f,'idle')}}
 else{const air=f.y<GY-1;
  if(c.special&&doSpecial(f)){}
  else if(c.punch&&c.down&&!air){setSt(f,'upper')}
  else if(c.punch){setSt(f,'punch')}
  else if(c.kick&&!air){setSt(f,'kick')}
  else if(c.kick&&air){setSt(f,'kick')}
  else if(c.down&&!air){if(f.st!=='block')setSt(f,'block');f.vx=0}
  else if(c.up&&!air){f.vy=-1180;setSt(f,'jump');if(!pv('mvh',7,{pan:panOf(f),vol:.5}))SFX.whoosh();f.spin=0;f.vx=(c.right?sp:c.left?-sp:0)*1.15}
  else if(!air){const dir=(c.right?1:0)-(c.left?1:0);f.vx=dir*sp*(dir===f.facing?1:.8);const st=dir?'walk':'idle';if(f.st!==st)setSt(f,st)}
 }
 if(f.st==='jump'&&Math.abs(f.vx)>40)f.spin+=dt*TAU*1.35;
 f.vy+=2450*dt;f.y+=f.vy*dt;if(f.y>=GY){if(f.vy>400&&f.st!=='ko')SFX.land();f.y=GY;f.vy=0;if(f.st==='jump'||(f.st==='kick'&&f.t>.3))setSt(f,'idle')}
 f.x+=f.vx*dt;f.x=clamp(f.x,LEFT,RIGHT)}
function separate(){const min=190*SC;const dx=P2.x-P1.x;if(Math.abs(dx)<min&&Math.abs(P1.y-P2.y)<160*SC){const push=(min-Math.abs(dx))/2*Math.sign(dx||1);P1.x=clamp(P1.x-push,LEFT,RIGHT);P2.x=clamp(P2.x+push,LEFT,RIGHT)}}

// ================= AI =================
let level=0;
function aiCtl(f,o,dt){if(window.__mk&&window.__mk.noAI)return {};const c={};const d=Math.min(1,.25+level*.12+round*.05);const a=f.ai;a.t-=dt;
 if(busy(f))return c;
 if(a.act&&a.until>0){a.until-=dt;Object.assign(c,a.act);if(a.until<=0)a.act=null;return c}
 if(a.t>0)return c;a.t=.16-.08*d+Math.random()*.12;
 const dist=(Math.abs(o.x-f.x)-80*SC)/SC,toward=o.x>f.x?'right':'left',away=toward==='right'?'left':'right';
 const threat=(MOVES[o.st]&&dist<240)||projectiles.some(p=>p.owner===o&&Math.abs(p.x-f.x)<320&&Math.sign(f.x-p.x)===Math.sign(p.vx));
 if(threat&&Math.random()<.25+.5*d){a.act={down:true};a.until=.35;return c}
 if(projectiles.some(p=>p.owner===o&&Math.abs(p.x-f.x)<280)&&Math.random()<.3*d){c.up=true;c[toward]=true;return c}
 if(dist>300){if(f.spCd===0&&!f.def.sp.close&&Math.random()<.12+.2*d){c.special=true;return c}a.act={[toward]:true};a.until=.2+Math.random()*.25;return c}
 if(dist<200){const r=Math.random();if(r<.35+.35*d){const q=Math.random();if(q<.15){c.punch=true;c.down=true}else c[q<.6?'punch':'kick']=true}else if(r<.75){a.act={[away]:true};a.until=.15}else if(r<.82){c.up=true;c[toward]=true}else if(f.spCd===0&&(f.def.sp.t==='d'||f.def.sp.close)){c.special=true}return c}
 a.act={[toward]:true};a.until=.15+Math.random()*.2;return c}

// ================= flow =================
let scene='title',sceneT=0,cursor=0,p1Def=null,p2Def=null,round=1,wins=[0,0],timer=60,banner=null,streak=0,best=store.get('best',0),roundOver=false,lastResult=null,finish=null;
const GRID={x0:182,y0:150,tw:130,th:118,gap:6};
const SEL_COLS=7;
function gridRect(i){const tw=122,th=124,gap=8,cols=SEL_COLS,row=Math.floor(i/cols),inRow=Math.min(cols,SLOTS.length-row*cols),x0=(W-(inRow*tw+(inRow-1)*gap))/2;return{x:x0+(i%cols)*(tw+gap),y:150+row*(th+gap),w:tw,h:th}}
function enemyRect(i){const n=ENEMIES.length,tw=n>8?80:88,th=96,gap=7,x0=(W-(n*tw+(n-1)*gap))/2;return{x:x0+i*(tw+gap),y:470,w:tw,h:th}}
function pickRandom(ex){const pool=ENEMIES.filter(f=>f!==ex&&!f.boss);const boss=ENEMIES.find(f=>f.boss);if(boss&&streak>0&&streak%4===0)return boss;return pool[Math.floor(Math.random()*pool.length)]}
function go(s){if(s!=='fight')ambient('');if(s==='vs'){tone(110,55,.9,'sawtooth',.12);noise(.7,300,.35)}if(s==='result'){if(lastResult&&lastResult.won){tone(523,523,.18,'triangle',.12);setTimeout(()=>tone(784,784,.3,'triangle',.12),160)}else tone(220,110,.6,'sawtooth',.1)}if(s==='roll')startRoll();scene=s;sceneT=0}
function startMatch(){round=1;wins=[0,0];startRound()}
function nextArena(){setArena(arenaIdx+1)}
function startRound(){warmMaps(p1Def);warmMaps(p2Def);P1=mk(p1Def,WW/2-300*SC,1,false);P2=mk(p2Def,WW/2+300*SC,-1,true);projectiles=[];sparks=[];floaters=[];bolts=[];burst=[];aura=[];fxs=[];gore=[];splats=[];pops=[];skels=[];xr=null;lightsPulse=[];callouts=[];lights=[];timer=60;roundOver=false;finish=null;timeScale=1;slowT=0;cam.x=WW/2;cam.z=1.6;
 banner={s:`ROUND ${round}`,t:0,dur:1.3,next:{s:'FIGHT!',dur:.8,c:'#FA691D'}};SFX.bell();setTimeout(()=>{noise(.35,500,.6);tone(150,50,.35,'sawtooth',.18)},1300);go('fight');const am=AMB[A.id];if(am){SND.ambName='';ambient(am[0],am[1])}}
function endRound(winner,how){if(roundOver)return;roundOver=true;const loser=winner===P1?P2:P1;
 wins[winner===P1?0:1]++;const matchOver=wins[0]===2||wins[1]===2;
 if(how==='ko'){SFX.ko();slowT=1.1;timeScale=.28;flashScreen=.25}
 const flawless=winner.hp>=100;
 if(matchOver&&how==='ko'){// finisher window
  setSt(loser,'dizzy');loser.vx=0;loser.vy=0;loser.y=GY;setSt(winner,'idle');sndKO(loser);setTimeout(()=>sndWin(winner),1300);
  banner={s:'K.O.',t:0,dur:1.2,c:'#FF3B2E',next:{s:'FINISH MEOW!',dur:6,c:'#FF3B2E',sub:winner===P1?'PRESS SPECIAL (L)':''},after:()=>finishMatch(winner,flawless,false)};
  finish={winner,loser,armed:true,cpuAt:winner===P2?2.4:99,t:0};setTimeout(()=>play('jbowed',{vol:.6,force:true}),1200);return}
 if(how==='ko')setSt(loser,'ko');setSt(winner,'win');sndKO(loser);setTimeout(()=>sndWin(winner),900);
 banner={s:how==='time'?'TIME!':'K.O.',t:0,dur:1.3,c:'#FF3B2E',next:{s:flawless?'FLAWLESS MEOWTORY':`${winner.def.name} WINS`,dur:1.8,c:winner.def.c},after:()=>{if(matchOver)finishMatch(winner,flawless,true);else{round++;startRound()}}}}
function finishMatch(winner,flawless,already){const won=winner===P1;if(won){defeated.add(p2Def.n);streak++;level++;if(streak>best){best=streak;store.set('best',best)}}else{level=Math.max(0,level-1)}
 lastResult={won,me:p1Def,them:p2Def,streak:won?streak:0};if(!won)streak=0;go('result')}
// ================= random select (stage + enemy roulette) =================
let defeated=new Set(),roll=null;
function startRoll(){let pool=ENEMIES.filter(e=>!defeated.has(e.n));let champ=false;if(!pool.length){champ=true;defeated=new Set();pool=ENEMIES.slice()}
 const target=pool[Math.floor(Math.random()*pool.length)],aT=Math.floor(Math.random()*ARENAS.length);
 const mk=(cands,tgtIdx,steps,base,grow)=>{const L=cands.length,ti=cands.indexOf(tgtIdx),st=((ti-(steps-1))%L+L)%L,seq=[];for(let k=0;k<steps;k++)seq.push(cands[(st+k)%L]);
  const times=[];let tt=0;const N=seq.length;for(let s=0;s<N;s++){times.push(tt);tt+=base*(1+grow*Math.pow(s/N,2.2))}return{seq,times,end:tt}};
 const eC=pool.map(e=>ENEMIES.indexOf(e)),eT=ENEMIES.indexOf(target);
 roll={target,aT,champ,e:mk(eC,eT,Math.max(14,eC.length*2+2)+Math.floor(Math.random()*eC.length),.05,7),a:mk([...ARENAS.keys()],aT,9+Math.floor(Math.random()*3),.07,6),t:0,eI:-1,aI:-1}}
function rollCur(R,t){let i=0;while(i<R.times.length-1&&t>=R.times[i+1])i++;return{v:R.seq[i],i,done:t>=R.times[R.times.length-1]+.05}}
function updRoll(dt){const r=roll;r.t+=dt;const T0=r.champ?1.6:.35,t=r.t-T0;if(t<0)return;
 const a=rollCur(r.a,t),e=rollCur(r.e,t);if(a.i!==r.aI){r.aI=a.i;if(!a.done)SFX.move()}if(e.i!==r.eI){r.eI=e.i;SFX.move()}
 if(a.done&&!r.aLock){r.aLock=r.t;SFX.select()}if(e.done&&!r.eLock){r.eLock=r.t;SFX.special();p2Def=r.target}
 if(r.eLock&&(r.t-r.eLock>2.1||((take('start')||take('punch')||click)&&r.t-r.eLock>.3))){click=null;setArena(r.aT);go('vs')}}
function drawRoll(t,dt){const r=roll,T0=r.champ?1.6:.35,tt=r.t-T0;const a=tt<0?{v:r.aT,done:false}:rollCur(r.a,tt),e=tt<0?{v:-1,done:false}:rollCur(r.e,tt);
 cam.x=WW/2;cam.z=1;const keep=arenaIdx;arenaIdx=a.v;A=ARENAS[arenaIdx];drawArena(t);arenaIdx=keep;A=ARENAS[arenaIdx];drawAtmos(t,dt);camReset();
 ctx.fillStyle='rgba(6,4,10,.72)';ctx.fillRect(0,0,W,H);
 drawLogo(W/2,48,190,10);txt('RANDOM SELECT',W/2,110,40,'#F4F2EE',{stroke:'#000',sw:7});
 if(r.champ&&r.t<1.6){txt('ALL ENEMIES DEFEATED!',W/2,330,64,'',{metal:'#FFC94A',stroke:'#000',sw:10,glow:'#FFC94A'});txt('THE ROSTER RETURNS…',W/2,390,28,'#fff',{stroke:'#000',sw:5});return}
 // stage cards
 txt('STAGE',W/2,150,22,'#cfcbd8',{family:MONO});
 const cw=300,ch=150,gap=22,x0=(W-(ARENAS.length*cw+(ARENAS.length-1)*gap))/2;
 ARENAS.forEach((ar,i)=>{const x=x0+i*(cw+gap),y=162,on=i===a.v,img=ARTIMG[ar.id];ctx.save();ctx.globalAlpha=on?1:.45;ctx.fillStyle='#000';ctx.fillRect(x-3,y-3,cw+6,ch+6);
  if(img){const s=Math.max(cw/img.width,ch/img.height);ctx.save();ctx.beginPath();ctx.rect(x,y,cw,ch);ctx.clip();ctx.drawImage(img,x+(cw-img.width*s)/2,y+(ch-img.height*s)/2,img.width*s,img.height*s);ctx.restore()}
  const g=ctx.createLinearGradient(0,y+ch*.55,0,y+ch);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.85)');ctx.fillStyle=g;ctx.fillRect(x,y,cw,ch);txt(ar.name,x+cw/2,y+ch-12,24,'#fff',{stroke:'#000',sw:4});ctx.restore();
  if(on){ctx.save();ctx.strokeStyle=a.done?'#FFC94A':'#fff';ctx.lineWidth=a.done?6:4;ctx.shadowColor=a.done?'#FFC94A':'#fff';ctx.shadowBlur=a.done?24:10;ctx.strokeRect(x-4,y-4,cw+8,ch+8);ctx.restore()}});
 // enemy tiles
 txt('OPPONENT',W/2,360,22,'#cfcbd8',{family:MONO});
 const n=ENEMIES.length,g2=10,tw=Math.min(118,Math.floor((W-140-(n-1)*g2)/n)),th=136,ex=(W-(n*tw+(n-1)*g2))/2,ey=372;
 ENEMIES.forEach((en,i)=>{const x=ex+i*(tw+g2),done=defeated.has(en.n),on=i===e.v;ctx.fillStyle=done?'#111':'#2a0c0c';ctx.fillRect(x-3,ey-3,tw+6,th+6);
  ctx.save();if(done)ctx.filter='grayscale(1) brightness(.35)';drawPortrait(en.n,x,ey,tw,th);ctx.restore();
  if(done){ctx.save();ctx.strokeStyle='rgba(200,30,30,.85)';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(x+14,ey+14);ctx.lineTo(x+tw-14,ey+th-14);ctx.moveTo(x+tw-14,ey+14);ctx.lineTo(x+14,ey+th-14);ctx.stroke();ctx.restore();
   ctx.save();ctx.translate(x+tw/2,ey+th/2);ctx.rotate(-.25);txt('DEFEATED',0,8,20,'#ff5a4a',{stroke:'#000',sw:4});ctx.restore()}
  else{const gg=ctx.createLinearGradient(0,ey+th*.6,0,ey+th);gg.addColorStop(0,'rgba(0,0,0,0)');gg.addColorStop(1,'rgba(0,0,0,.8)');ctx.fillStyle=gg;ctx.fillRect(x,ey,tw,th);txt(en.name.replace(/^THE /,''),x+tw/2,ey+th-8,en.name.length>11?12:15,'#fff',{stroke:'#000',sw:3})}
  if(on){ctx.save();const lock=e.done;ctx.strokeStyle=lock?'#E0302A':'#fff';ctx.lineWidth=lock?7:4;ctx.shadowColor=lock?'#E0302A':'#fff';ctx.shadowBlur=lock?26+Math.sin(t*10)*8:10;ctx.strokeRect(x-4,ey-4,tw+8,th+8);ctx.restore()}});
 txt(`${defeated.size} / ${n} DEFEATED`,W/2,ey+th+30,18,'#cfcbd8',{family:MONO});
 // fighters
 bigFighter(p1Def,130,712,195,false,p1Def.c+'66');
 if(e.v>=0){const en=ENEMIES[e.v];bigFighter(en,W-130,712,195,true,e.done?en.c+'88':null)}
 if(e.done){const k=Math.min(1,(r.t-r.eLock)/.25);ctx.save();ctx.globalAlpha=k;txt(`VS  ${r.target.name}`,W/2,640,54,'',{metal:'#FF3B2E',stroke:'#000',sw:9,glow:'#E0302A'});txt(`STAGE · ${ARENAS[r.aT].name}`,W/2,680,22,'#fff',{stroke:'#000',sw:4,family:MONO});ctx.restore()}
 else txt('…',W/2,640,54,'#fff')}

// ================= cinematic finisher layer =================
const cine={k:0,run:0,dim:0,bars:0,vig:0,z:1,punch:0,red:0,lines:0,beat:0};
let gore=[],splats=[];
const GORE={lunarfall:1.3,molten:.2,impale:1.1,well:.3,smother:0,crowbar:1.2,slices:1,chains:1.2,claws:1.2,boxglove:.8,bullets:1,chop:1.3,slam:1,gore:1,split:1,palm:1,zap:.6,toxic:.35,meteor:.8,steam:.9,roots:.7,spirit:.4,freeze:.45,crystal:.3,gild:0,sand:0,hex:0,vortex:.35,bubble:.6,feathers:.6,beam:0,burn:.25};
const BLOOD=['#5e000c','#7a0010','#8e0614','#a40a1a','#43000a'];
function bleed(x,y,n,o={}){for(let i=0;i<n;i++){const a=(o.dir!=null?o.dir+(Math.random()-.5)*(o.cone??1.2):Math.random()*TAU),v=(o.v??520)*(.3+Math.random());
 gore.push({x:x+(Math.random()-.5)*(o.w||20),y:y+(Math.random()-.5)*(o.h||20),vx:Math.cos(a)*v,vy:Math.sin(a)*v-(o.up??260),t:0,s:(2+Math.random()*5)*SC*(o.size||1),c:pick(BLOOD)})}}
function splat(x,s){splats.push({x,s:s*SC*(.6+Math.random()*.8),a:0,c:pick(BLOOD),r:Math.random()*TAU,drops:[...Array(6)].map(()=>[(Math.random()-.5)*2.6,Math.random()*.4+.1])})}
function impact(p=1){sndGore(p>1.1);if(finish&&finish.loser){const L=finish.loser,X=L.fx||{ox:0,oy:0};lightsPulse.push({x:L.x+X.ox,y:L.y+X.oy-FH*.5,c:'#ffd8b8',t:0,life:.25,r:600*SC,a:.35});for(let i=0;i<14;i++){const an=Math.random()*TAU,v=150+Math.random()*350;aura.push({e:'smoke',x:L.x+X.ox,y:L.y+X.oy-FH*.5,vx:Math.cos(an)*v,vy:Math.sin(an)*v-60,t:0,life:.6,s:(8+Math.random()*10)*SC,c:'#4a4038'})}}cine.punch=Math.min(.55,cine.punch+.22*p);cine.red=Math.min(.3,cine.red+.15*p);timeScale=.28;slowT=Math.max(slowT,.32*p+.1);SFX.thud&&SFX.thud()}
function cineUpd(dt){if(SND.amb)SND.amb.g.gain.value=SND.amb.vol*(1-.75*cine.k);const run=finish&&finish.run!=null,arm=finish&&finish.armed;
 const T=run?{dim:.58,bars:1,vig:.85,z:1.5,k:1}:arm?{dim:.4,bars:.55,vig:.65,z:1.4,k:.6}:{dim:0,bars:0,vig:0,z:1,k:0};
 const e=1-Math.pow(.004,dt);for(const k of ['dim','bars','vig','k'])cine[k]+=(T[k]-cine[k])*e;cine.z+=(T.z-cine.z)*(1-Math.pow(.05,dt));
 cine.punch*=Math.pow(.08,dt);cine.red*=Math.pow(.05,dt);cine.lines*=Math.pow(.01,dt);
 if(run||arm){cine.beat-=dt;if(cine.beat<=0){cine.beat=run?.55:.85;heart()}}
 const gdt=dt*timeScale;for(const g of gore){g.t+=gdt;g.vy+=1900*gdt;g.x+=g.vx*gdt;g.y+=g.vy*gdt;if(g.y>=GY+2&&!g.dead){g.dead=true;if(Math.random()<.18)splat(g.x,g.s*3.5)}}gore=gore.filter(g=>!g.dead&&g.t<3);
 for(const s of splats)s.a=Math.min(1,s.a+dt*6)}
function heart(){const a=ac();if(!a||muted)return;if(!play('heart1',{vol:.9,force:true})){tone(70,42,.16,'sine',.35);setTimeout(()=>tone(62,38,.2,'sine',.28),170)}}
function drawDim(){if(cine.dim<.01)return;camReset();ctx.save();ctx.globalCompositeOperation='saturation';ctx.fillStyle=`rgba(128,128,128,${Math.min(.75,cine.dim*1.1)})`;ctx.fillRect(0,0,W,H);ctx.restore();ctx.fillStyle=`rgba(6,4,4,${cine.dim})`;ctx.fillRect(0,0,W,H);camApply(1);
 if(finish){const L=finish.loser,Wn=finish.winner,cx=(L.x*.6+Wn.x*.4);ctx.save();ctx.translate(cx,GY+6);ctx.scale(1,.2);const g=ctx.createRadialGradient(0,0,0,0,0,620*SC);g.addColorStop(0,`rgba(255,236,200,${.32*cine.k})`);g.addColorStop(.5,`rgba(255,180,120,${.12*cine.k})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,620*SC,0,TAU);ctx.fill();ctx.restore();
  // shaft of light from above
  ctx.save();ctx.globalCompositeOperation='lighter';const sg=ctx.createLinearGradient(0,-600,0,GY);sg.addColorStop(0,'rgba(255,240,210,0)');sg.addColorStop(1,`rgba(255,230,200,${.1*cine.k})`);ctx.fillStyle=sg;ctx.beginPath();ctx.moveTo(cx-120*SC,-600);ctx.lineTo(cx+120*SC,-600);ctx.lineTo(cx+420*SC,GY);ctx.lineTo(cx-420*SC,GY);ctx.closePath();ctx.fill();ctx.restore()}}
function drawSplats(){for(const s of splats){ctx.save();ctx.globalAlpha=s.a*.92;ctx.translate(s.x,GY+3);ctx.scale(1,.22);ctx.rotate(s.r);ctx.fillStyle=s.c;ctx.beginPath();ctx.ellipse(0,0,s.s,s.s*.8,0,0,TAU);ctx.fill();for(const [a,r] of s.drops){ctx.beginPath();ctx.arc(Math.cos(a)*s.s*1.15,Math.sin(a)*s.s*.95,s.s*r*.5,0,TAU);ctx.fill()}
 ctx.globalAlpha=s.a*.12;ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(-s.s*.3,-s.s*.25,s.s*.2,s.s*.06,0,0,TAU);ctx.fill();ctx.restore()}}
function drawGore(){for(const g of gore){const sp=Math.hypot(g.vx,g.vy),a=Math.atan2(g.vy,g.vx),l=Math.max(g.s,Math.min(sp*.035,40*SC));ctx.save();ctx.translate(g.x,g.y);ctx.rotate(a);ctx.fillStyle=g.c;ctx.beginPath();ctx.ellipse(-l/2+g.s/2,0,l/2+g.s/2,g.s/2,0,0,TAU);ctx.fill();ctx.restore()}}
function drawBurst3D(){let i=0;for(const b of burst){const al=Math.max(0,1-b.t/3);if(al<=0)continue;b.r=(b.r??Math.random()*TAU)+(b.rv??(b.rv=(Math.random()-.5)*10))*.016*(b.y<GY-2?1:.05);
  if(!b.poly){const n=3+Math.floor(Math.random()*3);b.poly=[...Array(n)].map((_,k)=>{const a=k/n*TAU+Math.random()*.6;const rr=.5+Math.random()*.6;return[Math.cos(a)*rr,Math.sin(a)*rr]})}
  if((i++&1)===0&&b.y<GY-4){const hgt=GY-b.y;ctx.globalAlpha=al*.4*Math.max(0,1-hgt/500);ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(b.x,GY+2,b.s*.7,b.s*.2,0,0,TAU);ctx.fill()}
  const f=Math.cos(b.r),sx=Math.max(.2,Math.abs(f));ctx.globalAlpha=al;ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.r*.5);ctx.scale(sx,1);const s=b.s*(b.gib?1.7:1.15);
  ctx.beginPath();b.poly.forEach(([x,y],k)=>k?ctx.lineTo(x*s,y*s):ctx.moveTo(x*s,y*s));ctx.closePath();ctx.fillStyle=b.c;ctx.fill();
  ctx.fillStyle=f<0?'rgba(0,0,0,.5)':'rgba(0,0,0,.18)';ctx.fill();if(b.gib||b.bl){ctx.fillStyle='rgba(110,0,12,.75)';ctx.beginPath();ctx.ellipse(0,s*.2,s*.5,s*.3,0,0,TAU);ctx.fill()}
  ctx.strokeStyle='rgba(10,5,4,.6)';ctx.lineWidth=1;ctx.stroke();ctx.restore();
  if(b.gib&&b.y<GY-4&&Math.random()<.3)gore.push({x:b.x,y:b.y,vx:b.vx*.1,vy:b.vy*.1,t:0,s:3*SC,c:pick(BLOOD)})}ctx.globalAlpha=1}
function drawCineOverlay(t){camReset();if(finish&&finish.run!=null)rgbSplit(cine.red);
 if(false&&cine.lines>.05&&finish&&finish.run!=null){ctx.save();ctx.globalAlpha=cine.lines*.55;ctx.strokeStyle='#fff';ctx.lineWidth=2;const cx=W/2,cy=H*.5;for(let i=0;i<48;i++){const a=i/48*TAU+t*.3,r0=260+((i*97)%140);ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0*.6);ctx.lineTo(cx+Math.cos(a)*1100,cy+Math.sin(a)*700);ctx.stroke()}ctx.restore()}
 if(cine.red>.01){ctx.fillStyle=`rgba(150,0,10,${cine.red*.45})`;ctx.fillRect(0,0,W,H)}
 if(cine.vig>.01){const g=ctx.createRadialGradient(W/2,H*.52,H*.22,W/2,H*.52,W*.72);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.65,`rgba(0,0,0,${.32*cine.vig})`);g.addColorStop(1,`rgba(0,0,0,${.95*cine.vig})`);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const rg=ctx.createRadialGradient(W/2,H*.52,H*.4,W/2,H*.52,W*.7);rg.addColorStop(0,'rgba(0,0,0,0)');rg.addColorStop(1,`rgba(90,0,0,${.35*cine.vig*(.7+.3*Math.sin(t*6))})`);ctx.fillStyle=rg;ctx.fillRect(0,0,W,H)}
 drawXray();
 if(cine.bars>.01){const bh=H*.11*ease(Math.min(1,cine.bars));ctx.fillStyle='#000';ctx.fillRect(0,0,W,bh);ctx.fillRect(0,H-bh,W,bh);
  if(finish&&finish.run!=null&&finish.name){const r=finish.run+(finish.pre>50?PRE:(finish.pre||0)),a=Math.min(1,r*3)*Math.max(0,1-Math.max(0,r-3.6)*2);if(a>0){ctx.save();ctx.globalAlpha=a;const yy=H-bh/2+12;const sw=Math.min(1,r*2.5)*520;const g=ctx.createLinearGradient(W/2-sw,0,W/2+sw,0);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.5,hexA(finish.winner.def.c,.5));g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(W/2-sw,yy-30,sw*2,3);ctx.fillRect(W/2-sw,yy+10,sw*2,3);txt(finish.winner.def.name+'  ·  '+finish.name,W/2,yy,30,'#fff',{stroke:'#000',sw:5,glow:finish.winner.def.c});ctx.restore()}}}
 // film grain
 if(cine.k>.05){ctx.save();ctx.globalAlpha=.1*cine.k;for(let i=0;i<420;i++){ctx.fillStyle=Math.random()<.5?'#fff':'#000';ctx.fillRect(Math.random()*W,Math.random()*H,2,2)}ctx.restore()}}

// ================= CATALITY v3: beat-down prelude, X-ray, comic pops, skeletons =================
const PRE=1.75;let pops=[],skels=[],xr=null;
const SKELK=new Set(['zap','burn','meteor','steam','sand','slam','crystal','gild','molten','smother']);
function hitPop(x,y,s,c){return;pops.push({x:x+(Math.random()-.5)*60*SC,y,s,c:c||'#FFE14D',t:0,rot:(Math.random()-.5)*.4})}
function xray(c){return;xr={t:0,life:1.15,c,seed:Math.random()*1000};SFX.thud&&SFX.thud();setTimeout(()=>{try{SFX.heavy()}catch(e){}},260)}
function prelude(dt){const F=finish;F.pre+=dt;const p=F.pre,Wn=F.winner,L=F.loser,X=lfx(L),d=Math.sign(L.x-Wn.x)||1;const once=k=>!F.done['p'+k]&&(F.done['p'+k]=1);const cy=()=>L.y+X.oy-FH*.6;
 if(p<.32){const tx=clamp(L.x-d*235*SC,LEFT,RIGHT);Wn.x+=(tx-Wn.x)*Math.min(1,dt*12);Wn.facing=d;if(once('dash')){setSt(Wn,'dash');Wn.dk='rush';SFX.heavyWhoosh()}Wn.vx=0}
 else if(Wn.st==='dash')setSt(Wn,'idle');
 if(p>.32&&once(1)){setSt(Wn,'punch');Wn.t=MOVES.punch.hitAt;SFX.heavy();impact(.7);X.ox+=d*28*SC;hitPop(L.x+X.ox,cy(),'POW!','#FFE14D');bleed(L.x+X.ox,cy(),26,{dir:d>0?-.2:Math.PI+.2,cone:1,v:700,up:150});L.flash=.15}
 if(p>.7&&once(2)){setSt(Wn,'kick');Wn.t=MOVES.kick.hitAt;SFX.heavy();impact(1);X.ox+=d*36*SC;X.rot=-.12*d;hitPop(L.x+X.ox,cy()+40,'CRUNCH!','#FF6A3A');xray(Wn.def.c);bleed(L.x+X.ox,cy()+60,40,{dir:d>0?-.4:Math.PI+.4,cone:1.2,v:800,up:200});L.flash=.15}
 if(p>1.08&&once(3)){setSt(Wn,'upper');SFX.heavy();impact(1.2);X.vy=-1450;X.vx=d*140*SC;X.air=true;hitPop(L.x+X.ox,cy()-40,'WHAM!','#FFFFFF');bleed(L.x+X.ox,cy(),60,{dir:-Math.PI/2,cone:1.6,v:900,up:300,size:1.2});for(let i=0;i<3;i++)splat(L.x+X.ox+(Math.random()-.5)*160*SC,40);L.flash=.2}
 if(X.air){X.oy+=X.vy*dt;X.vy+=3400*dt;X.ox+=(X.vx||0)*dt;X.rot+=dt*9*d;if(X.oy>=0&&X.vy>0){X.oy=0;X.vy=0;X.vx=0;X.air=false;X.rot=0;cam.shake=.6;ring(L.x+X.ox,GY-6,'#c9b49a',true);spark(L.x+X.ox,GY-10,'#9a8a78',30,1);splat(L.x+X.ox,80);SFX.land()}}
 if(p>=PRE&&!X.air){L.x=clamp(L.x+X.ox,LEFT,RIGHT);X.ox=0;X.rot=0;X.vy=0;X.vx=0;F.w0=Wn.x;F.pre=99;setSt(Wn,'idle')}}
// procedural cat skeleton — charred, realistic, crumbles to ash
function mkSkel(L,X){const x=L.x+(X?X.ox:0),f=L.facing,u=FH,B=[];const R=Math.random;const seg=(x1,y1,x2,y2,w)=>B.push({k:'b',x1:x1*f,y1,x2:x2*f,y2,w:w*(.85+R()*.3),bend:(R()-.5)*.08});
 for(let i=0;i<7;i++){const y=-.31-i*.042;seg(0,y,0,y-.036,.03)}// vertebrae
 for(let i=0;i<5;i++){const y=-.55+i*.035,wid=.12-i*.013;seg(0,y,wid*.7,y+.02,.012);seg(wid*.7,y+.02,wid,y+.07,.011);seg(0,y,-wid*.7,y+.02,.012);seg(-wid*.7,y+.02,-wid,y+.07,.011)}
 seg(-.09,-.29,.09,-.31,.035);for(const s of [-1,1]){seg(s*.06,-.3,s*.085,-.16,.03);seg(s*.085,-.155,s*.09,-.02,.024);seg(s*.09,-.015,s*.14,-.006,.016);seg(s*.08,-.585,s*.155,-.47,.024);seg(s*.155,-.465,s*.125,-.37,.02);seg(s*.125,-.365,s*.11,-.33,.014)}
 seg(-.07,-.6,.07,-.6,.018);for(let i=0;i<6;i++)seg(-.01-i*.035,-.3+i*.012*(i%2?1:-1),-.04-i*.035,-.3+(i+1)*.01,.012);
 B.push({k:'skull',x1:.01*f,y1:-.7,r:.08,f});B.push({k:'jaw',x1:.03*f,y1:-.655,r:.08,f});
 return{x,u,f,t:0,parts:B.map(b=>{const cx=b.k!=='b'?b.x1:(b.x1+b.x2)/2,cy=b.k!=='b'?b.y1:(b.y1+b.y2)/2;return{...b,cx,cy,px:0,py:0,a:0,vx:0,vy:0,va:0,rest:false,char:R()}})}}
function updSkels(dt){for(const S of skels){S.t+=dt;
  if(S.t<1&&Math.random()<dt*30)aura.push({e:'smoke',x:S.x+(Math.random()-.5)*120*SC,y:GY-Math.random()*FH*.8,vx:(Math.random()-.5)*20,vy:-40-Math.random()*50,t:0,life:1.2,s:(14+Math.random()*16)*SC,c:'#3a3632'});
  if(S.t>.95&&!S.fell){S.fell=true;pv('creak',6,{vol:.8,force:true});pv('snap',4,{vol:.6,delay:.15});play('bodydrop',{vol:.5,delay:.2});for(const q of S.parts){q.vx=(Math.random()-.5)*120+q.cx*S.u*.5;q.vy=-Math.random()*90;q.va=(Math.random()-.5)*5}}
  if(S.fell)for(const q of S.parts){if(q.rest)continue;q.vy+=2400*dt;q.px+=q.vx*dt;q.py+=q.vy*dt;q.a+=q.va*dt;const absY=GY+q.cy*S.u+q.py;if(absY>GY-5){q.py=GY-5-GY-q.cy*S.u;q.vy*=-.12;q.vx*=.4;q.va*=.3;if(Math.abs(q.vy)<40){q.rest=true;const cx=S.x+q.cx*S.u+q.px;for(let i=0;i<4;i++)aura.push({e:'smoke',x:cx+(Math.random()-.5)*30,y:GY-6,vx:(Math.random()-.5)*80,vy:-30-Math.random()*40,t:0,life:.9,s:10*SC,c:'#4a443e'})}}}
  if(S.fell&&S.t>2.2)S.ash=Math.min(1,(S.t-2.2)/1.5)}}
function boneFill(len,w,char){const g=ctx.createLinearGradient(0,-w/2,0,w/2);const c1=char>.5?'#b8a888':'#cfc2a6',c2=char>.5?'#3a2c20':'#6a5a46';g.addColorStop(0,c1);g.addColorStop(.6,c2);g.addColorStop(1,'#1e150e');return g}
function drawSkels(){for(const S of skels){const fade=1-(S.ash||0)*.6;for(const q of S.parts){const cx=S.x+q.cx*S.u+q.px,cy=GY+q.cy*S.u+q.py;ctx.save();ctx.globalAlpha=fade;ctx.translate(cx,cy);ctx.rotate(q.a);
  if(S.t<.9){ctx.shadowColor='rgba(255,110,40,.55)';ctx.shadowBlur=8*(1-S.t/.9)}
  if(q.k==='skull'){const r=q.r*S.u,f=q.f||1;ctx.scale(f,1);ctx.fillStyle=boneFill(0,r*2,q.char);ctx.strokeStyle='#120c08';ctx.lineWidth=1.5;
   ctx.beginPath();ctx.moveTo(-r*.95,r*.1);ctx.bezierCurveTo(-r*1.05,-r*.9,r*.2,-r*1.15,r*.65,-r*.45);ctx.quadraticCurveTo(r*1.25,-r*.25,r*1.35,r*.15);ctx.quadraticCurveTo(r*1.1,r*.45,r*.45,r*.4);ctx.quadraticCurveTo(-r*.3,r*.75,-r*.95,r*.1);ctx.closePath();ctx.fill();ctx.stroke();
   ctx.fillStyle='#0c0805';ctx.beginPath();ctx.ellipse(r*.38,-r*.2,r*.26,r*.3,-.3,0,TAU);ctx.fill();ctx.beginPath();ctx.ellipse(r*1.12,0,r*.09,r*.06,0,0,TAU);ctx.fill();
   ctx.strokeStyle='rgba(20,12,8,.8)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-r*.2,r*.25);ctx.quadraticCurveTo(r*.2,r*.1,r*.5,r*.3);ctx.stroke();
   ctx.fillStyle='#e8dcc4';for(const tx of [r*.75,r*1.05]){ctx.beginPath();ctx.moveTo(tx,r*.38);ctx.lineTo(tx+r*.07,r*.62);ctx.lineTo(tx+r*.12,r*.38);ctx.closePath();ctx.fill()}}
  else if(q.k==='jaw'){const r=q.r*S.u,f=q.f||1;ctx.scale(f,1);ctx.fillStyle=boneFill(0,r,q.char);ctx.strokeStyle='#120c08';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-r*.6,0);ctx.quadraticCurveTo(-r*.5,r*.35,r*.2,r*.3);ctx.lineTo(r*1.1,r*.12);ctx.lineTo(r*1.05,0);ctx.lineTo(r*.1,r*.1);ctx.closePath();ctx.fill();ctx.stroke()}
  else{const dx=(q.x2-q.x1)*S.u,dy=(q.y2-q.y1)*S.u,len=Math.hypot(dx,dy),w=q.w*S.u;ctx.rotate(Math.atan2(dy,dx)+q.bend);ctx.fillStyle=boneFill(len,w,q.char);ctx.strokeStyle='#120c08';ctx.lineWidth=1.2;
   ctx.beginPath();ctx.moveTo(-len/2,-w*.42);ctx.quadraticCurveTo(0,-w*.22,len/2,-w*.42);ctx.lineTo(len/2,w*.42);ctx.quadraticCurveTo(0,w*.22,-len/2,w*.42);ctx.closePath();ctx.fill();ctx.stroke();
   for(const s of [-1,1]){ctx.beginPath();ctx.ellipse(s*len/2,0,w*.32,w*.55,0,0,TAU);ctx.fill();ctx.stroke()}}
  ctx.restore()}}}
function drawPops(){for(const P of pops){const k=P.t/.75,s=k<.12?.4+k/.12*.8:1.2-Math.min(.2,(k-.12)),a=k<.7?1:1-(k-.7)/.3;if(a<=0)continue;ctx.save();ctx.translate(P.x,P.y-k*30);ctx.rotate(P.rot);ctx.scale(s*.5,s*.5);ctx.globalAlpha=a;
  ctx.fillStyle='#000';ctx.beginPath();for(let i=0;i<24;i++){const r=i%2?70:120;const an=i/24*TAU;ctx.lineTo(Math.cos(an)*r*1.3,Math.sin(an)*r*.8)}ctx.closePath();ctx.fill();
  ctx.fillStyle=P.c==='#FFFFFF'?'#FF3B2E':P.c;ctx.beginPath();for(let i=0;i<24;i++){const r=i%2?58:104;const an=i/24*TAU;ctx.lineTo(Math.cos(an)*r*1.3,Math.sin(an)*r*.8)}ctx.closePath();ctx.fill();
  txt(P.s,4,22,58,'#fff',{stroke:'#000',sw:10});ctx.restore()}}
function drawXray(){if(!xr)return;const k=xr.t/xr.life;if(k>=1){xr=null;return}const cx=W*.8,cy=H*.34,R=118,pop=k<.1?ease(k/.1):1,fade=k>.82?1-(k-.82)/.18:1;
 ctx.save();ctx.globalAlpha=fade;ctx.translate(cx,cy);ctx.scale(pop,pop);
 ctx.save();ctx.beginPath();ctx.arc(0,0,R,0,TAU);ctx.clip();const g=ctx.createRadialGradient(0,0,10,0,0,R);g.addColorStop(0,'#0e2a36');g.addColorStop(1,'#02080c');ctx.fillStyle=g;ctx.fillRect(-R,-R,R*2,R*2);
 ctx.strokeStyle='rgba(120,220,255,.12)';ctx.lineWidth=1;for(let y=-R;y<R;y+=6){ctx.beginPath();ctx.moveTo(-R,y);ctx.lineTo(R,y);ctx.stroke()}
 const sh=k>.35&&k<.5?(Math.random()-.5)*10:0;ctx.translate(sh,sh);
 // glowing x-ray skull
 const r=75;ctx.shadowColor='#9fe8ff';ctx.shadowBlur=24;ctx.fillStyle='rgba(200,240,255,.9)';ctx.beginPath();ctx.moveTo(-r*.9,-r*.4);ctx.lineTo(-r*.75,-r*1.25);ctx.lineTo(-r*.25,-r*.8);ctx.lineTo(r*.25,-r*.8);ctx.lineTo(r*.75,-r*1.25);ctx.lineTo(r*.9,-r*.4);ctx.quadraticCurveTo(r*1.05,r*.5,r*.4,r*.85);ctx.lineTo(-r*.4,r*.85);ctx.quadraticCurveTo(-r*1.05,r*.5,-r*.9,-r*.4);ctx.closePath();ctx.fill();ctx.shadowBlur=0;
 ctx.fillStyle='#02080c';ctx.beginPath();ctx.ellipse(-r*.38,-r*.05,r*.22,r*.27,.2,0,TAU);ctx.ellipse(r*.38,-r*.05,r*.22,r*.27,-.2,0,TAU);ctx.fill();ctx.beginPath();ctx.moveTo(0,r*.25);ctx.lineTo(-r*.1,r*.45);ctx.lineTo(r*.1,r*.45);ctx.closePath();ctx.fill();
 // crack grows
 const ck=clamp((k-.3)/.25,0,1);if(ck>0){const rnd=seeded(Math.floor(xr.seed*1e5)+7);ctx.strokeStyle='#ff2a2a';ctx.lineWidth=4;ctx.shadowColor='#ff2a2a';ctx.shadowBlur=14;const pts=[[-r*.6,-r*.9]];for(let i=1;i<=7;i++)pts.push([-r*.6+i*r*.17+(rnd()-.5)*20,-r*.9+i*r*.2+(rnd()-.5)*24]);const n=Math.max(1,Math.floor(ck*pts.length));ctx.beginPath();for(let i=0;i<n;i++)i?ctx.lineTo(...pts[i]):ctx.moveTo(...pts[i]);ctx.stroke();
  ctx.lineWidth=2;for(let i=2;i<n;i+=2){ctx.beginPath();ctx.moveTo(...pts[i]);ctx.lineTo(pts[i][0]+(rnd()-.3)*40,pts[i][1]+(rnd()-.6)*40);ctx.stroke()}}
 if(k>.32&&k<.45){ctx.fillStyle=`rgba(255,40,40,${.5*(1-(k-.32)/.13)})`;ctx.fillRect(-R,-R,R*2,R*2)}
 ctx.restore();
 ctx.strokeStyle=xr.c;ctx.lineWidth=7;ctx.shadowColor=xr.c;ctx.shadowBlur=20;ctx.beginPath();ctx.arc(0,0,R,0,TAU);ctx.stroke();ctx.shadowBlur=0;ctx.strokeStyle='#000';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,R+5,0,TAU);ctx.stroke();
 txt('X-RAY',0,-R-14,26,'#9fe8ff',{stroke:'#000',sw:5});if(k>.32)txt('CRACK!',0,R+40,44,'#ff3b2e',{stroke:'#000',sw:8});ctx.restore()}
function rgbSplit(amt){return;const cv=ctx.canvas,o=Math.round(4+amt*10);ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=Math.min(.35,amt*.6);ctx.drawImage(cv,-o,0);ctx.drawImage(cv,o,0);ctx.restore()}

// ================= unique finishers (CATALITY) =================
const FINS={7:['CLAW CROSS','split'],29:['THUNDER GOD','zap'],30:['SPIRIT EAGLE','feathers'],31:['ABSOLUTE ZERO','freeze'],32:['NIGHT HARVEST','spirit'],40:['CONQUEST','slam'],41:['NIRVANA','palm'],42:['TERMINATED','split'],43:['HEADLESS','burn'],44:['PUNCHLINE','toxic'],45:['TOP ROPE','slam'],46:['SHATTERED STAR','impale'],47:['JUDGEMENT DAY','molten'],48:['SUFFOCATE','smother'],49:['THOUSAND CUTS','split'],33:['LUNAR FALL','lunarfall'],34:['SAKURA STORM','split'],35:['FINAL SCREAM','spirit'],36:['BLOODLUST','gore'],1:['LUCHA PILEDRIVER','slam'],2:['MIDAS TOUCH','gild'],3:['DEEP FREEZE','freeze'],4:['STAMPEDE','gore'],5:['CURSE OF THE TOMB','sand'],6:['RETURN TO ROOTS','roots'],8:['LASER GRID','split'],9:['KITTEN CURSE','hex'],10:['MELTDOWN','toxic'],11:['THOUSAND PALMS','palm'],12:['CRIMSON CUT','split'],13:['SKY JUDGEMENT','zap'],14:["HELL'S GATE",'burn'],15:['DROWNED','bubble'],16:['MANTIS SCISSORS','split'],17:['PRISM BREAK','crystal'],18:["DRAGON'S BREATH",'burn'],19:['DUST TO DUST','sand'],20:['EVENT HORIZON','vortex'],21:['PLAGUE ROT','toxic'],22:['BATTERING RAM','gore'],23:["GLACIER'S WRATH",'freeze'],24:['SKY OFFERING','feathers'],25:['SOUL HARVEST','spirit'],26:['ERUPTION','meteor'],27:['LUNAR ASCENSION','beam'],28:['OVERCLOCKED','steam']};
Object.assign(FINS,{1:['LUCHA PILEDRIVER','slam'],33:['LUNAR FALL','lunarfall'],34:['PETAL FALL','slices'],5:['CURSE OF THE TOMB','sand'],37:['HELLFIRE','burn'],30:['SPIRIT EAGLE','feathers'],31:['ABSOLUTE ZERO','freeze'],38:['TORN ASUNDER','chains'],39:['HARVEST ROT','toxic'],35:['FINAL SCREAM','spirit'],50:['SWEET DREAMS','claws'],32:['SHADOW PIT','roots'],36:['BLOODLUST','gore'],29:['THUNDER GOD','zap'],
 42:['BULLET TIME','bullets'],43:['HELL RAIN','meteor'],44:['PUNCHLINE','crowbar'],45:['LARIAT DE MUERTE','palm'],46:['SHATTERED STAR','impale'],47:['JUDGEMENT DAY','molten'],48:['SUFFOCATE','smother'],49:['THOUSAND CUTS','split'],51:['CAMP MASSACRE','chop'],52:['THE WELL','well']});
const FIN_DUR={lunarfall:2.4,molten:2.6,impale:2.8,well:3,smother:2.6,crowbar:2.9,slices:3.1,chains:2.4,claws:2.2,boxglove:2.4,bullets:2.6,chop:3,slam:2.6,gild:2.6,freeze:2.6,gore:2.4,sand:3,roots:2.8,split:2.9,hex:2.6,toxic:2.8,palm:2.4,zap:2.4,burn:2.8,bubble:2.8,crystal:2.6,vortex:2.6,feathers:2.8,spirit:2.8,meteor:2.8,beam:2.8,steam:2.6};
let fxs=[];const addFx=(life,fn)=>fxs.push({t:0,life,fn});
function lfx(L){return L.fx||(L.fx={tint:'#000',tintA:0,sx:1,sy:1,ox:0,oy:0,rot:0,alpha:1,clip:false,split:0})}
const pick=a=>a[Math.floor(Math.random()*a.length)];
function shatter(L,col,o={}){const X=lfx(L),px=pixelsOf(L.def.n),w=bodyW(L);for(const p of px){if(Math.random()<(o.skip??.5))continue;
  burst.push({x:L.x+X.ox+(p.u-.5)*w*X.sx*L.facing,y:L.y+X.oy-FH*X.sy+p.v*FH*X.sy,vx:(Math.random()-.5)*(o.spread??900)+(p.u-.5)*400,vy:-Math.random()*(o.up??900),c:col?col(p.c):p.c,t:0,s:(4+Math.random()*4)*SC*(o.size||1),g:o.g??1400})}
 const gl=GORE[finish&&finish.kind]??.6;if(gl>0){const cy=L.y+X.oy-FH*.5*X.sy;bleed(L.x+X.ox,cy,Math.round(180*gl),{v:900,up:500,w:120,h:FH*.6,size:1.2});for(let i=0;i<Math.round(9*gl);i++)splat(L.x+X.ox+(Math.random()-.5)*360*SC,30+Math.random()*40);for(const b of burst)if(!b.gib&&Math.random()<gl*.12)b.gib=true}
 if(finish&&SKELK.has(finish.kind)&&!finish.skel){finish.skel=1;skels.push(mkSkel(L,X))}
 sndGore(true);{const V=vox(L);play(V.ko,{vol:.8,rate:V.rate*1.1,force:true})}
 L.gone=true;cam.shake=Math.max(cam.shake,.9);flashScreen=Math.max(flashScreen,.3);impact(1.5)}
function lc(L){const X=lfx(L);return{x:L.x+X.ox,y:L.y+X.oy-FH*.5*X.sy}}
function triggerCatality(){if(!finish||!finish.armed)return;finish.armed=false;finish.run=0;finish.pre=0;finish.done={};const {winner,loser}=finish;
 const F=FINS[winner.def.n]||['CATALITY','zap'];{const dd=Math.sign(loser.x-winner.x)||1;winner.x=clamp(loser.x-dd*Math.min(Math.abs(loser.x-winner.x),330*SC),LEFT,RIGHT);winner.facing=dd}finish.kind=F[1];finish.name=F[0];if(FINSFX[F[1]])play(FINSFX[F[1]],{vol:.85,force:true,delay:.2});play('whispers',{vol:.45,force:true});play('swell',{vol:.5,force:true});finish.w0=winner.x;setSt(winner,'idle');SFX.special();lfx(loser);{const sp=winner.def.sp.name;winner.def.sp.name='';castFX(winner);winner.def.sp.name=sp;callouts=[]}
 banner={s:'',t:0,dur:9999};finish.endAt=(FIN_DUR[F[1]]||2.6)+.3+(SKELK.has(F[1])?.9:0);finish.endBanner=()=>{banner={s:F[0],t:0,dur:1.5,c:winner.def.c,next:{s:'CATALITY',dur:1.8,c:winner.def.c},after:()=>finishMatch(winner,false,true)}}}
function runCatality(dt){for(const P of pops)P.t+=dt;pops=pops.filter(P=>P.t<.75);if(xr)xr.t+=dt;updSkels(dt);if(finish&&finish.run!=null&&finish.pre!=null&&finish.pre<50){prelude(dt);return}const s0=cam.shake;runCatality0(dt);if(finish&&finish.run!=null&&finish.endBanner&&finish.run>finish.endAt){const eb=finish.endBanner;finish.endBanner=null;eb()}if(finish&&finish.run!=null&&cam.shake>s0+.15)impact(Math.min(1.4,cam.shake))}
function runCatality0(dt){const F=finish;if(!F||F.run==null)return;F.run+=dt;const r=F.run,Wn=F.winner,L=F.loser,X=lfx(L),c=Wn.def.c,d=Math.sign(L.x-Wn.x)||1;
 const once=k=>!F.done[k]&&(F.done[k]=1);const ramp=(a,b)=>clamp((r-a)/(b-a),0,1);
 switch(F.kind){
 case 'slam':{if(r<.75){const k=r/.75;Wn.x=lerp(F.w0,L.x-d*30*SC,k);Wn.y=GY-Math.sin(k*Math.PI*.92)*560*SC;Wn.vy=0;Wn.st='jump';Wn.spin=k*TAU*1.5}
  else if(once('hit')){Wn.y=GY;Wn.vy=0;setSt(Wn,'win');X.sy=.32;X.sx=1.25;cam.shake=.9;flashScreen=.35;bleed(L.x,GY-60,140,{v:800,up:300,w:160,size:1.3});for(let i=0;i<6;i++)splat(L.x+(Math.random()-.5)*300*SC,40+Math.random()*50);ring(L.x,GY-10,'#fff',true);ring(L.x,GY-10,c,true);spark(L.x,GY-20,'#bbb',40,1.4);SFX.heavy();SFX.thunder();}
  if(r>1.5&&once('die'))shatter(L,null,{up:500});break}
 case 'gild':{X.tint='#f0bf3a';X.tintA=ramp(0,1.2)*.92;if(Math.random()<dt*25)aura.push({e:'arcane',x:L.x+(Math.random()-.5)*160*SC,y:L.y-Math.random()*FH,vx:0,vy:-40,t:0,life:.8,s:8*SC,c:'#ffd76a'});
  if(r>1.25&&once('ping')){L.flash=.15;SFX.block()}if(r>1.7&&once('die'))shatter(L,()=>pick(['#ffd76a','#f0bf3a','#c8901e','#fff1b0']),{size:1.6,skip:.7});break}
 case 'freeze':{X.tint='#cdeeff';X.tintA=ramp(0,.8)*.8;if(once('spikes'))addFx(2.2,(k)=>{ctx.save();ctx.globalAlpha=k<.7?1:1-(k-.7)/.3;ctx.fillStyle='rgba(190,235,255,.85)';ctx.strokeStyle='#fff';ctx.lineWidth=2;const g=Math.min(1,k*3);for(let i=0;i<9;i++){const x=L.x+(i-4)*34*SC,hh=(110+((i*53)%70))*SC*g;ctx.beginPath();ctx.moveTo(x-22*SC,GY);ctx.lineTo(x,GY-hh);ctx.lineTo(x+22*SC,GY);ctx.closePath();ctx.fill();ctx.stroke()}ctx.restore()});
  if(r>1.2&&once('punch')){Wn.x=L.x-d*230*SC;setSt(Wn,'punch')}if(r>1.32&&once('die')){shatter(L,()=>pick(['#e8f8ff','#bfe6ff','#8fd3ff','#ffffff']),{size:1.4,skip:.55});spark(L.x,GY-FH*.5,'#fff',40,1.4)}break}
 case 'gore':{if(once('dash')){setSt(Wn,'dash');Wn.dashHit=true}if(r>.3&&once('hit')){X.vx=d*1700*SC;X.vy=-1300;cam.shake=.8;bleed(L.x,GY-FH*.5,120,{dir:d>0?-.3:Math.PI+.3,cone:1.4,v:1100,up:200,size:1.3});splat(L.x,70);flashScreen=.3;SFX.heavy();ring(L.x,GY-FH*.5,c,true);spark(L.x,GY-FH*.5,c,36,1.4);}
  if(r>.3&&!L.gone){X.ox+=X.vx*dt;X.oy+=X.vy*dt;X.vy+=1500*dt;X.rot+=dt*9*d;if(Math.random()<.6)bleed(L.x+X.ox,L.y+X.oy-FH*.5,3,{v:120,up:0,size:1.1});{const ax=L.x+X.ox;if((ax<90||ax>WW-90||(X.oy>0&&r>.6))&&once('wall')){X.ox=clamp(X.ox,90-L.x,WW-90-L.x);X.oy=Math.min(X.oy,0);shatter(L,null,{up:700,spread:900,skip:.4});splat(clamp(ax,90,WW-90),90)}}}if(r>1.6&&once('far')){cam.shake=.5}break}
 case 'sand':{X.tint='#d6b47a';X.tintA=ramp(0,1.2)*.85;if(once('storm'))addFx(3,(k,t)=>{ctx.save();ctx.globalAlpha=Math.min(1,k*4)*(1-Math.max(0,k-.7)/.3);for(let i=0;i<120;i++){const a=t*(2+i%5)+i,rr=(60+(i*37%160))*SC,y=GY-((i*53)%FH);ctx.fillStyle=i%3?'rgba(214,180,122,.7)':'rgba(160,120,70,.7)';ctx.fillRect(L.x+Math.cos(a)*rr,y+Math.sin(a)*14,3,3)}ctx.restore()});
  if(r>1.4&&once('die'))shatter(L,()=>pick(['#d6b47a','#c49a5e','#a88048','#e8cf9c']),{g:180,up:120,spread:260,skip:.35});break}
 case 'roots':{const shd=Wn.def.n===32;if(once('vines'))addFx(2.8,(k)=>{ctx.save();ctx.strokeStyle=shd?'#0c0814':'#3f7a2a';if(shd){ctx.shadowColor='#6a4aa8';ctx.shadowBlur=14;const pg=ctx.createRadialGradient(L.x,GY,0,L.x,GY,260*SC);pg.addColorStop(0,'rgba(0,0,0,.9)');pg.addColorStop(1,'rgba(0,0,0,0)');ctx.save();ctx.translate(0,GY);ctx.scale(1,.25);ctx.translate(0,-GY);ctx.fillStyle=pg;ctx.beginPath();ctx.arc(L.x,GY,260*SC*Math.min(1,k*3),0,TAU);ctx.fill();ctx.restore()}ctx.lineCap='round';const g=Math.min(1,k*2.2);for(let i=0;i<7;i++){const x0=L.x+(i-3)*30*SC;ctx.lineWidth=(10-Math.abs(i-3))*SC;ctx.beginPath();ctx.moveTo(x0,GY);ctx.bezierCurveTo(x0+60*SC*Math.sin(i),GY-FH*.3*g,x0-50*SC*Math.cos(i),GY-FH*.6*g,x0+(i-3)*8,GY-FH*.85*g);ctx.stroke()}ctx.restore()});
  if(Math.random()<dt*14)aura.push({e:shd?'arcane':'nature',x:L.x+(Math.random()-.5)*200*SC,y:GY-Math.random()*FH,vx:(Math.random()-.5)*60,vy:shd?-60:50,t:0,life:1.2,s:9*SC,c:shd?'#6a4aa8':'#6DBE45',r:Math.random()*TAU});
  if(r>.9){X.clip=true;X.oy=ease((r-.9)/1.3)*FH*1.05;if(r<2.2&&Math.random()<.7){bleed(L.x,GY-6,4,{v:300,up:420,w:140*SC,h:4});if(Math.random()<.15)splat(L.x+(Math.random()-.5)*160*SC,50)}if(once('drag'))impact(.8)}if(r>2.3&&once('die')){L.gone=true;SFX.land();impact(1)}break}
 case 'chains':{if(once('c')){SFX.special();for(let i=0;i<8;i++){const an=-Math.PI*(.15+.7*(i/7)),ax=L.x+Math.cos(an)*1400*SC*(i%2?1:-1),ay=GY-FH*.5+Math.sin(an)*900*SC,tg=[(Math.random()-.5)*.6,.2+Math.random()*.6],t0=i*.09;
    addFx(2.4,(k,t)=>{const kk=clamp((t-t0)/.25,0,1);if(kk<=0)return;const X2=L.fx||{ox:0,oy:0},bx=L.x+X2.ox+tg[0]*FH*.5,by=GY+X2.oy-FH*tg[1];const tx=L.gone?bx+(bx-ax)*.3:bx,ty=L.gone?by-60:by,ex=lerp(ax,tx,kk),ey=lerp(ay,ty,kk);
     const an2=Math.atan2(ey-ay,ex-ax),len=Math.hypot(ex-ax,ey-ay),n=Math.floor(len/(16*SC));ctx.strokeStyle='#8a8078';ctx.lineWidth=3*SC;for(let j=0;j<n;j+=1){ctx.save();ctx.translate(ax+Math.cos(an2)*j*16*SC,ay+Math.sin(an2)*j*16*SC);ctx.rotate(an2+(j%2?Math.PI/2:0));ctx.beginPath();ctx.ellipse(0,0,8*SC,4*SC,0,0,TAU);ctx.stroke();ctx.restore()}
     ctx.save();ctx.translate(ex,ey);ctx.rotate(an2);ctx.fillStyle='#d8d0c8';ctx.beginPath();ctx.moveTo(18*SC,0);ctx.quadraticCurveTo(0,-18*SC,-10*SC,-8*SC);ctx.lineTo(0,0);ctx.closePath();ctx.fill();ctx.restore()});
    setTimeout(()=>{if(finish&&finish.loser===L&&!L.gone){bleed(L.x+(Math.random()-.5)*60*SC,GY-FH*(.3+Math.random()*.4),14,{v:500,up:200});SFX.hit();L.flash=.1}},(t0+.25)*1000)}}
  if(r>.6&&r<1.8){X.oy=-Math.min(1,(r-.6)*2)*110*SC;X.ox=Math.sin(r*40)*6*(r-.6);X.sx=1+(r-.6)*.12;X.sy=1+(r-.6)*.1;if(Math.random()<.5)bleed(L.x,GY+X.oy-FH*.5,4,{v:300,up:80})}
  if(r>1.8&&once('rip')){hitPop(L.x,GY-FH,'RIIIP!','#c21a2a');shatter(L,null,{spread:1800,up:900,skip:.35})}break}
 case 'claws':{if(once('dream')){addFx(3,(k)=>{camReset();ctx.fillStyle=`rgba(10,0,4,${.2*Math.sin(Math.PI*Math.min(1,k*1.2))})`;ctx.fillRect(0,0,W,H);camApply(1)})}
  for(const [tt,key,an] of [[.3,'a',.5],[.65,'b',-.4],[1.0,'c',.15],[1.35,'d',-.7]])if(r>tt&&once(key)){SFX.heavyWhoosh();impact(.9);L.flash=.15;const cx=L.x,cy=GY-FH*.5;bleed(cx,cy,40,{dir:an-Math.PI/2,cone:1.4,v:900,up:120});
   addFx(.3,(k)=>{ctx.save();ctx.translate(cx,cy);ctx.rotate(an);for(let i=0;i<4;i++){const off=(i-1.5)*26*SC,len=170*SC;ctx.strokeStyle=`rgba(${i%2?120:200},${i%2?0:190},${i%2?10:190},${.85*(1-k)})`;ctx.lineWidth=(3-i*.3)*(1-k)+1;ctx.beginPath();ctx.moveTo(-len,off-30*SC);ctx.quadraticCurveTo(0,off+20*SC,len,off-30*SC);ctx.stroke()}ctx.restore()});
   splat(cx+(Math.random()-.5)*200*SC,60)}
  if(r>1.4){X.rot=Math.sin(r*30)*.05}
  if(r>1.75&&once('die')){hitPop(L.x,GY-FH,'SWEET DREAMS','#ff5a8a');shatter(L,null,{spread:1100,up:700,skip:.3})}break}
 case 'boxglove':{const bx=Wn.x+d*120*SC;if(once('box')){SFX.special();addFx(2.6,(k,t)=>{const pop=t>.55,ext=pop?Math.min(1,(t-.55)/.12):0,tx=lerp(bx,L.x-d*40*SC,ext);ctx.save();
    ctx.fillStyle='#6a2a8a';ctx.strokeStyle='#000';ctx.lineWidth=3;const bob=t<.55?Math.sin(t*40)*4:0;ctx.fillRect(bx-40*SC,GY-80*SC+bob,80*SC,80*SC);ctx.strokeRect(bx-40*SC,GY-80*SC+bob,80*SC,80*SC);ctx.fillStyle='#7BD34A';ctx.fillRect(bx-40*SC,GY-80*SC+bob,80*SC,12*SC);
    if(!pop){ctx.fillStyle='#ddd';ctx.save();ctx.translate(bx+44*SC*d,GY-40*SC);ctx.rotate(t*12);ctx.fillRect(-3,-14*SC,6,28*SC);ctx.restore()}
    else{const sy=GY-FH*.55;ctx.strokeStyle='#bbb';ctx.lineWidth=5;ctx.beginPath();const n=10;for(let i=0;i<=n;i++){const x=lerp(bx,tx,i/n),y=lerp(GY-80*SC,sy,i/n)+(i%2?-12:12)*SC;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke();ctx.fillStyle='#E8302A';ctx.strokeStyle='#000';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(tx,sy,52*SC,44*SC,0,0,TAU);ctx.fill();ctx.stroke();}
    ctx.restore()});hitPop(bx,GY-FH*.5,'HA HA HA!','#7BD34A')}
  if(r>.67&&once('hit')){X.vx=d*2400*SC;X.vy=-900;impact(1.4);hitPop(L.x,GY-FH*.8,'PUNCHLINE!','#7BD34A');bleed(L.x,GY-FH*.6,60,{dir:d>0?-.3:Math.PI+.3,cone:1,v:1300,up:200})}
  if(r>.67&&!L.gone){X.ox+=X.vx*dt;X.oy+=X.vy*dt;X.vy+=1600*dt;X.rot+=dt*14*d;{const ax=L.x+X.ox;if((ax<90||ax>WW-90)&&once('wall')){X.ox=clamp(X.ox,90-L.x,WW-90-L.x);shatter(L,null,{up:700,spread:900,skip:.35});splat(clamp(ax,90,WW-90),100)}}}break}
 case 'bullets':{if(r<1.5){F.sh=(F.sh||0)-dt;if(F.sh<=0&&r>.2){F.sh=.07;const hx=Wn.x+d*110*SC,hy=Wn.y-FH*(.5+Math.random()*.1),tx=L.x+(Math.random()-.5)*90*SC,ty=GY-FH*(.25+Math.random()*.6);gunshot();pv('stab',5,{vol:.5});L.flash=.06;X.ox=(Math.random()-.5)*14;X.rot=(Math.random()-.5)*.06;
    addFx(.12,(k)=>{ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(255,230,150,${1-k})`;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(tx,ty);ctx.stroke();glowDot(hx,hy,40*SC,'#ffd36a',1-k)});
    const hole=[tx-L.x,ty];addFx(3,(k)=>{if(L.gone)return;const X2=L.fx||{ox:0,oy:0};ctx.fillStyle='#3a0006';ctx.beginPath();ctx.arc(L.x+X2.ox+hole[0],hole[1]+X2.oy,4*SC,0,TAU);ctx.fill()});
    bleed(tx,ty,6,{dir:d>0?-.1:Math.PI+.1,cone:.8,v:500,up:60});if(Math.random()<.15)splat(tx+d*80*SC,30)}if(once('bt')){timeScale=.45;slowT=1.3;hitPop(Wn.x,GY-FH*1.05,'BULLET TIME','#7C8CA8')}}
  else{if(once('fall')){impact(1.1);hitPop(L.x,GY-FH*.7,'HEADSHOT','#ff3b2e');bleed(L.x,GY-FH*.85,70,{dir:d>0?-.2:Math.PI+.2,cone:.8,v:1100,up:120})}const k=ease(clamp((r-1.5)/.6,0,1));X.rot=-d*k*1.45;X.oy=k*FH*.1;X.ox=d*k*40*SC;if(r>2.1&&once('pool'))for(let i=0;i<5;i++)splat(L.x+d*(FH*.4)+(Math.random()-.5)*160*SC,90)}break}
 case 'chop':{if(once('tp')){Wn.x=clamp(L.x-d*250*SC,LEFT,RIGHT)}for(const [tt,key] of [[.25,'a'],[.55,'b'],[.85,'c'],[1.15,'e']])if(r>tt&&once(key)){SFX.heavy();impact(.8);L.flash=.12;setSt(Wn,'punch');Wn.t=MOVES.punch.hitAt;const cx=L.x,cy=GY-FH*(.45+Math.random()*.2),s=Math.random()<.5?1:-1;bleed(cx,cy,35,{dir:-Math.PI/2+s*.6,cone:1.2,v:900,up:250});splat(cx+(Math.random()-.5)*200*SC,60);
   addFx(.25,(k)=>{ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(255,255,255,${1-k})`;ctx.shadowColor='#c21a2a';ctx.shadowBlur=20;ctx.lineWidth=10*(1-k)+2;ctx.beginPath();ctx.arc(cx-d*60*SC,cy-40*SC,150*SC,s>0?-.2:.9,s>0?1.2:2.4);ctx.stroke()})}
  if(r>1.5){if(once('dec')){impact(1.5);hitPop(L.x,GY-FH*1.05,'OFF WITH IT!','#ff3b2e');X.cutA=.74;X.cutB=.7;X.tm=[-.7,-1.1];X.bm=[.02,.01];X.trot=1.6}X.split=ease(clamp((r-1.5)/.7,0,1))*340*SC;if(r<2.6)bleed(L.x,GY-FH*.72,7,{dir:-Math.PI/2,cone:.5,v:900,up:400,size:1.2})}
  if(r>2.7&&once('die')){L.gone=true;for(let i=0;i<6;i++)splat(L.x+(Math.random()-.5)*300*SC,90)}break}
 case 'crowbar':{if(once('tp')){Wn.x=clamp(L.x-d*230*SC,LEFT,RIGHT);Wn.facing=d}const T=[.3,.75,1.15,1.5,1.85];
  for(let i=0;i<T.length;i++)if(r>T[i]&&once('k'+i)){setSt(Wn,i%2?'upper':'punch');Wn.t=MOVES.punch.hitAt;SFX.heavy();impact(.7+i*.15);L.flash=.08;const hy=GY-FH*(i<2?.78:.55+Math.random()*.15);bleed(L.x,hy,26+i*8,{dir:d>0?-.3:Math.PI+.3,cone:1.3,v:700+i*80,up:220});splat(L.x+d*(60+Math.random()*120)*SC,50+i*10);
   const sx=Wn.x+d*120*SC,sy=GY-FH*.9;addFx(.16,(k)=>{ctx.strokeStyle=`rgba(200,200,210,${.5*(1-k)})`;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(L.x,hy);ctx.stroke()});X.rot=-d*.06*(i+1);X.ox=d*12*SC*(i+1);X.sy=1-.03*i}
  if(r>2.1){const k=ease(clamp((r-2.1)/.5,0,1));X.rot=-d*(.3+k*1.25);X.oy=k*FH*.1;X.ox=d*(60+k*60)*SC;if(once('down')){cam.shake=.6;SFX.land();for(let i=0;i<6;i++)splat(L.x+d*FH*.35+(Math.random()-.5)*200*SC,110)}}break}
 case 'slices':{const cuts=[.25,.38,.5,.62,.74,.86];for(let i=0;i<cuts.length;i++)if(r>cuts[i]&&once('s'+i)){SFX.heavyWhoosh();L.flash=.05;const cy=GY-FH*(.3+Math.random()*.5),an=(Math.random()-.5)*.9;addFx(.12,(k)=>{ctx.strokeStyle=`rgba(235,235,240,${.8*(1-k)})`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(L.x-Math.cos(an)*200*SC,cy-Math.sin(an)*200*SC);ctx.lineTo(L.x+Math.cos(an)*200*SC,cy+Math.sin(an)*200*SC);ctx.stroke()});bleed(L.x,cy,10,{v:350,up:120})}
  if(r>.9&&r<1.6&&once('sheathe')){Wn.x=clamp(L.x+d*200*SC,LEFT,RIGHT);Wn.facing=-d;SFX.block()}
  if(Math.random()<dt*20)aura.push({e:'nature',x:L.x+(Math.random()-.5)*400*SC,y:GY-FH*1.1,vx:-30+Math.random()*60,vy:60+Math.random()*40,t:0,life:2,s:7*SC,c:pick(['#f2b8c8','#e89ab0','#fbd3de']),r:Math.random()*TAU});
  if(r>1.6){if(once('fall')){impact(1.2);X.cutA=.58;X.cutB=.5;X.tm=[-.25,.2];X.bm=[0,0];X.trot=.9}X.split=ease(clamp((r-1.6)/.9,0,1))*260*SC;if(r<2.6)bleed(L.x,GY-FH*.54,6,{v:420,up:260,w:120*SC,h:20})}
  if(r>2.5&&once('pool'))for(let i=0;i<6;i++)splat(L.x+(Math.random()-.5)*260*SC,100);if(r>2.9&&once('die'))L.gone=true;break}
 case 'lunarfall':{const top=-460*SC;if(once('beam'))addFx(1.6,(k)=>{const g=Math.min(1,k*4)*(k>.75?(1-k)/.25:1);ctx.save();const wd=90*SC*g;const gr=ctx.createLinearGradient(L.x-wd,0,L.x+wd,0);gr.addColorStop(0,'rgba(180,190,210,0)');gr.addColorStop(.5,`rgba(200,210,225,${.35*g})`);gr.addColorStop(1,'rgba(180,190,210,0)');ctx.fillStyle=gr;ctx.fillRect(L.x-wd,-1400,wd*2,GY+1400);ctx.restore()});
  if(r<1.4){const k=ease(clamp((r-.2)/1.1,0,1));X.oy=top*k;X.rot=Math.sin(r*5)*.12*k;if(Math.random()<dt*12)aura.push({e:'smoke',x:L.x+(Math.random()-.5)*60*SC,y:GY-8,vx:(Math.random()-.5)*60,vy:-20,t:0,life:1,s:16*SC,c:'#3c3a40'})}
  else{if(once('drop')){X.vy=0;SFX.heavyWhoosh()}if(!F.done.land){X.vy+=5200*dt;X.oy+=X.vy*dt;X.rot*=.9;if(X.oy>=0){X.oy=0;F.done.land=1;cam.shake=1;impact(1.6);ring(L.x,GY-6,'#6a5a50',true);for(let i=0;i<8;i++)splat(L.x+(Math.random()-.5)*360*SC,110);bleed(L.x,GY-30,180,{v:900,up:420,w:140,size:1.3});shatter(L,null,{spread:900,up:420,skip:.35});
   addFx(3,(k)=>{ctx.save();ctx.translate(L.x,GY+2);ctx.scale(1,.2);ctx.strokeStyle=`rgba(20,14,10,${.8*(1-k*.4)})`;ctx.lineWidth=3;for(let i=0;i<9;i++){const a=i/9*TAU+.3;ctx.beginPath();ctx.moveTo(0,0);let x=0,y=0;for(let j=0;j<4;j++){x+=Math.cos(a+(j%2?.3:-.3))*55*SC;y+=Math.sin(a+(j%2?.3:-.3))*55*SC;ctx.lineTo(x,y)}ctx.stroke()}ctx.restore()})}}}break}
 case 'molten':{const sx=L.x,top=-500;if(once('pour')){SFX.special();addFx(2.2,(k,t)=>{if(t>1.9)return;const w=(14+Math.sin(t*30)*3)*SC;ctx.save();const g=ctx.createLinearGradient(sx-w,0,sx+w,0);g.addColorStop(0,'rgba(255,120,20,0)');g.addColorStop(.5,'rgba(255,200,90,.95)');g.addColorStop(1,'rgba(255,120,20,0)');ctx.fillStyle=g;ctx.fillRect(sx-w,top,w*2,(GY-FH*.95)-top+Math.min(1,t*4)*FH*.6);ctx.restore()})}
  X.tint='#5a3a10';X.tintA=ramp(.2,1.6)*.85;if(r>.25&&r<2)for(let i=0;i<2;i++){aura.push({e:'smoke',x:L.x+(Math.random()-.5)*120*SC,y:GY-FH*(.2+Math.random()*.8),vx:(Math.random()-.5)*30,vy:-90-Math.random()*60,t:0,life:1.2,s:(16+Math.random()*14)*SC,c:'#2e2a26'});if(Math.random()<.4)gore.push({x:L.x+(Math.random()-.5)*110*SC,y:GY-FH*(.3+Math.random()*.6),vx:(Math.random()-.5)*40,vy:80,t:0,s:4*SC,c:pick(['#ffb030','#e88a10','#c06a08'])})}
  if(r>.3&&r<1.9){X.ox=Math.sin(r*55)*5*Math.min(1,r);X.sy=1-ramp(1,1.9)*.25;X.sx=1+ramp(1,1.9)*.12}
  if(r>.6&&once('pool'))addFx(2.2,(k)=>{const g=Math.min(1,k*2);ctx.save();ctx.translate(L.x,GY+3);ctx.scale(1,.22);const gr=ctx.createRadialGradient(0,0,0,0,0,230*SC*g);gr.addColorStop(0,'rgba(255,190,80,.9)');gr.addColorStop(.6,'rgba(200,90,10,.7)');gr.addColorStop(1,'rgba(60,20,0,0)');ctx.fillStyle=gr;ctx.beginPath();ctx.arc(0,0,230*SC*g,0,TAU);ctx.fill();ctx.restore()});
  if(r>1.95&&once('die'))shatter(L,()=>pick(['#3a2a12','#5a4018','#7a5a20','#2a2018','#c89030']),{g:2200,up:250,spread:400,skip:.3,size:1.3});break}
 case 'impale':{const sp=F.sp||(F.sp=[...Array(7)].map((_,i)=>({x:(i-3)*26*SC+(Math.random()-.5)*14*SC,h:(.55+Math.random()*.6)*FH,an:(Math.random()-.5)*.35,t0:.15+i*.06})));
  if(once('sp'))addFx(2.6,(k,t)=>{for(const q of sp){const g=clamp((t-q.t0)/.08,0,1)*(t>2.2?1-(t-2.2)/.4:1);if(g<=0)continue;ctx.save();ctx.translate(L.x+q.x,GY);ctx.rotate(q.an);const hh=q.h*g,ww=16*SC;const gr=ctx.createLinearGradient(-ww,0,ww,0);gr.addColorStop(0,'rgba(120,110,140,.9)');gr.addColorStop(.5,'rgba(230,220,240,.95)');gr.addColorStop(1,'rgba(90,80,110,.9)');ctx.fillStyle=gr;ctx.beginPath();ctx.moveTo(-ww,0);ctx.lineTo(0,-hh);ctx.lineTo(ww,0);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(30,20,30,.6)';ctx.lineWidth=1.5;ctx.stroke();
    if(t>q.t0+.1){ctx.fillStyle='rgba(110,0,12,.85)';ctx.beginPath();ctx.moveTo(-ww*.5,-hh*.35);ctx.lineTo(0,-hh*.95);ctx.lineTo(ww*.4,-hh*.4);ctx.closePath();ctx.fill()}ctx.restore()}});
  for(const q of sp)if(r>q.t0&&once('h'+q.t0)){SFX.heavy();L.flash=.06;bleed(L.x+q.x,GY-q.h*.6,14,{dir:-Math.PI/2+q.an,cone:.8,v:600,up:200});cam.shake=Math.max(cam.shake,.35)}
  if(r>.2&&r<2.1){X.oy=-ease(clamp((r-.2)/.4,0,1))*70*SC;X.ox=Math.sin(r*40)*3*(r<.8?1:.2);if(Math.random()<.4)bleed(L.x+(Math.random()-.5)*70*SC,GY-FH*.25,3,{v:80,up:0})}
  if(r>.9&&once('drip'))for(let i=0;i<5;i++)splat(L.x+(Math.random()-.5)*200*SC,90);
  if(r>2.2&&once('die')){SFX.block();impact(1.2);shatter(L,null,{spread:800,up:500,skip:.35})}break}
 case 'well':{if(once('pool')){addFx(3.2,(k,t)=>{const g=Math.min(1,t*3)*(k>.9?(1-k)/.1:1);ctx.save();ctx.translate(L.x,GY+3);ctx.scale(1,.24);const gr=ctx.createRadialGradient(0,0,0,0,0,260*SC*g);gr.addColorStop(0,'rgba(4,10,14,.98)');gr.addColorStop(.7,'rgba(10,30,40,.9)');gr.addColorStop(1,'rgba(40,70,90,0)');ctx.fillStyle=gr;ctx.beginPath();ctx.arc(0,0,260*SC*g,0,TAU);ctx.fill();ctx.strokeStyle=`rgba(160,190,210,${.25*g})`;ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(0,0,(80+((t*120+i*70)%180))*SC,0,TAU);ctx.stroke()}ctx.restore()});SFX.special()}
  if(once('hair'))addFx(2.8,(k,t)=>{ctx.save();ctx.strokeStyle='rgba(6,6,8,.92)';ctx.lineCap='round';const g=Math.min(1,t*2.2);const X2=L.fx||{oy:0};for(let i=0;i<16;i++){const x0=L.x+(i-7.5)*14*SC;ctx.lineWidth=(2+((i*7)%3))*SC;ctx.beginPath();ctx.moveTo(x0,GY);const hh=FH*(.35+((i*37)%40)/100)*g;ctx.bezierCurveTo(x0+Math.sin(t*3+i)*30*SC,GY-hh*.4,x0-Math.cos(t*2+i)*40*SC,GY-hh*.8,L.x+(i-7.5)*5*SC,GY+X2.oy-hh);ctx.stroke()}ctx.restore()});
  if(r>.8){X.clip=true;X.oy=Math.pow(clamp((r-.8)/1.5,0,1),1.6)*FH*1.05;X.rot=Math.sin(r*20)*.04;if(Math.random()<dt*25)gore.push({x:L.x+(Math.random()-.5)*200*SC,y:GY-4,vx:(Math.random()-.5)*300,vy:-400-Math.random()*400,t:0,s:4*SC,c:pick(['#9fc8dc','#cfe6f0','#6a90a8'])});if(once('grab')){impact(.9);SFX.land()}}
  if(r>2.3&&once('die')){L.gone=true;SFX.ko();addFx(2,(k)=>{ctx.save();ctx.translate(L.x,GY+3);ctx.scale(1,.24);ctx.fillStyle=`rgba(90,0,10,${.6*(1-k)})`;ctx.beginPath();ctx.arc(0,0,(60+k*160)*SC,0,TAU);ctx.fill();ctx.restore()});for(let i=0;i<10;i++)aura.push({e:'smoke',x:L.x+(Math.random()-.5)*80*SC,y:GY-6,vx:0,vy:-30,t:0,life:1.4,s:14*SC,c:'#c8d8e0'})}break}
 case 'smother':{if(Math.random()<dt*(r<1.9?60:6))aura.push({e:'smoke',x:L.x+(Math.random()-.5)*(r<.5?400:160)*SC,y:GY-FH*Math.random()*.95,vx:(L.x-0)*0+(Math.random()-.5)*40,vy:-10-Math.random()*20,t:0,life:1.4,s:(30+Math.random()*30)*SC,c:'#5a5a5e'});
  X.tint='#3a3a3a';X.tintA=ramp(.5,1.8)*.8;if(r>.4&&r<1.9){X.ox=Math.sin(r*35)*6*ramp(.4,1);X.rot=Math.sin(r*9)*.06;X.sy=1-ramp(.9,1.9)*.12;X.sx=1-ramp(.9,1.9)*.08;if(once('choke'))SFX.heavy()}
  if(r>1.9&&once('die'))shatter(L,()=>pick(['#3a3838','#4a4644','#2a2826','#5a5652','#1e1c1a']),{g:300,up:120,spread:260,skip:.3});break}
 case 'split':{const col=Wn.def.n===8?'#ff2a2a':c;for(const [tt,k2] of [[.2,'a'],[.45,'b'],[.7,'c']])if(r>tt&&once(k2)){SFX.heavyWhoosh();L.flash=.12;const ang=(Math.random()-.5)*1.2;addFx(.35,(k)=>{ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=col;ctx.shadowColor=col;ctx.shadowBlur=24;ctx.lineWidth=10*(1-k)+2;ctx.globalAlpha=1-k;const cx=L.x,cy=GY-FH*.5;ctx.beginPath();ctx.moveTo(cx-Math.cos(ang)*260*SC,cy-Math.sin(ang)*260*SC);ctx.lineTo(cx+Math.cos(ang)*260*SC,cy+Math.sin(ang)*260*SC);ctx.stroke();ctx.restore()})}
  if(r>1.05){if(once('sp')){SFX.heavy();cam.shake=.6;spark(L.x,GY-FH*.5,col,30)}X.split=ease((r-1.05)/1.1)*260*SC;const cx=L.x,cy=GY-FH*.5;if(r<2.4)bleed(cx+(Math.random()-.5)*X.split,cy+(Math.random()-.5)*X.split*.4,6,{v:420,up:380,w:200*SC,h:30,size:1.1});if(Math.random()<dt*10)splat(cx+(Math.random()-.5)*240*SC,40)}if(r>2.5&&once('die')){L.gone=true;spark(L.x,GY-FH*.3,col,30);bleed(L.x,GY-FH*.45,160,{v:700,up:500,w:220,size:1.3});impact(1.3)}break}
 case 'hex':{if(r>.5&&once('poof')){X.sx=X.sy=.3;SFX.special();ring(L.x,GY-FH*.3,c,true);for(let i=0;i<30;i++)aura.push({e:'arcane',x:L.x+(Math.random()-.5)*200*SC,y:GY-Math.random()*FH*.8,vx:(Math.random()-.5)*200,vy:-Math.random()*200,t:0,life:.9,s:12*SC,c});}
  if(r<.5){X.rot=Math.sin(r*60)*.1*(r/.5)}else X.rot=0;break}
 case 'toxic':{X.tint='#7dff4a';X.tintA=ramp(0,1)*.55;if(Math.random()<dt*30)aura.push({e:'toxic',x:L.x+(Math.random()-.5)*240*SC,y:GY-Math.random()*FH,vx:0,vy:-30,t:0,life:1,s:14*SC,c});
  if(r>.8){const k=ease((r-.8)/1.3);X.sy=1-k*.95;X.sx=1+k*.7}if(once('pud'))addFx(2.8,(k)=>{const g=ramp(.8,2.1);ctx.save();ctx.fillStyle=hexA(c,.55);ctx.beginPath();ctx.ellipse(L.x,GY+4,(60+180*g)*SC,(8+20*g)*SC,0,0,TAU);ctx.fill();ctx.restore()});
  if(r>2.1&&once('die')){L.gone=true}break}
 case 'palm':{if(once('stance')){Wn.x=L.x-d*260*SC;setSt(Wn,'special')}if(r>.3&&once('hit')){X.vx=d*1500*SC;X.vy=-900;cam.shake=.8;flashScreen=.35;SFX.heavy();bleed(L.x,GY-FH*.6,110,{dir:d>0?-.4:Math.PI+.4,cone:1.2,v:1200,up:100,size:1.2});addFx(.7,(k)=>{ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=1-k;const cx=L.x-d*40*SC,cy=GY-FH*.55,sz=(140+k*120)*SC;const g=ctx.createRadialGradient(cx,cy,0,cx,cy,sz);g.addColorStop(0,'#fff');g.addColorStop(.4,'#ffd36a');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(cx,cy,sz*.55,sz*.7,0,0,TAU);for(let i=0;i<5;i++){ctx.ellipse(cx+(i-2)*sz*.22,cy-sz*.85,sz*.09,sz*.28,0,0,TAU)}ctx.fill();ctx.restore()});}
  if(r>.3&&!L.gone){X.ox+=X.vx*dt;X.oy+=X.vy*dt;X.vy+=1300*dt;X.rot+=dt*7*d;{const ax=L.x+X.ox;if((ax<90||ax>WW-90||(X.oy>0&&r>.6))&&once('wall')){X.ox=clamp(X.ox,90-L.x,WW-90-L.x);X.oy=Math.min(X.oy,0);shatter(L,null,{up:700,spread:900,skip:.4});splat(clamp(ax,90,WW-90),90)}}}break}
 case 'zap':{if(r<1.4){if(Math.random()<dt*9){const p=lc(L);bolts.push(mkBolt(p.x+(Math.random()-.5)*80,p.y,c));SFX.thunder();cam.shake=.4;flashScreen=.15;L.flash=.2}}else if(once('die'))shatter(L);break}
 case 'burn':{X.tint='#1c0c06';X.tintA=ramp(.2,1.5)*.88;const dragon=Wn.def.n===18;
  for(let i=0;i<(dragon?6:4);i++)aura.push({e:'fire',x:(dragon&&r<1.2?lerp(Wn.x+d*80*SC,L.x,Math.random()):L.x+(Math.random()-.5)*200*SC),y:dragon&&r<1.2?GY-FH*.6+(Math.random()-.5)*60:GY-Math.random()*FH*.6,vx:dragon&&r<1.2?d*300:(Math.random()-.5)*40,vy:-160-Math.random()*240,t:0,life:.6,s:(16+Math.random()*16)*SC,c:'#ff6a1a'});
  if(once('roar'))SFX.special();if(r>1.7&&once('die'))shatter(L,()=>pick(['#333','#4a4a4a','#ff7a1a','#2a2a2a','#ffb04a']),{g:-160,up:200,spread:300,skip:.45});break}
 case 'bubble':{if(once('bub'))addFx(2,(k,t)=>{const p=lc(L);const rr=(FH*.62)*Math.min(1,k*4);ctx.save();ctx.strokeStyle='rgba(180,240,255,.8)';ctx.lineWidth=4;ctx.fillStyle='rgba(80,200,230,.18)';ctx.beginPath();ctx.arc(p.x,p.y,rr,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.5)';ctx.beginPath();ctx.ellipse(p.x-rr*.35,p.y-rr*.4,rr*.15,rr*.08,-.6,0,TAU);ctx.fill();ctx.restore()});
  if(r>.6){X.oy=-ease((r-.6)/1.3)*260*SC;X.rot=Math.sin(r*3)*.15}if(r>1.95&&once('die')){shatter(L,()=>pick(['#9fe8ff','#2FD0C8','#e8fbff']),{g:700,skip:.6});spark(lc(L).x,lc(L).y,'#cff6ff',30)}break}
 case 'crystal':{X.tint='#f3e6ff';X.tintA=ramp(0,1)*.55;if(once('cr'))addFx(2.2,(k)=>{ctx.save();ctx.globalCompositeOperation='lighter';const g=Math.min(1,k*2.5);for(let i=0;i<10;i++){const a=i*TAU/10+k,rr=FH*.45*g,x=L.x+Math.cos(a)*rr*.6,y=GY-FH*.5+Math.sin(a)*rr;ctx.fillStyle=`hsla(${i*36},90%,70%,.55)`;ctx.beginPath();ctx.moveTo(x,y-34*SC);ctx.lineTo(x+14*SC,y);ctx.lineTo(x,y+34*SC);ctx.lineTo(x-14*SC,y);ctx.closePath();ctx.fill()}ctx.restore()});
  if(r>1.5&&once('die'))shatter(L,()=>`hsl(${Math.random()*360},90%,72%)`,{size:1.3,skip:.5});break}
 case 'vortex':{if(once('hole'))addFx(2.6,(k,t)=>{const p=lc(L);const rr=(FH*.55)*Math.min(1,k*3)*(k>.85?(1-k)/.15:1);ctx.save();const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,rr);g.addColorStop(0,'#000');g.addColorStop(.6,'#0a0420');g.addColorStop(1,'rgba(111,91,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,rr,0,TAU);ctx.fill();ctx.strokeStyle='rgba(160,140,255,.8)';ctx.lineWidth=3;for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(p.x,p.y,rr*(.5+i*.15),t*5+i,t*5+i+2.2);ctx.stroke()}ctx.restore()});
  if(r>.6){const k=ease((r-.6)/1.4);X.sx=X.sy=1-k;X.oy=-k*FH*.5;X.rot+=dt*(4+12*k)}if(r>2&&once('die')){L.gone=true;flashScreen=.4;SFX.ko();ring(L.x,GY-FH*.5,c,true)}break}
 case 'feathers':{if(Math.random()<dt*40)aura.push({e:'nature',x:L.x+(Math.random()-.5)*260*SC,y:GY-Math.random()*FH,vx:(Math.random()-.5)*200,vy:-80-Math.random()*120,t:0,life:1.2,s:12*SC,c:pick(['#1FC7A0','#E8382B','#F2C14E']),r:Math.random()*TAU});
  if(r>.6){const k=(r-.6);X.oy=-k*k*260*SC;X.rot=Math.sin(r*4)*.25;X.ox=Math.sin(r*3)*40}break}
 case 'spirit':{if(Math.random()<dt*24)aura.push({e:'arcane',x:L.x+(Math.random()-.5)*220*SC,y:GY-Math.random()*40,vx:0,vy:-120,t:0,life:.9,s:14*SC,c:'#B05CFF'});
  if(once('hands'))addFx(2.6,(k,t)=>{ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<6;i++){const x=L.x+(i-2.5)*36*SC,hh=Math.min(1,k*3)*(90+((i*41)%60))*SC;ctx.fillStyle='rgba(176,92,255,.35)';ctx.beginPath();ctx.ellipse(x+Math.sin(t*5+i)*6,GY-hh/2,12*SC,hh/2,0,0,TAU);ctx.fill()}ctx.restore()});
  if(r>.8){X.clip=true;X.oy=ease((r-.8)/1.4)*FH*1.05;X.tint='#3a1a5a';X.tintA=.4}if(r>2.3&&once('die'))L.gone=true;break}
 case 'meteor':{X.tint='#2a1206';X.tintA=ramp(.4,1.5)*.7;for(const [tt,k2] of [[.1,'a'],[.4,'b'],[.7,'c'],[.95,'d'],[1.15,'e']])if(r>tt&&once(k2)){const tx=L.x+(Math.random()-.5)*140*SC,sx=tx+(Math.random()<.5?-1:1)*500;addFx(.45,(k)=>{const x=lerp(sx,tx,k),y=lerp(-200,GY-FH*.3,k);ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(x,y,0,x,y,40*SC);g.addColorStop(0,'#fff3c4');g.addColorStop(.4,'#ff6a00');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(x-40*SC,y-40*SC,80*SC,80*SC);ctx.strokeStyle='rgba(255,120,30,.5)';ctx.lineWidth=14*SC;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-(tx-sx)*.25,y-180);ctx.stroke();ctx.restore();});setTimeout(()=>{if(scene!=='fight')return;spark(tx,GY-FH*.3,'#ff8a1a',24,1.2);cam.shake=.5;L.flash=.15;SFX.heavy()},440)}
  if(r>1.7&&once('die'))shatter(L,()=>pick(['#2a2a2a','#ff6a00','#ffb04a','#444']),{skip:.4});break}
 case 'beam':{if(once('beam'))addFx(2.6,(k)=>{const g=Math.min(1,k*3)*(k>.8?(1-k)/.2:1);ctx.save();ctx.globalCompositeOperation='lighter';const wd=110*SC*g;const gr=ctx.createLinearGradient(L.x-wd,0,L.x+wd,0);gr.addColorStop(0,'rgba(232,228,255,0)');gr.addColorStop(.5,'rgba(255,255,255,.75)');gr.addColorStop(1,'rgba(232,228,255,0)');ctx.fillStyle=gr;ctx.fillRect(L.x-wd,-1400,wd*2,GY+1400);ctx.restore()});
  if(r>.6){const k=ease((r-.6)/1.4);X.oy=-k*320*SC;X.alpha=1-k;X.tint='#ffffff';X.tintA=k*.7}if(r>2&&once('die'))L.gone=true;break}
 case 'steam':{X.tint='#ff3a1a';X.tintA=ramp(.3,1.5)*.55;if(once('gears'))addFx(2,(k,t)=>{ctx.save();ctx.strokeStyle='#c9a27a';ctx.lineWidth=6*SC;for(let i=0;i<4;i++){const a=i*TAU/4,x=L.x+Math.cos(a)*110*SC,y=GY-FH*.5+Math.sin(a)*130*SC,rr=26*SC;ctx.save();ctx.translate(x,y);ctx.rotate(t*(i%2?6:-6));ctx.beginPath();ctx.arc(0,0,rr,0,TAU);ctx.stroke();for(let j=0;j<8;j++){ctx.rotate(TAU/8);ctx.fillStyle='#c9a27a';ctx.fillRect(rr-2,-5*SC,10*SC,10*SC)}ctx.restore()}ctx.restore()});
  if(Math.random()<dt*20)aura.push({e:'toxic',x:L.x+(Math.random()-.5)*160*SC,y:GY-Math.random()*FH,vx:0,vy:-90,t:0,life:.8,s:20*SC,c:'#dddddd'});
  if(r>1.6&&once('die')){shatter(L,null,{up:1200,spread:1400});ring(L.x,GY-FH*.5,'#ffb04a',true);spark(L.x,GY-FH*.5,'#ffb04a',40,1.6)}break}
 }
}

function mkBolt(x,y,c){const pts=[];let px=x+(Math.random()-.5)*200,py=-200;while(py<y){pts.push([px,py]);py+=40+Math.random()*50;px+=(Math.random()-.5)*70}pts.push([x,y]);return{pts,c,t:0}}

function update(rdt){sceneT+=rdt;
 if(scene==='title'){if(take('start')||take('punch')||click){click=null;SFX.select();go('select')}return}
 if(scene==='select'){const mv=d=>{cursor=(cursor+d+SLOTS.length*4)%SLOTS.length;SFX.move()};
  if(take('left'))mv(-1);if(take('right'))mv(1);if(take('up'))mv(-SEL_COLS);if(take('down'))mv(SEL_COLS);
  if(hover){for(let i=0;i<SLOTS.length;i++){const r=gridRect(i);if(hover.x>r.x&&hover.x<r.x+r.w&&hover.y>r.y&&hover.y<r.y+r.h)cursor=i}}
  let chosen=take('start')||take('punch');
  if(click){for(let i=0;i<SLOTS.length;i++){const r=gridRect(i);if(click.x>r.x&&click.x<r.x+r.w&&click.y>r.y&&click.y<r.y+r.h){cursor=i;chosen=true}}click=null}
  if(chosen){p1Def=SLOTS[cursor]||SLOTS[Math.floor(Math.random()*SLOTS.length)];defeated=new Set();streak=0;level=0;SFX.select();go('roll')}return}
 if(scene==='roll'){if(take('back')){go('select');return}updRoll(rdt);return}
 if(scene==='vs'){if(sceneT>2.6||((take('start')||click)&&sceneT>.5)){click=null;startMatch()}return}
 if(scene==='result'){if(click){const c=click;click=null;for(const b of resultButtons())if(c.x>b.x&&c.x<b.x+b.w&&c.y>b.y&&c.y<b.y+b.h)b.fn()}
  if(take('start')||take('punch'))resultButtons()[0].fn();if(take('back'))go('select');return}
 if(scene!=='fight')return;
 if(take('back')){go('select');return}
 // time
 if(slowT>0){slowT-=rdt;if(slowT<=0)timeScale=1}
 const dt=rdt*timeScale;
 if(banner){banner.t+=rdt;if(banner.t>=banner.dur){if(banner.next){banner={...banner.next,t:0,after:banner.after}}else{const a=banner.after;banner=null;if(a){a();return}}}}
 const live=!roundOver&&!(banner&&/^ROUND/.test(banner.s));
 const c1=live?{left:keys.left,right:keys.right,up:keys.up,down:keys.down,punch:take('punch'),kick:take('kick'),special:take('special')}:{};
 if(finish&&finish.armed){if(finish.winner===P1){if(take('special'))triggerCatality()}else{finish.t+=rdt;if(finish.t>finish.cpuAt)triggerCatality()}}
 if(!live){take('punch');take('kick');take('special')}
 const c2=live?aiCtl(P2,P1,dt):{};
 if(hitStop>0){hitStop-=rdt}else{
  updFighter(P1,P2,dt,c1);updFighter(P2,P1,dt,c2);separate();
  for(const p of projectiles){p.t+=dt;const o=p.owner===P1?P2:P1;if(p.upd)p.upd(p,dt,o);else{p.x+=p.vx*dt;p.y+=(p.vy||0)*dt}
   const mv=Math.abs(p.vx||0)+Math.abs(p.vy||0);if(mv>60&&p.trail!==false&&!(p.wait&&p.t<p.wait)){(p.hist||(p.hist=[])).push([p.x,p.y]);if(p.hist.length>9)p.hist.shift();if(Math.random()<.7){const e=EL[p.owner.def.n]||'ki';aura.push({e,x:p.x+(Math.random()-.5)*20,y:p.y+(Math.random()-.5)*20,vx:-(p.vx||0)*.15+(Math.random()-.5)*60,vy:-(p.vy||0)*.15-30,t:0,life:.35,s:(6+Math.random()*8)*SC,c:p.c,r:Math.random()*TAU})}}else if(p.hist&&p.hist.length)p.hist.shift();p.cd=Math.max(0,(p.cd||0)-dt);
   const act=p.t>=(p.from||0)&&(p.until==null||p.t<=p.until);const hit=p.test?p.test(p,o):Math.abs(p.x-o.x)<(p.r||95*SC)&&p.y>o.y-FH-30&&p.y<o.y+30;
   if(!p.dead&&act&&p.cd<=0&&hit&&o.st!=='ko'){const res=damage(o,p.owner,p.dmg,p.kb??320,{heavy:p.heavy,stun:p.stun,stunC:p.stunC,launch:p.launch,tick:p.tick,proj:1});if(res==='hit'&&!p.tick)specialImpact(o,p.c,p.dmg>=11,p.owner);if(res==='hit'&&p.onHit)p.onHit(p,o);p.n=(p.n||0)+1;if(p.n>=(p.hits||1)){if(p.pierce||p.until!=null||p.tick)p.cd=99;else p.dead=true}else p.cd=p.every||.3}
   if(p.life&&p.t>p.life)p.dead=true;if(p.x<-400||p.x>WW+400)p.dead=true}
  for(let i=0;i<projectiles.length;i++)for(let j=i+1;j<projectiles.length;j++){const a=projectiles[i],b=projectiles[j];if(a.owner!==b.owner&&a.clash&&b.clash&&Math.abs(a.x-b.x)<60&&Math.abs(a.y-b.y)<80){a.dead=b.dead=true;spark((a.x+b.x)/2,a.y,'#fff',24);ring((a.x+b.x)/2,a.y,'#fff',true);SFX.block()}}
  projectiles=projectiles.filter(p=>!p.dead);
 }
 for(const s of sparks){s.t+=dt;if(!s.ring){s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=1000*dt}}sparks=sparks.filter(s=>s.t<s.life);
 for(const b of burst){b.t+=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.vy+=(b.g??1400)*dt;if(b.g<400)b.vx*=.985;if(b.y>GY&&(b.g??1400)>0){b.y=GY;b.vy*=-.3;b.vx*=.6}}
 for(const x of fxs)x.t+=dt;fxs=fxs.filter(x=>x.t<x.life);
 if(!roundOver||finish){emitAura(P1,dt);emitAura(P2,dt)}updAura(dt);
 for(const b of bolts)b.t+=rdt;bolts=bolts.filter(b=>b.t<.25);
 for(const f of floaters)f.t+=rdt;floaters=floaters.filter(f=>f.t<1.1);
 runCatality(rdt*timeScale);
 flashScreen=Math.max(0,flashScreen-rdt);
 updateCam(rdt,P1,P2,slowT>0?(P1.hp<=0||P1.st==='dizzy'?P1:P2):finish&&finish.run!=null?finish.loser:null);
 if(live){timer-=dt;if(P1.hp<=0)endRound(P2,'ko');else if(P2.hp<=0)endRound(P1,'ko');else if(timer<=0){timer=0;endRound(P1.hp>=P2.hp?P1:P2,'time')}}
}

// ================= scene drawing =================
function drawPortrait(n,x,y,w,h){const img=IMG.por[n];if(!img){ctx.fillStyle='#222';ctx.fillRect(x,y,w,h);return}const s=Math.max(w/img.width,h/img.height),iw=img.width*s,ih=img.height*s;ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.drawImage(img,x+(w-iw)/2,y+(h-ih)/2*.3,iw,ih);ctx.restore()}
function bigFighter(def,x,y,h,flip,glow){const img=IMG.body[def.n];if(!img)return;const w=img.width*h/img.height;ctx.save();if(glow){ctx.shadowColor=glow;ctx.shadowBlur=40}ctx.translate(x,y);ctx.scale(flip?-1:1,1);ctx.drawImage(img,-w/2,-h,w,h);ctx.restore()}
function title3D(a,b,y,s){ctx.save();ctx.translate(W/2,y);ctx.rotate(-.03);ctx.scale(s,s);for(let i=10;i>0;i--)txt(a,i*.8,-40+i*.8,150,'#3a1205');txt(a,0,-40,150,'',{metal:'#FA691D',stroke:'#000',sw:14});for(let i=10;i>0;i--)txt(b,i*.8,100+i*.8,150,'#24212b');txt(b,0,100,150,'',{metal:'#c9c4d4',stroke:'#000',sw:14});ctx.restore()}
function drawTitle(t,dt){cam.x=WW/2+Math.sin(t*.2)*200;cam.z=1.05;drawArena(t);drawAtmos(t,dt);camReset();
 ctx.fillStyle='rgba(8,7,12,.45)';ctx.fillRect(0,0,W,H);{const sc=1+Math.sin(t*2.2)*.012;drawLogo(W/2,250,860*sc,30+Math.sin(t*3)*12)}
 txt('ミャウネロ格闘',W/2,505,28,'#FA691D',{family:DELA,glow:'#FA691D'});
 const n=PLAYABLE.length;for(let i=0;i<9;i++){const f=PLAYABLE[(Math.floor(t*.6)+i)%n];bigFighter(f,130+i*128,640,165,i>=5)}
 if(Math.floor(t*2)%2===0)txt(matchMedia('(pointer:coarse)').matches?'TAP TO START':'PRESS ENTER',W/2,700,32,'#fff',{stroke:'#000',sw:6});
 if(loaded<total){ctx.fillStyle='#000';ctx.fillRect(W/2-150,470,300,8);ctx.fillStyle='#FA691D';ctx.fillRect(W/2-150,470,300*loaded/total,8)}}
function drawSelect(t,dt){cam.x=WW/2;cam.z=1;drawArena(t);drawAtmos(t,dt);camReset();ctx.fillStyle='rgba(6,5,10,.5)';ctx.fillRect(0,0,W,H);
 ctx.fillStyle='#d8c08f';rr(W/2-330,22,660,84,8);ctx.fill();ctx.strokeStyle='#6b5530';ctx.lineWidth=4;ctx.stroke();
 txt('SELECT YOUR FIGHTER',W/2,88,58,'#F4F2EE',{stroke:'#1a1410',sw:9});
 txt('FIGHTERS',W/2,138,22,'#38E04A',{stroke:'#000',sw:5});
 for(let i=0;i<SLOTS.length;i++){const r=gridRect(i),f=SLOTS[i];ctx.fillStyle='#08070b';ctx.fillRect(r.x-3,r.y-3,r.w+6,r.h+6);
  if(f)drawPortrait(f.n,r.x,r.y,r.w,r.h);else{const gg=ctx.createLinearGradient(r.x,r.y,r.x,r.y+r.h);gg.addColorStop(0,'#3a1d0f');gg.addColorStop(1,'#120806');ctx.fillStyle=gg;ctx.fillRect(r.x,r.y,r.w,r.h);txt('?',r.x+r.w/2,r.y+r.h*.72,80,'#FA691D',{stroke:'#000',sw:8});txt('RANDOM',r.x+r.w/2,r.y+r.h-8,18,'#fff')}
  if(i!==cursor){ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(r.x,r.y,r.w,r.h)}}
 // ---- enemy roster (CPU only) ----
 {const y=438;ctx.save();ctx.strokeStyle='rgba(224,48,42,.7)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(W/2-450,y);ctx.lineTo(W/2-130,y);ctx.moveTo(W/2+130,y);ctx.lineTo(W/2+450,y);ctx.stroke();ctx.restore();
  txt('ENEMY ROSTER',W/2,y+12,34,'#E0302A',{stroke:'#000',sw:6});
  for(let i=0;i<ENEMIES.length;i++){const r=enemyRect(i),e=ENEMIES[i];ctx.fillStyle=e.boss?'#5a1a10':'#2a0c0c';ctx.fillRect(r.x-3,r.y-3,r.w+6,r.h+6);drawPortrait(e.n,r.x,r.y,r.w,r.h);
   const g=ctx.createLinearGradient(0,r.y,0,r.y+r.h);g.addColorStop(0,'rgba(120,0,0,.08)');g.addColorStop(1,'rgba(90,0,0,.55)');ctx.fillStyle=g;ctx.fillRect(r.x,r.y,r.w,r.h);
   txt(e.boss?'BOSS':e.name.replace(/^THE /,''),r.x+r.w/2,r.y+r.h-6,e.name.length>11?11:13,e.boss?'#FFB13B':'#fff',{stroke:'#000',sw:3})}
  txt('THE CPU PICKS YOUR OPPONENT FROM THIS ROSTER',W/2,592,16,'#cfcbd8',{family:MONO})}
 const r=gridRect(cursor);ctx.save();ctx.strokeStyle='#38E04A';ctx.lineWidth=6;ctx.shadowColor='#38E04A';ctx.shadowBlur=14+Math.sin(t*8)*6;ctx.strokeRect(r.x-4,r.y-4,r.w+8,r.h+8);ctx.restore();txt('1',r.x+16,r.y+34,34,'#fff',{stroke:'#000',sw:6});
 const f=SLOTS[cursor];
 ctx.fillStyle='#38E04A';ctx.fillRect(15,H-62,150,40);txt('P1',90,H-31,30,'#000');if(f)bigFighter(f,90,642+Math.sin(t*3)*2,250,false,f.c+'88');
 ctx.fillStyle='#E0302A';ctx.fillRect(W-165,H-62,150,40);txt('CPU',W-90,H-31,30,'#000');txt('?',W-90,430,180,'rgba(255,255,255,.12)',{stroke:'rgba(0,0,0,.4)'});
 txt(f?f.name:'RANDOM FIGHTER',W/2,H-34,34,f?f.c:'#FA691D',{stroke:'#000',sw:7});
 if(f)txt(`SPECIAL · ${f.sp.name}`,W/2,H-6,18,'#cfcbd8',{family:MONO});
 if(best>0)txt(`BEST STREAK ${best}`,W-20,30,20,'#FA691D',{align:'right'})}
function drawVS(t,dt){cam.x=WW/2;cam.z=1;drawArena(t);drawAtmos(t,dt);camReset();
 // split lightning backdrop
 ctx.save();ctx.globalCompositeOperation='lighter';const L=ctx.createLinearGradient(0,0,W/2,0);L.addColorStop(0,p1Def.c+'55');L.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=L;ctx.fillRect(0,0,W/2,H);const Rg=ctx.createLinearGradient(W,0,W/2,0);Rg.addColorStop(0,p2Def.c+'55');Rg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=Rg;ctx.fillRect(W/2,0,W/2,H);ctx.restore();
 ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(0,0,W,H);
 const e=ease(sceneT/.4);
 bigFighter(p1Def,320-(1-e)*600,660,470,false,p1Def.c);bigFighter(p2Def,960+(1-e)*600,660,470,true,p2Def.c);
 txt(p1Def.name,320,700,40,p1Def.c,{stroke:'#000',sw:7});txt(p2Def.name,960,700,40,p2Def.c,{stroke:'#000',sw:7});
 drawLogo(W/2,92,330,18);txt('YOU',320,120,30,'#fff',{stroke:'#000',sw:5});txt(`STAGE · ${A.name}`,W/2,560,26,'#fff',{stroke:'#000',sw:5});txt(streak>0?`OPPONENT ${streak+1}`:'CPU',960,120,30,'#fff',{stroke:'#000',sw:5});
 ctx.save();ctx.translate(W/2,380);const s=1+Math.max(0,.6-sceneT)*2;ctx.scale(s,s);for(let i=8;i>0;i--)txt('VS',i,40+i,170,'#3a1205');txt('VS',0,40,170,'',{metal:'#FA691D',stroke:'#000',sw:16});ctx.restore()}

function plate(x,y,w,h,dir){// slanted metal plate
 ctx.beginPath();if(dir>0){ctx.moveTo(x,y);ctx.lineTo(x+w,y);ctx.lineTo(x+w-h*.5,y+h);ctx.lineTo(x,y+h)}else{ctx.moveTo(x,y);ctx.lineTo(x+w,y);ctx.lineTo(x+w,y+h);ctx.lineTo(x+h*.5,y+h)}ctx.closePath()}
function hpBar(f,dir){const w=460,h=30,y=30,x=dir>0?120:W-120-w;
 // frame
 ctx.save();plate(x-6,y-6,w+12,h+12,dir);const mg=ctx.createLinearGradient(0,y-6,0,y+h+6);mg.addColorStop(0,'#d9b56a');mg.addColorStop(.5,'#5d4419');mg.addColorStop(1,'#a37f3b');ctx.fillStyle=mg;ctx.fill();
 plate(x,y,w,h,dir);ctx.fillStyle='#260707';ctx.fill();ctx.clip();
 f.hpShown+=(f.hp-f.hpShown)*.05;const sw=w*f.hpShown/100,fw=w*f.hp/100;
 ctx.fillStyle='#ffdf8a';dir>0?ctx.fillRect(x,y,sw,h):ctx.fillRect(x+w-sw,y,sw,h);
 const gg=ctx.createLinearGradient(0,y,0,y+h);if(f.hp<25){gg.addColorStop(0,'#ff8a6a');gg.addColorStop(1,'#b3120a')}else{gg.addColorStop(0,'#b7ff8c');gg.addColorStop(.5,'#3fd84a');gg.addColorStop(1,'#137a24')}ctx.fillStyle=gg;dir>0?ctx.fillRect(x,y,fw,h):ctx.fillRect(x+w-fw,y,fw,h);
 ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(x,y+3,w,5);ctx.restore();
 // portrait medallion
 const px=dir>0?18:W-108;ctx.save();ctx.fillStyle=mg;ctx.beginPath();ctx.arc(px+45,y+38,50,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(px+45,y+38,43,0,TAU);ctx.clip();drawPortrait(f.def.n,px+2,y-5,86,86);ctx.restore();
 txt(f.def.name,dir>0?x:x+w,y+h+30,26,'#fff',{align:dir>0?'left':'right',stroke:'#000',sw:5});
 // special meter
 const mw=200,mx=dir>0?x+w-mw:x,my=y+h+14;ctx.fillStyle='#000';ctx.fillRect(mx-2,my-2,mw+4,12);const pr=1-f.spCd/2.4;ctx.fillStyle=pr>=1?f.def.c:'#4a4752';ctx.fillRect(mx,my,mw*pr,8);if(pr>=1){ctx.save();ctx.globalAlpha*=.5+.5*Math.sin(performance.now()/120);ctx.shadowColor=f.def.c;ctx.shadowBlur=12;ctx.fillRect(mx,my,mw,8);ctx.restore()}
}
function drawProjectile(p){if(p.draw){ctx.save();p.draw(p);ctx.restore();return}ctx.save();ctx.translate(p.x,p.y);ctx.globalCompositeOperation='lighter';ctx.shadowColor=p.c;ctx.shadowBlur=28;
 if(p.fx==='orb'){const r=28+Math.sin(p.t*30)*4;for(let i=6;i>=0;i--){const g=ctx.createRadialGradient(-Math.sign(p.vx)*i*24,0,1,-Math.sign(p.vx)*i*24,0,r*(1-i*.11));g.addColorStop(0,i?'rgba(255,255,255,.25)':'#fff');g.addColorStop(.4,p.c);g.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=i?.5/i:1;ctx.fillStyle=g;ctx.beginPath();ctx.arc(-Math.sign(p.vx)*i*24,0,r*(1-i*.11)*1.4,0,TAU);ctx.fill()}}
 else if(p.fx==='shard'){ctx.rotate(p.t*16);ctx.fillStyle=p.c;ctx.strokeStyle='#fff';ctx.lineWidth=3;for(let i=0;i<4;i++){ctx.rotate(TAU/4);ctx.beginPath();ctx.moveTo(0,-36);ctx.lineTo(10,0);ctx.lineTo(0,10);ctx.lineTo(-10,0);ctx.closePath();ctx.fill();ctx.stroke()}}
 else{const L=220,dir=Math.sign(p.vx);ctx.fillStyle=p.c;ctx.globalAlpha=.85;ctx.fillRect(dir>0?-L:0,-11,L,22);ctx.fillStyle='#fff';ctx.fillRect(dir>0?-L:0,-4,L,8);ctx.beginPath();ctx.arc(0,0,20,0,TAU);ctx.fill()}
 ctx.restore()}
function drawFight(t,dt){
 drawArena(t,[P1,P2]);
 camApply(1);
 drawDim();drawSplats();drawFloorLights();
 const order=[P1,P2].sort((a,b)=>(a.st==='ko'||a.st==='dizzy')-(b.st==='ko'||b.st==='dizzy')||((MOVES[a.st]?1:0)-(MOVES[b.st]?1:0)));for(const f of order)drawFighter(f,t);
 drawAura();
 for(const x of fxs){ctx.save();x.fn(x.t/x.life,x.t);ctx.restore()}
 drawTrails();for(const p of projectiles)drawProjectile(p);
 ctx.save();ctx.globalCompositeOperation='lighter';
 for(const s of sparks){const k=s.t/s.life;if(s.ring){ctx.strokeStyle=s.c;ctx.globalAlpha=1-k;ctx.lineWidth=8*(1-k)+1;ctx.beginPath();ctx.arc(s.x,s.y,s.r*ease(k),0,TAU);ctx.stroke()}else{ctx.globalAlpha=1-k;ctx.fillStyle=s.c;ctx.beginPath();ctx.arc(s.x,s.y,s.s*(1-k*.5),0,TAU);ctx.fill()}}
 for(const b of bolts){ctx.globalAlpha=1-b.t/.25;ctx.strokeStyle='#fff';ctx.lineWidth=5;ctx.shadowColor=b.c;ctx.shadowBlur=30;ctx.beginPath();b.pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.strokeStyle=b.c;ctx.lineWidth=12;ctx.globalAlpha*=.4;ctx.stroke()}
 ctx.restore();
 drawSkels();drawBurst3D();drawGore();drawPops();
 drawCallouts();
 for(const f of floaters){const x=f.anchor?f.anchor.x:f.x,y=f.anchor?f.anchor.y-FH-40:f.y;ctx.globalAlpha=Math.max(0,1-f.t);txt(f.s,x,y-f.t*50,f.small?28:36,f.c,{stroke:'#000',sw:6});ctx.globalAlpha=1}
 drawAtmos(t,dt*timeScale);
 if(flashScreen>0){camReset();ctx.fillStyle=`rgba(255,255,255,${Math.min(.4,flashScreen*1.2)*(1-.65*cine.k)})`;ctx.fillRect(0,0,W,H)}
 if(slowT>0){ctx.fillStyle=`rgba(80,0,0,${.18*Math.min(1,slowT)})`;ctx.fillRect(0,0,W,H)}
 drawCineOverlay(t);
 // HUD
 ctx.save();ctx.globalAlpha=Math.max(0,1-cine.bars*1.6);
 hpBar(P1,1);hpBar(P2,-1);
 ctx.save();ctx.beginPath();for(let i=0;i<6;i++){const a=i*TAU/6+TAU/12;ctx.lineTo(W/2+Math.cos(a)*56,62+Math.sin(a)*56)}ctx.closePath();const mg=ctx.createLinearGradient(0,6,0,118);mg.addColorStop(0,'#d9b56a');mg.addColorStop(.5,'#5d4419');mg.addColorStop(1,'#a37f3b');ctx.fillStyle=mg;ctx.fill();ctx.restore();
 ctx.save();ctx.beginPath();for(let i=0;i<6;i++){const a=i*TAU/6+TAU/12;ctx.lineTo(W/2+Math.cos(a)*48,62+Math.sin(a)*48)}ctx.closePath();ctx.fillStyle='#0b0a0e';ctx.fill();ctx.restore();
 txt(String(Math.ceil(timer)),W/2,86,62,timer<10?'#FF3B2E':'#fff');
 for(let i=0;i<2;i++){for(const [side,won] of [[-1,i<wins[0]],[1,i<wins[1]]]){const cx=W/2+side*(78+i*28),cy=104;ctx.fillStyle=won?'#FA691D':'#2a2830';ctx.strokeStyle='#d9b56a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,10,0,TAU);ctx.fill();ctx.stroke();if(won)txt('🐾',cx,cy+5,11,'#000')}}
 if(streak>0)txt(`STREAK ${streak}`,W/2,140,20,'#FA691D',{stroke:'#000',sw:4});
 ctx.restore();
 if(banner&&banner.s){const k=ease(banner.t/.2);ctx.save();ctx.translate(W/2,320);const s=(.3+.7*k)*(1+Math.sin(banner.t*8)*.01);ctx.scale(s,s);const size=banner.s.length>12?90:140;
  for(let i=8;i>0;i--)txt(banner.s,i,40+i,size,'rgba(0,0,0,.7)');txt(banner.s,0,40,size,'',{metal:banner.c||'#d8d4e0',stroke:'#000',sw:size*.12,glow:banner.c});
  if(banner.sub&&Math.floor(banner.t*3)%2===0)txt(banner.sub,0,110,30,'#fff',{stroke:'#000',sw:5});ctx.restore()}
}
function resultButtons(){const won=lastResult&&lastResult.won;return[
 {x:W/2-310,y:520,w:300,h:70,label:won?'NEXT FIGHT':'REMATCH',fn:()=>{SFX.select();go(won?'roll':'vs')}},
 {x:W/2+10,y:520,w:300,h:70,label:'NEW FIGHTER',fn:()=>{SFX.select();go('select')}},
 {x:W/2-150,y:610,w:300,h:56,label:'SHARE ON X',fn:share}]}
function share(){const r=lastResult;const text=r.won?`I beat ${r.them.name} with ${r.me.name} in MEOWRTAL KOMBAT. Win streak: ${r.streak} 🥷🐈 $MEOWNERO`:`${r.them.name} just sent my ${r.me.name} to the shadow realm in MEOWRTAL KOMBAT. Rematch incoming. $MEOWNERO`;
 window.open('https://x.com/intent/post?text='+encodeURIComponent(text)+'&url='+encodeURIComponent('https://meownero.sh/kombat/'),'_blank','noopener')}
function drawResult(t,dt){cam.x=WW/2;cam.z=1.05;drawArena(t);drawAtmos(t,dt);camReset();ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(0,0,W,H);const r=lastResult;
 bigFighter(r.won?r.me:r.them,W/2,490+(r.won?-Math.abs(Math.sin(t*5))*10:0),380,false,(r.won?r.me:r.them).c);
 drawLogo(W/2,60,230,14);txt(r.won?'MEOWTORY':'DEFEAT',W/2,165,110,'',{metal:r.won?'#FA691D':'#FF3B2E',stroke:'#000',sw:14});
 txt(r.won?`${defeated.size}/${ENEMIES.length} ENEMIES DEFEATED   ·   STREAK ${r.streak}`:`${r.them.name} WINS   ·   BEST STREAK ${best}`,W/2,200,28,'#fff',{stroke:'#000',sw:5});
 for(const b of resultButtons()){const hov=hover&&hover.x>b.x&&hover.x<b.x+b.w&&hover.y>b.y&&hover.y<b.y+b.h;const x=b.label==='SHARE ON X';ctx.fillStyle=x?'#000':hov?'#ffb37f':'#FA691D';rr(b.x,b.y,b.w,b.h,12);ctx.fill();ctx.strokeStyle=x?'#fff':'#000';ctx.lineWidth=x?2:4;ctx.stroke();txt(b.label,b.x+b.w/2,b.y+b.h/2+14,b.h>60?40:30,x?'#fff':'#17161A')}}

// ================= loop =================
let last=performance.now();
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;const t=now/1000;
 update(dt);camReset();ctx.clearRect(0,0,W,H);
 if(scene==='title')drawTitle(t,dt);else if(scene==='select')drawSelect(t,dt);else if(scene==='vs')drawVS(t,dt);else if(scene==='roll')drawRoll(t,dt);else if(scene==='fight')drawFight(t,dt);else drawResult(t,dt);
 camReset();if(!['result','select','title','vs'].includes(scene))click=null;
 requestAnimationFrame(frame)}
requestAnimationFrame(frame);
window.__mk={get P1(){return P1},get scene(){return scene},get finish(){return finish},bdemo(n,dist){p1Def=PLAYABLE.find(d=>d.n===n);p2Def=pickRandom(p1Def);warmMaps(p2Def);startRound();banner=null;P1.x=WW/2-dist/2;P2.x=WW/2+dist/2;__mk.noAI=true},spdemo(n,dist){p1Def=PLAYABLE.find(d=>d.n===n);p2Def=pickRandom(p1Def);warmMaps(p2Def);startRound();banner=null;P1.x=WW/2-dist/2;P2.x=WW/2+dist/2;P1.spCd=0;__mk.noAI=true;setTimeout(()=>{P1.spCd=0;doSpecial(P1)},300)},get P2(){return P2},setDef(a){defeated=new Set(a)},snd(){return [Object.keys(SND.buf).length,SND.active,!!AC&&AC.state]},goRoll(){go('roll')},dbg(){return [hitStop,timeScale,slowT,scene,roundOver]},IMG,lightMaps,demo(n){p1Def=PLAYABLE.find(d=>d.n===n);p2Def=pickRandom(p1Def);warmMaps(p2Def);startRound();banner=null;wins=[1,0];P2.hp=0;endRound(P1,'ko');slowT=0;timeScale=1;triggerCatality()}};
})();
