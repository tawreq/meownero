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
const V='10';
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
 null,
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
 {n:28,name:'GEARHEAD',c:'#3FE3E0',sp:{t:'p',name:'STEAM CANNON',fx:'orb'},spd:.96,pow:1.08},
];
const PLAYABLE=R.filter(Boolean);
const pad=n=>String(n).padStart(2,'0');

// ================= assets =================
const IMG={body:{},por:{},px:{},punch:{}};
const PANCH={1:.442,2:.418,3:.431,4:.419,5:.448,6:.42,8:.41,9:.45,10:.43,11:.436,12:.449,13:.412,14:.453,15:.437,16:.44,17:.43,18:.431,19:.455,20:.426,21:.456,22:.449,23:.441,24:.44,25:.44,26:.427,27:.428,28:.459};
function load(src,tries=0){return new Promise(res=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>{if(tries<6)setTimeout(()=>load(src,tries+1).then(res),800*(tries+1));else res(null)};i.src=src+'?v='+V+(tries?'&r='+tries:'')})}
let loaded=0;const total=PLAYABLE.length*2;
load('/kombat/logo.webp').then(i=>{IMG.logo=i});
function drawLogo(cx,cy,w,glow){const L=IMG.logo;if(!L)return false;const h=w*L.height/L.width;ctx.save();if(glow){ctx.shadowColor='rgba(255,110,30,.55)';ctx.shadowBlur=glow}ctx.drawImage(L,cx-w/2,cy-h/2,w,h);ctx.restore();return true}
PLAYABLE.forEach(f=>{
 load(`/kombat/f/${pad(f.n)}.webp`).then(i=>{IMG.body[f.n]=i;loaded++});
 load(`/kombat/p/${pad(f.n)}.webp`).then(i=>{IMG.por[f.n]=i;loaded++});
 if(PANCH[f.n])load(`/kombat/f/${pad(f.n)}-punch.webp`).then(i=>{if(i)IMG.punch[f.n]=i});
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
syncMute();muteBtn.addEventListener('click',()=>{muted=!muted;store.set('muted',muted);syncMute();muteBtn.blur()});
function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();return AC}
function noise(dur,freq,vol,type='lowpass'){const a=ac();if(!a||muted)return;const n=a.createBufferSource(),b=a.createBuffer(1,Math.floor(a.sampleRate*dur),a.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2);n.buffer=b;const f=a.createBiquadFilter();f.type=type;f.frequency.value=freq;const g=a.createGain();g.gain.value=vol;n.connect(f).connect(g).connect(a.destination);n.start()}
function tone(f0,f1,dur,type,vol){const a=ac();if(!a||muted)return;const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f0,a.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),a.currentTime+dur);g.gain.setValueAtTime(vol,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+dur);o.connect(g).connect(a.destination);o.start();o.stop(a.currentTime+dur)}
const SFX={
 whoosh:()=>noise(.14,2200,.16,'bandpass'),
 heavyWhoosh:()=>noise(.22,1200,.22,'bandpass'),
 hit:()=>{noise(.18,800,.55);tone(170,55,.16,'square',.13)},
 heavy:()=>{noise(.3,500,.7);tone(120,35,.3,'sawtooth',.16)},
 block:()=>{tone(1100,600,.07,'square',.08);noise(.05,4000,.14,'highpass')},
 special:()=>{tone(200,900,.32,'sawtooth',.09);noise(.25,3000,.08,'highpass')},
 ko:()=>{tone(300,40,1.1,'sawtooth',.2);noise(.8,350,.5)},
 thunder:()=>{noise(.9,600,.7);tone(90,30,.8,'sawtooth',.15)},
 select:()=>tone(660,990,.08,'square',.07),
 move:()=>tone(440,440,.03,'square',.04),
 bell:()=>{tone(880,860,.7,'triangle',.15);tone(1320,1300,.6,'sine',.06)},
 land:()=>noise(.1,300,.25),
};

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
 const z=1+(cam.z-1)*par, x=WW/2+(cam.x-WW/2)*par;
 const sx=(Math.random()-.5)*cam.shake*60,sy=(Math.random()-.5)*cam.shake*40;
 ctx.setTransform(z,0,0,z,W/2-x*z+sx,GY-GY*z+sy+cam.kick*8)}
function camReset(){ctx.setTransform(1,0,0,1,0,0)}
function updateCam(dt,a,b,focus){
 if(focus){cam.tx=focus.x;cam.tz=1.35}else if(a&&b){const d=Math.abs(a.x-b.x);cam.tz=clamp(1300/(d+900),.92,1.12);cam.tx=(a.x+b.x)/2}else{cam.tx=WW/2;cam.tz=1}
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
function warmMaps(def){lightMaps(IMG.body[def.n]);lightMaps(IMG.punch[def.n])}
function litSprite(f,w,h,refl,img){img=img||IMG.body[f.def.n];const s=Math.min(2,cam.z*1.15);const cw=Math.ceil(w*s),ch=Math.ceil(h*s);if(tc.width<cw||tc.height<ch){tc.width=Math.max(tc.width,cw);tc.height=Math.max(tc.height,ch)}
 tg.setTransform(1,0,0,1,0,0);tg.clearRect(0,0,cw+2,ch+2);tg.globalCompositeOperation='source-over';tg.imageSmoothingQuality='high';tg.drawImage(img,0,0,cw,ch);
 tg.globalCompositeOperation='source-atop';
 if(!refl){// key light from the near brazier + floor bounce + dark feet
  const near=f.x<WW/2?-1:1;const m=lightMaps(img);
  if(m){// world side of the key light -> sprite side (sprites are flipped when facing left)
   const keyLeft=(near<0)===(f.facing>0);
   tg.drawImage(m.shade,0,0,cw,ch);
   tg.globalCompositeOperation='lighter';
   tg.globalAlpha=1;tg.drawImage(tinted(keyLeft?m.rimL:m.rimR,cw,ch,`rgb(${A.light})`),0,0,cw,ch,0,0,cw,ch);
   tg.globalAlpha=.5;tg.drawImage(tinted(keyLeft?m.rimR:m.rimL,cw,ch,'rgb(130,165,255)'),0,0,cw,ch,0,0,cw,ch);
   tg.globalAlpha=.7;tg.drawImage(m.spec,0,0,cw,ch);tg.globalAlpha=1;tg.globalCompositeOperation='source-atop'}
  const g=tg.createLinearGradient(near>0?cw:0,0,near>0?0:cw,0);g.addColorStop(0,`rgba(${A.light},.18)`);g.addColorStop(.45,`rgba(${A.light},0)`);tg.fillStyle=g;tg.fillRect(0,0,cw,ch);
  const v=tg.createLinearGradient(0,0,0,ch);v.addColorStop(0,'rgba(170,190,255,.08)');v.addColorStop(.6,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.38)');tg.fillStyle=v;tg.fillRect(0,0,cw,ch);
  if(f.flash>0){tg.fillStyle=`rgba(255,255,255,${Math.min(1,f.flash*5)})`;tg.fillRect(0,0,cw,ch)}
  if(f.st==='special'||f.st==='dash'||f.st==='win'){tg.fillStyle=f.def.c;tg.globalAlpha=.18+.1*Math.sin(f.t*30);tg.fillRect(0,0,cw,ch);tg.globalAlpha=1}
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
 case 'dash':p.sx=1.16;p.sy=.9;p.top=46;p.leg=-30;break;
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

function punchFrame(f){if(!IMG.punch[f.def.n])return false;const m=MOVES.punch;return (f.st==='punch'&&f.t>=m.hitAt-.045&&f.t<m.dur-.04)||(f.st==='special'&&f.t>=.12&&f.t<.38)}
function drawFighter(f,t,refl=false){
 const body=IMG.body[f.def.n];if(!body||f.gone)return;const PF=punchFrame(f);const img=PF?IMG.punch[f.def.n]:body;
 const h=PF?FH*.9:FH,w=h*img.width/img.height;const p=PF?punchPose(f):pose(f,t);const shiftX=PF?(.5-PANCH[f.def.n])*w:0;
 if(!refl){// floor shadow
  const air=Math.max(0,GY-f.y);const lm=lightMaps(img);
  if(lm&&air<200){ctx.save();ctx.globalAlpha=.32*(1-air/200);try{ctx.filter='blur(5px)'}catch(e){}ctx.translate(f.x,GY+4);const sk=f.x<WW/2?-.85:.85;ctx.transform(1,0,sk,.26,0,0);ctx.scale(f.facing,1);ctx.drawImage(lm.sil,-w/2+(PF?(.5-PANCH[f.def.n])*w:0),-h,w,h);ctx.restore();ctx.filter='none'}
  ctx.save();ctx.fillStyle='rgba(0,0,0,.55)';ctx.beginPath();ctx.ellipse(f.x,GY+6,w*.36*(1-air/700),14*(1-air/700),0,0,TAU);ctx.fill();ctx.restore();
  // afterimages
  for(const tr of f.trail){ctx.save();ctx.globalAlpha=tr.a*.35;ctx.translate(tr.x,tr.y);ctx.scale(f.facing,1);ctx.drawImage(img,-w/2,-h,w,h);ctx.restore()}
 }
 const {cw,ch}=litSprite(f,w,h,refl,img);
 ctx.save();
 const sh=f.shake?Math.sin(f.shake*90)*6:0;
 if(refl){ctx.globalAlpha=A.refl;ctx.translate(f.x+p.ox*f.facing,GY+(GY-f.y)+4);ctx.scale(f.facing,-.55)}
 else{ctx.translate(f.x+p.ox*f.facing+sh,f.y+p.oy)}
 if(p.pivot==='center'){ctx.translate(0,-h/2);ctx.rotate(p.spin*f.facing);ctx.translate(0,h/2)}else ctx.rotate(p.rot*f.facing);
 if(!refl)ctx.scale(f.facing*p.sx,p.sy);else ctx.scale(p.sx,p.sy);
 if(shiftX)ctx.translate(shiftX,0);
 drawWarp(cw,ch,w,h,p,refl||f.st==='ko'?null:{c:hexA(f.def.c,.8),b:(f.st==='special'||f.st==='dash'||f.st==='win'?46:22+Math.sin(t*6+f.x)*5)*cam.z});
 ctx.restore();
 if(refl)return;
 // attack trails
 const arc=(m,yy,col,width)=>{const k=(f.t-m.hitAt)/.14;if(k<0||k>1)return;ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(1-k)*.9;ctx.strokeStyle=col;ctx.lineWidth=width*(1-k)+3;ctx.lineCap='round';ctx.shadowColor=col;ctx.shadowBlur=18;ctx.beginPath();const cx=f.x+f.facing*(w*.2+m.reach*.38);const r=(70+k*40)*SC;ctx.arc(cx,f.y-h*yy,r,f.facing>0?-1.1:Math.PI-1.1+0,f.facing>0?1.1:Math.PI+1.1);ctx.stroke();
  // speed lines
  ctx.lineWidth=2;for(let i=0;i<5;i++){const yy2=f.y-h*yy+(i-2)*14;ctx.beginPath();ctx.moveTo(f.x+f.facing*(w*.1),yy2);ctx.lineTo(f.x+f.facing*(w*.1+m.reach*(.55+.1*i%2)),yy2);ctx.stroke()}ctx.restore()};
 if(f.st==='punch'&&!PF)arc(MOVES.punch,.6,'#ffffff',12);
 if(PF&&f.st==='punch'){const k=(f.t-MOVES.punch.hitAt)/.12;if(k>=0&&k<1){const fx=f.x+f.facing*(w*(1-PANCH[f.def.n])+p.ox-10*SC),fy=f.y-h*.8;ctx.save();ctx.globalCompositeOperation='lighter';const r=(30+k*70)*SC,g=ctx.createRadialGradient(fx,fy,0,fx,fy,r);g.addColorStop(0,`rgba(255,255,255,${1-k})`);g.addColorStop(.4,hexA(f.def.c,.7*(1-k)));g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(fx-r,fy-r,r*2,r*2);ctx.restore()}}if(f.st==='kick')arc(MOVES.kick,.28,f.def.c,16);if(f.st==='upper')arc(MOVES.upper,.7,'#ffd27a',14);
 if(f.st==='block'){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=f.def.c;ctx.globalAlpha=.6+.2*Math.sin(t*20);ctx.lineWidth=7;ctx.shadowColor=f.def.c;ctx.shadowBlur=22;ctx.beginPath();const cx=f.x+f.facing*w*.18;ctx.arc(cx,f.y-h*.5,h*.46,f.facing>0?-1.05:Math.PI-1.05,f.facing>0?1.05:Math.PI+1.05);ctx.stroke();ctx.restore()}
 if(f.st==='special'&&f.t<.16){ctx.save();ctx.globalCompositeOperation='lighter';const r=40+f.t*500,g=ctx.createRadialGradient(f.x+f.facing*60,f.y-h*.55,2,f.x+f.facing*60,f.y-h*.55,r);g.addColorStop(0,'#fff');g.addColorStop(.3,f.def.c);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(f.x-r*2,f.y-h-r,r*4,h+r*2);ctx.restore()}
 if(f.st==='dizzy'){for(let i=0;i<3;i++){const a=t*4+i*TAU/3;txt('★',f.x+Math.cos(a)*50,f.y-h-10+Math.sin(a)*12,26,'#FFE14D',{stroke:'#000',sw:4})}}
}


// ================= elements =================
function hexA(h,a){const n=parseInt(h.slice(1),16);return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`}
const EL={};for(const [e,ns] of Object.entries({fire:[2,14,18,26],bolt:[8,13,27],frost:[3,23],toxic:[10,21],arcane:[5,9,17,20,25],nature:[6,16,24],water:[15],ki:[1,4,11,12,19,22,28]}))for(const n of ns)EL[n]=e;
let aura=[];
function emitAura(f,dt){if(f.gone||f.st==='ko')return;const w=bodyW(f),h=FH,e=EL[f.def.n]||'ki';const hot=f.st==='special'||f.st==='dash'||f.st==='win'||f.st==='upper';let rate=(hot?70:16)*dt;
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
 if(blocking){def.hp=Math.max(0,def.hp-dmg*.12);def.vx=kb*.4*att.facing;SFX.block();spark(def.x+def.facing*70,hy,'#bfe6ff',12,.8);ring(def.x+def.facing*70,hy,'#bfe6ff');hitStop=.045;return 'block'}
 def.hp=Math.max(0,def.hp-dmg);def.vx=kb*SC*att.facing;def.flash=.16;def.shake=.18;setSt(def,'hit');
 if(o.launch||def.y<GY-1){def.vy=-820;def.vx=kb*SC*.8*att.facing}
 if(att.comboT>0)att.combo++;else att.combo=1;att.comboT=.9;
 const heavy=o.heavy||dmg>=11;
 hitStop=heavy?.11:.065;if(heavy)erupt(def.x,GY,att);cam.shake=Math.min(.5,cam.shake+(heavy?.28:.15));cam.kick=heavy?1:.5;if(heavy)flashScreen=.12;
 heavy?SFX.heavy():SFX.hit();
 spark(def.x-att.facing*20,hy,att.def.c,heavy?28:16);spark(def.x-att.facing*20,hy,'#fff',8);ring(def.x-att.facing*10,hy,att.def.c,heavy);
 if(att.combo>=2)floaters.push({x:att.x,y:att.y-FH-40,s:`${att.combo} HIT COMBO`,t:0,c:'#FFE14D',small:true,anchor:att});
 return 'hit'}

function doSpecial(f){if(f.spCd>0||busy(f)||f.y<GY-1)return false;f.spCd=2.4;SFX.special();erupt(f.x,GY,f);
 floaters.push({x:f.x,y:f.y-FH-30,s:f.def.sp.name,t:0,c:f.def.c,small:true});
 if(f.def.sp.t==='p'){setSt(f,'special');setTimeout(()=>{if(f.st==='special')projectiles.push({x:f.x+f.facing*110*SC,y:f.y-FH*.56,vx:820*SC*f.facing,owner:f,fx:f.def.sp.fx,c:f.def.c,t:0,dmg:12*f.def.pow})},120)}
 else{setSt(f,'dash');f.dashHit=false}
 return true}

function updFighter(f,o,dt,c){
 f.t+=dt;f.spCd=Math.max(0,f.spCd-dt);f.flash=Math.max(0,f.flash-dt);f.shake=Math.max(0,f.shake-dt);f.comboT=Math.max(0,f.comboT-dt);
 if(!busy(f)&&f.y>=GY-1)f.facing=o.x>f.x?1:-1;
 // trails for fast moves
 if(f.st==='dash'||(f.st==='jump'&&Math.abs(f.vx)>40)||f.st==='upper'){f.trail.push({x:f.x,y:f.y,a:1})}for(const tr of f.trail)tr.a-=dt*5;f.trail=f.trail.filter(tr=>tr.a>0).slice(-5);
 const sp=275*SC*f.def.spd;
 if(f.st==='ko'||f.st==='win'||f.st==='dizzy'){f.vx*=.9}
 else if(f.st==='hit'){f.vx*=.88;if(f.t>.32&&f.y>=GY-1)setSt(f,'idle')}
 else if(MOVES[f.st]){const m=MOVES[f.st];f.vx*=.7;if(!f.hitDone&&f.t>=m.hitAt){f.hitDone=true;m.heavy?SFX.heavyWhoosh():SFX.whoosh();const dx=(o.x-f.x)*f.facing,dy=Math.abs(o.y-f.y);if(dx>0&&dx<m.reach&&dy<160*SC)damage(o,f,m.dmg*f.def.pow,m.kb,m)}if(f.t>=m.dur)setSt(f,'idle')}
 else if(f.st==='special'){f.vx=0;if(f.t>.42)setSt(f,'idle')}
 else if(f.st==='dash'){f.vx=820*SC*f.facing;if(!f.dashHit){const dx=(o.x-f.x)*f.facing;if(dx>0&&dx<210*SC&&Math.abs(o.y-f.y)<150*SC){f.dashHit=true;damage(o,f,13*f.def.pow,460,{heavy:true});f.vx=-140*f.facing;setSt(f,'idle')}}if(f.st==='dash'&&f.t>.38){f.vx=0;setSt(f,'idle')}}
 else{const air=f.y<GY-1;
  if(c.special&&doSpecial(f)){}
  else if(c.punch&&c.down&&!air){setSt(f,'upper')}
  else if(c.punch){setSt(f,'punch')}
  else if(c.kick&&!air){setSt(f,'kick')}
  else if(c.kick&&air){setSt(f,'kick')}
  else if(c.down&&!air){if(f.st!=='block')setSt(f,'block');f.vx=0}
  else if(c.up&&!air){f.vy=-1180;setSt(f,'jump');f.spin=0;f.vx=(c.right?sp:c.left?-sp:0)*1.15}
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
 if(dist>300){if(f.spCd===0&&Math.random()<.12+.2*d){c.special=true;return c}a.act={[toward]:true};a.until=.2+Math.random()*.25;return c}
 if(dist<200){const r=Math.random();if(r<.35+.35*d){const q=Math.random();if(q<.15){c.punch=true;c.down=true}else c[q<.6?'punch':'kick']=true}else if(r<.75){a.act={[away]:true};a.until=.15}else if(r<.82){c.up=true;c[toward]=true}else if(f.spCd===0&&f.def.sp.t==='d'){c.special=true}return c}
 a.act={[toward]:true};a.until=.15+Math.random()*.2;return c}

// ================= flow =================
let scene='title',sceneT=0,cursor=0,p1Def=null,p2Def=null,round=1,wins=[0,0],timer=60,banner=null,streak=0,best=store.get('best',0),roundOver=false,lastResult=null,finish=null;
const GRID={x0:182,y0:150,tw:130,th:118,gap:6};
function gridRect(i){const c=i%7,r=Math.floor(i/7);return{x:GRID.x0+c*(GRID.tw+GRID.gap),y:GRID.y0+r*(GRID.th+GRID.gap),w:GRID.tw,h:GRID.th}}
function pickRandom(ex){const pool=PLAYABLE.filter(f=>f!==ex);return pool[Math.floor(Math.random()*pool.length)]}
function go(s){if(s==='vs')nextArena();scene=s;sceneT=0}
function startMatch(){round=1;wins=[0,0];startRound()}
function nextArena(){setArena(arenaIdx+1)}
function startRound(){warmMaps(p1Def);warmMaps(p2Def);P1=mk(p1Def,WW/2-300*SC,1,false);P2=mk(p2Def,WW/2+300*SC,-1,true);projectiles=[];sparks=[];floaters=[];bolts=[];burst=[];aura=[];timer=60;roundOver=false;finish=null;timeScale=1;slowT=0;cam.x=WW/2;cam.z=1.6;
 banner={s:`ROUND ${round}`,t:0,dur:1.3,next:{s:'FIGHT!',dur:.8,c:'#FA691D'}};SFX.bell();go('fight')}
function endRound(winner,how){if(roundOver)return;roundOver=true;const loser=winner===P1?P2:P1;
 wins[winner===P1?0:1]++;const matchOver=wins[0]===2||wins[1]===2;
 if(how==='ko'){SFX.ko();slowT=1.1;timeScale=.28;flashScreen=.25}
 const flawless=winner.hp>=100;
 if(matchOver&&how==='ko'){// finisher window
  setSt(loser,'dizzy');loser.vx=0;loser.vy=0;loser.y=GY;setSt(winner,'idle');
  banner={s:'K.O.',t:0,dur:1.2,c:'#FF3B2E',next:{s:'FINISH MEOW!',dur:3.2,c:'#FF3B2E',sub:winner===P1?'PRESS SPECIAL (L)':''},after:()=>finishMatch(winner,flawless,false)};
  finish={winner,loser,armed:true,cpuAt:winner===P2?1.6:99,t:0};return}
 if(how==='ko')setSt(loser,'ko');setSt(winner,'win');
 banner={s:how==='time'?'TIME!':'K.O.',t:0,dur:1.3,c:'#FF3B2E',next:{s:flawless?'FLAWLESS MEOWTORY':`${winner.def.name} WINS`,dur:1.8,c:winner.def.c},after:()=>{if(matchOver)finishMatch(winner,flawless,true);else{round++;startRound()}}}}
function finishMatch(winner,flawless,already){const won=winner===P1;if(won){streak++;level++;if(streak>best){best=streak;store.set('best',best)}}else{level=Math.max(0,level-1)}
 lastResult={won,me:p1Def,them:p2Def,streak:won?streak:0};if(!won)streak=0;go('result')}
function triggerCatality(){if(!finish||!finish.armed)return;finish.armed=false;finish.run=0;const {winner,loser}=finish;setSt(winner,'win');SFX.special();
 banner={s:'',t:0,dur:2.6,after:()=>{banner={s:'CATALITY',t:0,dur:2,c:winner.def.c,after:()=>finishMatch(winner,false,true)}}}}
function runCatality(dt){const f=finish;if(!f||f.run==null)return;f.run+=dt;const L=f.loser;
 if(f.run<1.4){if(Math.random()<dt*9){bolts.push(mkBolt(L.x+(Math.random()-.5)*80,L.y-FH*.5,f.winner.def.c));SFX.thunder();cam.shake=.4;flashScreen=.15;L.flash=.2}}
 else if(!L.gone){L.gone=true;SFX.ko();cam.shake=.6;flashScreen=.4;const px=pixelsOf(L.def.n),w=bodyW(L);for(const p of px){if(Math.random()<.55)continue;burst.push({x:L.x+(p.u-.5)*w*L.facing,y:L.y-FH+p.v*FH,vx:(Math.random()-.5)*900+(p.u-.5)*400,vy:-Math.random()*900,c:p.c,t:0,s:4+Math.random()*4})}}
}
function mkBolt(x,y,c){const pts=[];let px=x+(Math.random()-.5)*200,py=-200;while(py<y){pts.push([px,py]);py+=40+Math.random()*50;px+=(Math.random()-.5)*70}pts.push([x,y]);return{pts,c,t:0}}

function update(rdt){sceneT+=rdt;
 if(scene==='title'){if(take('start')||take('punch')||click){click=null;SFX.select();go('select')}return}
 if(scene==='select'){const mv=d=>{cursor=(cursor+d+28)%28;SFX.move()};
  if(take('left'))mv(-1);if(take('right'))mv(1);if(take('up'))mv(-7);if(take('down'))mv(7);
  if(hover){for(let i=0;i<28;i++){const r=gridRect(i);if(hover.x>r.x&&hover.x<r.x+r.w&&hover.y>r.y&&hover.y<r.y+r.h)cursor=i}}
  let chosen=take('start')||take('punch');
  if(click){for(let i=0;i<28;i++){const r=gridRect(i);if(click.x>r.x&&click.x<r.x+r.w&&click.y>r.y&&click.y<r.y+r.h){cursor=i;chosen=true}}click=null}
  if(chosen){p1Def=R[cursor]||pickRandom(null);p2Def=pickRandom(p1Def);streak=0;level=0;SFX.select();go('vs')}return}
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
  for(const p of projectiles){p.t+=dt;p.x+=p.vx*dt;const o=p.owner===P1?P2:P1;if(!p.dead&&Math.abs(p.x-o.x)<95*SC&&Math.abs(p.y-(o.y-FH*.55))<130*SC){p.dead=true;damage(o,p.owner,p.dmg,320,{heavy:true})}if(p.x<-100||p.x>WW+100)p.dead=true}
  for(let i=0;i<projectiles.length;i++)for(let j=i+1;j<projectiles.length;j++){const a=projectiles[i],b=projectiles[j];if(a.owner!==b.owner&&Math.abs(a.x-b.x)<45){a.dead=b.dead=true;spark((a.x+b.x)/2,a.y,'#fff',24);ring((a.x+b.x)/2,a.y,'#fff',true);SFX.block()}}
  projectiles=projectiles.filter(p=>!p.dead);
 }
 for(const s of sparks){s.t+=dt;if(!s.ring){s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=1000*dt}}sparks=sparks.filter(s=>s.t<s.life);
 for(const b of burst){b.t+=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.vy+=1400*dt;if(b.y>GY){b.y=GY;b.vy*=-.3;b.vx*=.6}}
 if(!roundOver||finish){emitAura(P1,dt);emitAura(P2,dt)}updAura(dt);
 for(const b of bolts)b.t+=rdt;bolts=bolts.filter(b=>b.t<.25);
 for(const f of floaters)f.t+=rdt;floaters=floaters.filter(f=>f.t<1.1);
 runCatality(rdt);
 flashScreen=Math.max(0,flashScreen-rdt);
 updateCam(rdt,P1,P2,slowT>0?(P1.hp<=0||P1.st==='dizzy'?P1:P2):finish&&finish.run!=null?finish.loser:null);
 if(live){timer-=dt;if(P1.hp<=0)endRound(P2,'ko');else if(P2.hp<=0)endRound(P1,'ko');else if(timer<=0){timer=0;endRound(P1.hp>=P2.hp?P1:P2,'time')}}
}

// ================= scene drawing =================
function drawPortrait(n,x,y,w,h){const img=IMG.por[n];if(!img){ctx.fillStyle='#222';ctx.fillRect(x,y,w,h);return}const s=Math.max(w/img.width,h/img.height),iw=img.width*s,ih=img.height*s;ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.drawImage(img,x+(w-iw)/2,y+(h-ih)/2*.3,iw,ih);ctx.restore()}
function bigFighter(def,x,y,h,flip,glow){const img=IMG.body[def.n];if(!img)return;const w=img.width*h/img.height;ctx.save();if(glow){ctx.shadowColor=glow;ctx.shadowBlur=40}ctx.translate(x,y);ctx.scale(flip?-1:1,1);ctx.drawImage(img,-w/2,-h,w,h);ctx.restore()}
function title3D(a,b,y,s){ctx.save();ctx.translate(W/2,y);ctx.rotate(-.03);ctx.scale(s,s);for(let i=10;i>0;i--)txt(a,i*.8,-40+i*.8,150,'#3a1205');txt(a,0,-40,150,'',{metal:'#FA691D',stroke:'#000',sw:14});for(let i=10;i>0;i--)txt(b,i*.8,100+i*.8,150,'#24212b');txt(b,0,100,150,'',{metal:'#c9c4d4',stroke:'#000',sw:14});ctx.restore()}
function drawTitle(t,dt){cam.x=WW/2+Math.sin(t*.2)*200;cam.z=1.05;drawArena(t);drawAtmos(t,dt);camReset();
 ctx.fillStyle='rgba(8,7,12,.45)';ctx.fillRect(0,0,W,H);{const sc=1+Math.sin(t*2.2)*.012;if(!drawLogo(W/2,250,860*sc,30+Math.sin(t*3)*12))title3D('MEOWRTAL','KOMBAT',300,sc)}
 txt('ミャウネロ格闘',W/2,505,28,'#FA691D',{family:DELA,glow:'#FA691D'});
 const n=PLAYABLE.length;for(let i=0;i<9;i++){const f=PLAYABLE[(Math.floor(t*.6)+i)%n];bigFighter(f,130+i*128,640,165,i>=5)}
 if(Math.floor(t*2)%2===0)txt(matchMedia('(pointer:coarse)').matches?'TAP TO START':'PRESS ENTER',W/2,700,32,'#fff',{stroke:'#000',sw:6});
 if(loaded<total){ctx.fillStyle='#000';ctx.fillRect(W/2-150,470,300,8);ctx.fillStyle='#FA691D';ctx.fillRect(W/2-150,470,300*loaded/total,8)}}
function drawSelect(t,dt){cam.x=WW/2;cam.z=1;drawArena(t);drawAtmos(t,dt);camReset();ctx.fillStyle='rgba(6,5,10,.5)';ctx.fillRect(0,0,W,H);
 ctx.fillStyle='#d8c08f';rr(W/2-330,22,660,84,8);ctx.fill();ctx.strokeStyle='#6b5530';ctx.lineWidth=4;ctx.stroke();
 txt('SELECT YOUR FIGHTER',W/2,88,58,'#F4F2EE',{stroke:'#1a1410',sw:9});
 for(let i=0;i<28;i++){const r=gridRect(i),f=R[i];ctx.fillStyle='#08070b';ctx.fillRect(r.x-3,r.y-3,r.w+6,r.h+6);
  if(f)drawPortrait(f.n,r.x,r.y,r.w,r.h);else{const gg=ctx.createLinearGradient(r.x,r.y,r.x,r.y+r.h);gg.addColorStop(0,'#3a1d0f');gg.addColorStop(1,'#120806');ctx.fillStyle=gg;ctx.fillRect(r.x,r.y,r.w,r.h);txt('?',r.x+r.w/2,r.y+r.h*.72,80,'#FA691D',{stroke:'#000',sw:8});txt('RANDOM',r.x+r.w/2,r.y+r.h-8,18,'#fff')}
  if(i!==cursor){ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(r.x,r.y,r.w,r.h)}}
 const r=gridRect(cursor);ctx.save();ctx.strokeStyle='#38E04A';ctx.lineWidth=6;ctx.shadowColor='#38E04A';ctx.shadowBlur=14+Math.sin(t*8)*6;ctx.strokeRect(r.x-4,r.y-4,r.w+8,r.h+8);ctx.restore();txt('1',r.x+16,r.y+34,34,'#fff',{stroke:'#000',sw:6});
 const f=R[cursor];
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
 const mw=200,mx=dir>0?x+w-mw:x,my=y+h+14;ctx.fillStyle='#000';ctx.fillRect(mx-2,my-2,mw+4,12);const pr=1-f.spCd/2.4;ctx.fillStyle=pr>=1?f.def.c:'#4a4752';ctx.fillRect(mx,my,mw*pr,8);if(pr>=1){ctx.save();ctx.globalAlpha=.5+.5*Math.sin(performance.now()/120);ctx.shadowColor=f.def.c;ctx.shadowBlur=12;ctx.fillRect(mx,my,mw,8);ctx.restore()}
}
function drawProjectile(p){ctx.save();ctx.translate(p.x,p.y);ctx.globalCompositeOperation='lighter';ctx.shadowColor=p.c;ctx.shadowBlur=28;
 if(p.fx==='orb'){const r=28+Math.sin(p.t*30)*4;for(let i=6;i>=0;i--){const g=ctx.createRadialGradient(-Math.sign(p.vx)*i*24,0,1,-Math.sign(p.vx)*i*24,0,r*(1-i*.11));g.addColorStop(0,i?'rgba(255,255,255,.25)':'#fff');g.addColorStop(.4,p.c);g.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=i?.5/i:1;ctx.fillStyle=g;ctx.beginPath();ctx.arc(-Math.sign(p.vx)*i*24,0,r*(1-i*.11)*1.4,0,TAU);ctx.fill()}}
 else if(p.fx==='shard'){ctx.rotate(p.t*16);ctx.fillStyle=p.c;ctx.strokeStyle='#fff';ctx.lineWidth=3;for(let i=0;i<4;i++){ctx.rotate(TAU/4);ctx.beginPath();ctx.moveTo(0,-36);ctx.lineTo(10,0);ctx.lineTo(0,10);ctx.lineTo(-10,0);ctx.closePath();ctx.fill();ctx.stroke()}}
 else{const L=220,dir=Math.sign(p.vx);ctx.fillStyle=p.c;ctx.globalAlpha=.85;ctx.fillRect(dir>0?-L:0,-11,L,22);ctx.fillStyle='#fff';ctx.fillRect(dir>0?-L:0,-4,L,8);ctx.beginPath();ctx.arc(0,0,20,0,TAU);ctx.fill()}
 ctx.restore()}
function drawFight(t,dt){
 drawArena(t,[P1,P2]);
 camApply(1);
 const order=[P1,P2].sort((a,b)=>(a.st==='ko'||a.st==='dizzy')-(b.st==='ko'||b.st==='dizzy')||((MOVES[a.st]?1:0)-(MOVES[b.st]?1:0)));for(const f of order)drawFighter(f,t);
 drawAura();
 for(const p of projectiles)drawProjectile(p);
 ctx.save();ctx.globalCompositeOperation='lighter';
 for(const s of sparks){const k=s.t/s.life;if(s.ring){ctx.strokeStyle=s.c;ctx.globalAlpha=1-k;ctx.lineWidth=8*(1-k)+1;ctx.beginPath();ctx.arc(s.x,s.y,s.r*ease(k),0,TAU);ctx.stroke()}else{ctx.globalAlpha=1-k;ctx.fillStyle=s.c;ctx.beginPath();ctx.arc(s.x,s.y,s.s*(1-k*.5),0,TAU);ctx.fill()}}
 for(const b of bolts){ctx.globalAlpha=1-b.t/.25;ctx.strokeStyle='#fff';ctx.lineWidth=5;ctx.shadowColor=b.c;ctx.shadowBlur=30;ctx.beginPath();b.pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.strokeStyle=b.c;ctx.lineWidth=12;ctx.globalAlpha*=.4;ctx.stroke()}
 ctx.restore();
 for(const b of burst){ctx.globalAlpha=Math.max(0,1-b.t/2.2);ctx.fillStyle=b.c;ctx.fillRect(b.x-b.s/2,b.y-b.s/2,b.s,b.s)}ctx.globalAlpha=1;
 for(const f of floaters){const x=f.anchor?f.anchor.x:f.x,y=f.anchor?f.anchor.y-FH-40:f.y;ctx.globalAlpha=Math.max(0,1-f.t);txt(f.s,x,y-f.t*50,f.small?28:36,f.c,{stroke:'#000',sw:6});ctx.globalAlpha=1}
 drawAtmos(t,dt*timeScale);
 if(flashScreen>0){ctx.fillStyle=`rgba(255,255,255,${flashScreen*2.5})`;ctx.fillRect(0,0,W,H)}
 if(slowT>0){ctx.fillStyle=`rgba(80,0,0,${.18*Math.min(1,slowT)})`;ctx.fillRect(0,0,W,H)}
 // HUD
 hpBar(P1,1);hpBar(P2,-1);
 ctx.save();ctx.beginPath();for(let i=0;i<6;i++){const a=i*TAU/6+TAU/12;ctx.lineTo(W/2+Math.cos(a)*56,62+Math.sin(a)*56)}ctx.closePath();const mg=ctx.createLinearGradient(0,6,0,118);mg.addColorStop(0,'#d9b56a');mg.addColorStop(.5,'#5d4419');mg.addColorStop(1,'#a37f3b');ctx.fillStyle=mg;ctx.fill();ctx.restore();
 ctx.save();ctx.beginPath();for(let i=0;i<6;i++){const a=i*TAU/6+TAU/12;ctx.lineTo(W/2+Math.cos(a)*48,62+Math.sin(a)*48)}ctx.closePath();ctx.fillStyle='#0b0a0e';ctx.fill();ctx.restore();
 txt(String(Math.ceil(timer)),W/2,86,62,timer<10?'#FF3B2E':'#fff');
 for(let i=0;i<2;i++){for(const [side,won] of [[-1,i<wins[0]],[1,i<wins[1]]]){const cx=W/2+side*(78+i*28),cy=104;ctx.fillStyle=won?'#FA691D':'#2a2830';ctx.strokeStyle='#d9b56a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,10,0,TAU);ctx.fill();ctx.stroke();if(won)txt('🐾',cx,cy+5,11,'#000')}}
 if(streak>0)txt(`STREAK ${streak}`,W/2,140,20,'#FA691D',{stroke:'#000',sw:4});
 if(banner&&banner.s){const k=ease(banner.t/.2);ctx.save();ctx.translate(W/2,320);const s=(.3+.7*k)*(1+Math.sin(banner.t*8)*.01);ctx.scale(s,s);const size=banner.s.length>12?90:140;
  for(let i=8;i>0;i--)txt(banner.s,i,40+i,size,'rgba(0,0,0,.7)');txt(banner.s,0,40,size,'',{metal:banner.c||'#d8d4e0',stroke:'#000',sw:size*.12,glow:banner.c});
  if(banner.sub&&Math.floor(banner.t*3)%2===0)txt(banner.sub,0,110,30,'#fff',{stroke:'#000',sw:5});ctx.restore()}
}
function resultButtons(){const won=lastResult&&lastResult.won;return[
 {x:W/2-310,y:520,w:300,h:70,label:won?'NEXT FIGHT':'REMATCH',fn:()=>{if(won)p2Def=pickRandom(p1Def);SFX.select();go('vs')}},
 {x:W/2+10,y:520,w:300,h:70,label:'NEW FIGHTER',fn:()=>{SFX.select();go('select')}},
 {x:W/2-150,y:610,w:300,h:56,label:'SHARE ON X',fn:share}]}
function share(){const r=lastResult;const text=r.won?`I beat ${r.them.name} with ${r.me.name} in MEOWRTAL KOMBAT. Win streak: ${r.streak} 🥷🐈 $MEOWNERO`:`${r.them.name} just sent my ${r.me.name} to the shadow realm in MEOWRTAL KOMBAT. Rematch incoming. $MEOWNERO`;
 window.open('https://x.com/intent/post?text='+encodeURIComponent(text)+'&url='+encodeURIComponent('https://meownero.sh/kombat/'),'_blank','noopener')}
function drawResult(t,dt){cam.x=WW/2;cam.z=1.05;drawArena(t);drawAtmos(t,dt);camReset();ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(0,0,W,H);const r=lastResult;
 bigFighter(r.won?r.me:r.them,W/2,490+(r.won?-Math.abs(Math.sin(t*5))*10:0),380,false,(r.won?r.me:r.them).c);
 drawLogo(W/2,60,230,14);txt(r.won?'MEOWTORY':'DEFEAT',W/2,165,110,'',{metal:r.won?'#FA691D':'#FF3B2E',stroke:'#000',sw:14});
 txt(r.won?`WIN STREAK ${r.streak}   ·   BEST ${best}`:`${r.them.name} WINS   ·   BEST STREAK ${best}`,W/2,200,28,'#fff',{stroke:'#000',sw:5});
 for(const b of resultButtons()){const hov=hover&&hover.x>b.x&&hover.x<b.x+b.w&&hover.y>b.y&&hover.y<b.y+b.h;const x=b.label==='SHARE ON X';ctx.fillStyle=x?'#000':hov?'#ffb37f':'#FA691D';rr(b.x,b.y,b.w,b.h,12);ctx.fill();ctx.strokeStyle=x?'#fff':'#000';ctx.lineWidth=x?2:4;ctx.stroke();txt(b.label,b.x+b.w/2,b.y+b.h/2+14,b.h>60?40:30,x?'#fff':'#17161A')}}

// ================= loop =================
let last=performance.now();
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;const t=now/1000;
 update(dt);camReset();ctx.clearRect(0,0,W,H);
 if(scene==='title')drawTitle(t,dt);else if(scene==='select')drawSelect(t,dt);else if(scene==='vs')drawVS(t,dt);else if(scene==='fight')drawFight(t,dt);else drawResult(t,dt);
 camReset();if(!['result','select','title','vs'].includes(scene))click=null;
 requestAnimationFrame(frame)}
requestAnimationFrame(frame);
window.__mk={get P1(){return P1},get scene(){return scene},IMG,lightMaps};
})();
