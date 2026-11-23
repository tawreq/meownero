(()=>{
'use strict';
// ================= constants =================
const W=1280,H=720;            // screen
const WW=1900;                 // world width
const GY=640;                  // ground (world y == screen y at ground)
const HZ=455;                  // horizon line on screen
const LEFT=150,RIGHT=WW-150,FH=310;
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
const V='4';
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
const IMG={body:{},por:{},px:{}};
function load(src,tries=0){return new Promise(res=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>{if(tries<6)setTimeout(()=>load(src,tries+1).then(res),800*(tries+1));else res(null)};i.src=src+'?v='+V+(tries?'&r='+tries:'')})}
let loaded=0;const total=PLAYABLE.length*2;
PLAYABLE.forEach(f=>{
 load(`/kombat/f/${pad(f.n)}.webp`).then(i=>{IMG.body[f.n]=i;loaded++});
 load(`/kombat/p/${pad(f.n)}.webp`).then(i=>{IMG.por[f.n]=i;loaded++});
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

// ================= arena =================
// far layer (parallax .35): wide back wall with arches, windows, banners
const FAR_W=2300;const far=document.createElement('canvas');far.width=FAR_W;far.height=H;
(function(){const g=far.getContext('2d');let s=11;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
 const sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#0b0a12');sky.addColorStop(.55,'#1c1a24');sky.addColorStop(1,'#0c0b10');g.fillStyle=sky;g.fillRect(0,0,FAR_W,H);
 // moonlit arched windows
 for(let i=0;i<7;i++){const x=150+i*330,y=90,w=130,h=230;
  const mg=g.createLinearGradient(0,y,0,y+h);mg.addColorStop(0,'#2b3a5c');mg.addColorStop(1,'#141a2a');g.fillStyle=mg;g.beginPath();g.moveTo(x,y+h);g.lineTo(x,y+w/2);g.arc(x+w/2,y+w/2,w/2,Math.PI,0);g.lineTo(x+w,y+h);g.closePath();g.fill();
  g.strokeStyle='#4a4656';g.lineWidth=10;g.stroke();g.strokeStyle='#211f28';g.lineWidth=4;g.beginPath();g.moveTo(x+w/2,y);g.lineTo(x+w/2,y+h);g.moveTo(x,y+h*.55);g.lineTo(x+w,y+h*.55);g.stroke()}
 // bricks
 for(let y=0;y<HZ+20;y+=30){const off=(Math.floor(y/30)%2)*36;for(let x=-72+off;x<FAR_W;x+=72){const v=26+rnd()*20;g.fillStyle=`rgba(${v},${v-2},${v+8},.55)`;g.fillRect(x+2,y+2,68,26)}}
 // repaint windows over bricks lightly
 g.globalCompositeOperation='lighter';for(let i=0;i<7;i++){const x=150+i*330+65,gr=g.createRadialGradient(x,200,10,x,200,260);gr.addColorStop(0,'rgba(90,120,190,.18)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-260,0,520,500)}g.globalCompositeOperation='source-over';
 // long banners
 for(let i=0;i<6;i++){const bx=320+i*330;g.fillStyle='#5e140d';g.beginPath();g.moveTo(bx-34,30);g.lineTo(bx+34,30);g.lineTo(bx+34,330);g.lineTo(bx,300);g.lineTo(bx-34,330);g.closePath();g.fill();g.strokeStyle='#b8862e';g.lineWidth=3;g.stroke();
  g.fillStyle='#d9a542';g.fillRect(bx-42,24,84,8);g.save();g.fillStyle='#FA691D';g.globalAlpha=.85;g.font='26px "Dela Gothic One",sans-serif';g.textAlign='center';['ミ','ャ','ウ','ネ','ロ'].forEach((c,k)=>g.fillText(c,bx,80+k*42));g.restore()}
 const fade=g.createLinearGradient(0,0,0,HZ+20);fade.addColorStop(0,'rgba(6,5,10,.85)');fade.addColorStop(.6,'rgba(6,5,10,.25)');fade.addColorStop(1,'rgba(6,5,10,.7)');g.fillStyle=fade;g.fillRect(0,0,FAR_W,HZ+20);
})();

// ================= camera =================
const cam={x:WW/2,z:1,tx:WW/2,tz:1,shake:0,kick:0};
function camApply(par){// par = parallax factor (1 = world)
 const z=1+(cam.z-1)*par, x=WW/2+(cam.x-WW/2)*par;
 const sx=(Math.random()-.5)*cam.shake*60,sy=(Math.random()-.5)*cam.shake*40;
 ctx.setTransform(z,0,0,z,W/2-x*z+sx,GY-GY*z+sy+cam.kick*8)}
function camReset(){ctx.setTransform(1,0,0,1,0,0)}
function updateCam(dt,a,b,focus){
 if(focus){cam.tx=focus.x;cam.tz=1.35}else if(a&&b){const d=Math.abs(a.x-b.x);cam.tz=clamp(1150/(d+620),.95,1.28);cam.tx=(a.x+b.x)/2}else{cam.tx=WW/2;cam.tz=1}
 const half=W/2/cam.tz;cam.tx=clamp(cam.tx,half,WW-half);
 const k=1-Math.pow(.0009,dt);cam.x+=(cam.tx-cam.x)*k;cam.z+=(cam.tz-cam.z)*k;
 cam.shake=Math.max(0,cam.shake-dt*1.6);cam.kick*=Math.pow(.02,dt)}

const embers=[];for(let i=0;i<70;i++)embers.push({x:Math.random()*WW,y:Math.random()*GY,v:20+Math.random()*50,s:1+Math.random()*2.4,p:Math.random()*TAU});
const BRAZ=[WW/2-660,WW/2+660];
function drawBrazier(x,y,t){ctx.fillStyle='#24212b';ctx.fillRect(x-40,y,80,18);ctx.fillStyle='#38343f';ctx.fillRect(x-40,y,80,5);ctx.fillStyle='#1d1b22';ctx.fillRect(x-12,y+18,24,80);ctx.fillRect(x-32,y+92,64,12);
 ctx.save();ctx.globalCompositeOperation='lighter';
 for(let i=0;i<8;i++){const fx=x+Math.sin(t*7+i*1.7)*16,fh=62+Math.sin(t*9+i)*18;const gr=ctx.createRadialGradient(fx,y-fh*.3,2,fx,y-fh*.3,fh*.65);gr.addColorStop(0,'rgba(255,236,160,.75)');gr.addColorStop(.4,'rgba(255,120,30,.55)');gr.addColorStop(1,'rgba(255,60,0,0)');ctx.fillStyle=gr;ctx.beginPath();ctx.ellipse(fx,y-fh*.3,20,fh*.58,0,0,TAU);ctx.fill()}
 const glow=ctx.createRadialGradient(x,y,10,x,y,360);glow.addColorStop(0,'rgba(255,120,30,.22)');glow.addColorStop(1,'rgba(255,120,30,0)');ctx.fillStyle=glow;ctx.fillRect(x-360,y-360,720,720);ctx.restore()}

function drawArena(t,fighters){
 camReset();
 // far wall (parallax)
 const fz=1+(cam.z-1)*.35,fx=(cam.x-WW/2)*.35;ctx.save();ctx.translate(W/2,HZ);ctx.scale(fz,fz);ctx.drawImage(far,-FAR_W/2-fx,-HZ);ctx.restore();
 // light shafts
 ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const x0=W/2+(i-1.5)*330-(cam.x-WW/2)*.5+Math.sin(t*.3+i)*20;const g=ctx.createLinearGradient(0,0,0,HZ+80);g.addColorStop(0,'rgba(120,150,220,.09)');g.addColorStop(1,'rgba(120,150,220,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x0-30,0);ctx.lineTo(x0+40,0);ctx.lineTo(x0+170,HZ+80);ctx.lineTo(x0+40,HZ+80);ctx.closePath();ctx.fill()}ctx.restore();
 // perspective floor
 const fl=ctx.createLinearGradient(0,HZ,0,H);fl.addColorStop(0,'#2e2b35');fl.addColorStop(.35,'#3a3642');fl.addColorStop(1,'#141318');ctx.fillStyle=fl;ctx.fillRect(0,HZ,W,H-HZ);
 const z=cam.z;const proj=(xw,d)=>W/2+(xw-cam.x)*z*lerp(.42,1.55,d);
 ctx.strokeStyle='rgba(0,0,0,.5)';ctx.lineWidth=2;
 for(let xw=-1200;xw<=WW+1200;xw+=130){ctx.beginPath();ctx.moveTo(proj(xw,0),HZ);ctx.lineTo(proj(xw,1),H);ctx.stroke()}
 for(let i=1;i<9;i++){const d=Math.pow(i/9,1.7),y=HZ+(H-HZ)*d;ctx.globalAlpha=.35+d*.4;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}ctx.globalAlpha=1;
 // floor glow pool
 ctx.save();ctx.globalCompositeOperation='lighter';const pool=ctx.createRadialGradient(W/2,GY,20,W/2,GY,620*z);pool.addColorStop(0,'rgba(250,105,29,.13)');pool.addColorStop(1,'rgba(250,105,29,0)');ctx.fillStyle=pool;ctx.fillRect(0,HZ,W,H-HZ);ctx.restore();
 // mid layer: pillars (parallax .8)
 camApply(.8);
 for(const px of [WW/2-860,WW/2+860,WW/2-1400,WW/2+1400]){const pg=ctx.createLinearGradient(px-60,0,px+60,0);pg.addColorStop(0,'#1e1c24');pg.addColorStop(.5,'#3f3c48');pg.addColorStop(1,'#18161d');ctx.fillStyle=pg;ctx.fillRect(px-56,-300,112,GY+300-180);ctx.fillStyle='#46434f';ctx.fillRect(px-70,GY-190,140,24);
  ctx.strokeStyle='#2a2830';ctx.lineWidth=5;for(let k=0;k<8;k++){ctx.beginPath();ctx.arc(px,-250+k*28,8,0,TAU);ctx.stroke()}}
 // world layer
 camApply(1);
 for(const bx of BRAZ)drawBrazier(bx,GY-150,t+bx*.001);
 // reflections
 if(fighters)for(const f of fighters)drawFighter(f,t,true);
}
function drawAtmos(t,dt){
 camApply(1);ctx.save();ctx.globalCompositeOperation='lighter';
 for(const e of embers){if(dt){e.y-=e.v*dt;e.x+=Math.sin(t+e.p)*12*dt;if(e.y<-40){e.y=GY+20;e.x=Math.random()*WW}}const a=.35+.35*Math.sin(t*3+e.p);ctx.fillStyle=`rgba(255,${140+Math.floor(a*80)},60,${a})`;ctx.beginPath();ctx.arc(e.x,e.y,e.s,0,TAU);ctx.fill()}
 ctx.restore();camReset();
 // low fog
 const fog=ctx.createLinearGradient(0,GY-90,0,H);fog.addColorStop(0,'rgba(170,160,190,0)');fog.addColorStop(.6,'rgba(170,160,190,.08)');fog.addColorStop(1,'rgba(20,18,26,.35)');ctx.fillStyle=fog;ctx.fillRect(0,GY-90,W,H-GY+90);
 // vignette + grade
 const v=ctx.createRadialGradient(W/2,H*.48,H*.35,W/2,H*.5,H*.95);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.62)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
 ctx.save();ctx.globalCompositeOperation='soft-light';ctx.fillStyle='rgba(255,120,40,.12)';ctx.fillRect(0,0,W,H);ctx.restore();
}

// ================= fighters =================
const MOVES={
 punch:{dur:.3,hitAt:.1,reach:235,dmg:6,kb:200,h:.62,heavy:false},
 kick:{dur:.46,hitAt:.18,reach:265,dmg:9,kb:300,h:.3,heavy:true},
 upper:{dur:.5,hitAt:.17,reach:200,dmg:12,kb:150,h:.75,heavy:true,launch:true},
};
function mk(def,x,facing,isCPU){return{def,x,y:GY,vx:0,vy:0,facing,hp:100,hpShown:100,st:'idle',t:0,hitDone:false,spCd:1.2,flash:0,shake:0,isCPU,dashHit:false,ai:{t:0,act:null,until:0},combo:0,comboT:0,spin:0,trail:[],dizzy:0,gone:false}}
let P1,P2,projectiles=[],sparks=[],floaters=[],bolts=[],burst=[],flashScreen=0,hitStop=0,timeScale=1,slowT=0;
const bodyW=f=>{const img=IMG.body[f.def.n];return img?FH*img.width/img.height:200};

// sprite compositor: lights the sprite into a temp canvas
const tc=document.createElement('canvas'),tg=tc.getContext('2d');
function litSprite(f,w,h,refl){const img=IMG.body[f.def.n];const s=Math.min(2,cam.z*1.15);const cw=Math.ceil(w*s),ch=Math.ceil(h*s);if(tc.width<cw||tc.height<ch){tc.width=Math.max(tc.width,cw);tc.height=Math.max(tc.height,ch)}
 tg.setTransform(1,0,0,1,0,0);tg.clearRect(0,0,cw+2,ch+2);tg.globalCompositeOperation='source-over';tg.imageSmoothingQuality='high';tg.drawImage(img,0,0,cw,ch);
 tg.globalCompositeOperation='source-atop';
 if(!refl){// key light from the near brazier + floor bounce + dark feet
  const near=f.x<WW/2?-1:1;const g=tg.createLinearGradient(near>0?cw:0,0,near>0?0:cw,0);g.addColorStop(0,'rgba(255,150,60,.28)');g.addColorStop(.45,'rgba(255,150,60,0)');tg.fillStyle=g;tg.fillRect(0,0,cw,ch);
  const v=tg.createLinearGradient(0,0,0,ch);v.addColorStop(0,'rgba(170,190,255,.08)');v.addColorStop(.6,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.38)');tg.fillStyle=v;tg.fillRect(0,0,cw,ch);
  if(f.flash>0){tg.fillStyle=`rgba(255,255,255,${Math.min(1,f.flash*5)})`;tg.fillRect(0,0,cw,ch)}
  if(f.st==='special'||f.st==='dash'||f.st==='win'){tg.fillStyle=f.def.c;tg.globalAlpha=.18+.1*Math.sin(f.t*30);tg.fillRect(0,0,cw,ch);tg.globalAlpha=1}
 }else{tg.fillStyle='rgba(20,18,26,.35)';tg.fillRect(0,0,cw,ch)}
 tg.globalCompositeOperation='source-over';return{cw,ch}}

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
 return p}

function drawWarp(cw,ch,w,h,p){const N=34;for(let i=0;i<N;i++){const v0=i/N,v=(i+.5)/N;
  let dx=p.top*Math.pow(1-v,1.7);
  let dy=0;
  if(v>.52){const lv=(v-.52)/.48;dx+=p.leg*Math.pow(lv,1.25);dy=-p.lift*Math.pow(lv,1.1)}
  ctx.drawImage(tc,0,v0*ch,cw,ch/N+1,-w/2+dx,-h+v0*h+dy,w,h/N+1.2)}}

function drawFighter(f,t,refl=false){
 const img=IMG.body[f.def.n];if(!img||f.gone)return;const w=bodyW(f),h=FH;const p=pose(f,t);
 if(!refl){// floor shadow
  const air=Math.max(0,GY-f.y);ctx.save();ctx.fillStyle='rgba(0,0,0,.5)';ctx.beginPath();ctx.ellipse(f.x,GY+6,w*.4*(1-air/520),14*(1-air/520),0,0,TAU);ctx.fill();ctx.restore();
  // afterimages
  for(const tr of f.trail){ctx.save();ctx.globalAlpha=tr.a*.35;ctx.translate(tr.x,tr.y);ctx.scale(f.facing,1);ctx.drawImage(img,-w/2,-h,w,h);ctx.restore()}
 }
 const {cw,ch}=litSprite(f,w,h,refl);
 ctx.save();
 const sh=f.shake?Math.sin(f.shake*90)*6:0;
 if(refl){ctx.globalAlpha=.2;ctx.translate(f.x+p.ox*f.facing,GY+(GY-f.y)+4);ctx.scale(f.facing,-.55)}
 else{ctx.translate(f.x+p.ox*f.facing+sh,f.y+p.oy)}
 if(p.pivot==='center'){ctx.translate(0,-h/2);ctx.rotate(p.spin*f.facing);ctx.translate(0,h/2)}else ctx.rotate(p.rot*f.facing);
 if(!refl)ctx.scale(f.facing*p.sx,p.sy);else ctx.scale(p.sx,p.sy);
 drawWarp(cw,ch,w,h,p);
 ctx.restore();
 if(refl)return;
 // attack trails
 const arc=(m,yy,col,width)=>{const k=(f.t-m.hitAt)/.14;if(k<0||k>1)return;ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(1-k)*.9;ctx.strokeStyle=col;ctx.lineWidth=width*(1-k)+3;ctx.lineCap='round';ctx.shadowColor=col;ctx.shadowBlur=18;ctx.beginPath();const cx=f.x+f.facing*(w*.2+m.reach*.38);const r=70+k*40;ctx.arc(cx,f.y-h*yy,r,f.facing>0?-1.1:Math.PI-1.1+0,f.facing>0?1.1:Math.PI+1.1);ctx.stroke();
  // speed lines
  ctx.lineWidth=2;for(let i=0;i<5;i++){const yy2=f.y-h*yy+(i-2)*14;ctx.beginPath();ctx.moveTo(f.x+f.facing*(w*.1),yy2);ctx.lineTo(f.x+f.facing*(w*.1+m.reach*(.55+.1*i%2)),yy2);ctx.stroke()}ctx.restore()};
 if(f.st==='punch')arc(MOVES.punch,.6,'#ffffff',12);if(f.st==='kick')arc(MOVES.kick,.28,f.def.c,16);if(f.st==='upper')arc(MOVES.upper,.7,'#ffd27a',14);
 if(f.st==='block'){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=f.def.c;ctx.globalAlpha=.6+.2*Math.sin(t*20);ctx.lineWidth=7;ctx.shadowColor=f.def.c;ctx.shadowBlur=22;ctx.beginPath();const cx=f.x+f.facing*w*.18;ctx.arc(cx,f.y-h*.5,h*.46,f.facing>0?-1.05:Math.PI-1.05,f.facing>0?1.05:Math.PI+1.05);ctx.stroke();ctx.restore()}
 if(f.st==='special'&&f.t<.16){ctx.save();ctx.globalCompositeOperation='lighter';const r=40+f.t*500,g=ctx.createRadialGradient(f.x+f.facing*60,f.y-h*.55,2,f.x+f.facing*60,f.y-h*.55,r);g.addColorStop(0,'#fff');g.addColorStop(.3,f.def.c);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(f.x-r*2,f.y-h-r,r*4,h+r*2);ctx.restore()}
 if(f.st==='dizzy'){for(let i=0;i<3;i++){const a=t*4+i*TAU/3;txt('★',f.x+Math.cos(a)*50,f.y-h-10+Math.sin(a)*12,26,'#FFE14D',{stroke:'#000',sw:4})}}
}

function setSt(f,st){f.st=st;f.t=0;f.hitDone=false}
const busy=f=>['punch','kick','upper','hit','special','dash','ko','win','dizzy'].includes(f.st);

function spark(x,y,c,n,spd=1){for(let i=0;i<n;i++){const a=Math.random()*TAU,v=(200+Math.random()*520)*spd;sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-140,t:0,life:.3+Math.random()*.35,c,s:2+Math.random()*4})}}
function ring(x,y,c,big){sparks.push({ring:true,x,y,t:0,life:big?.35:.22,c,r:big?140:80})}

function damage(def,att,dmg,kb,o={}){
 if(def.st==='ko'||def.gone||roundOver)return false;
 const blocking=def.st==='block'&&Math.sign(att.x-def.x)===def.facing&&def.y>=GY-1;
 const hy=def.y-FH*(o.h||.55);
 if(blocking){def.hp=Math.max(0,def.hp-dmg*.12);def.vx=kb*.4*att.facing;SFX.block();spark(def.x+def.facing*70,hy,'#bfe6ff',12,.8);ring(def.x+def.facing*70,hy,'#bfe6ff');hitStop=.045;return 'block'}
 def.hp=Math.max(0,def.hp-dmg);def.vx=kb*att.facing;def.flash=.16;def.shake=.18;setSt(def,'hit');
 if(o.launch||def.y<GY-1){def.vy=-620;def.vx=kb*.8*att.facing}
 if(att.comboT>0)att.combo++;else att.combo=1;att.comboT=.9;
 const heavy=o.heavy||dmg>=11;
 hitStop=heavy?.11:.065;cam.shake=Math.min(.5,cam.shake+(heavy?.28:.15));cam.kick=heavy?1:.5;if(heavy)flashScreen=.12;
 heavy?SFX.heavy():SFX.hit();
 spark(def.x-att.facing*20,hy,att.def.c,heavy?28:16);spark(def.x-att.facing*20,hy,'#fff',8);ring(def.x-att.facing*10,hy,att.def.c,heavy);
 if(att.combo>=2)floaters.push({x:att.x,y:att.y-FH-40,s:`${att.combo} HIT COMBO`,t:0,c:'#FFE14D',small:true,anchor:att});
 return 'hit'}

function doSpecial(f){if(f.spCd>0||busy(f)||f.y<GY-1)return false;f.spCd=2.4;SFX.special();
 floaters.push({x:f.x,y:f.y-FH-30,s:f.def.sp.name,t:0,c:f.def.c,small:true});
 if(f.def.sp.t==='p'){setSt(f,'special');setTimeout(()=>{if(f.st==='special')projectiles.push({x:f.x+f.facing*110,y:f.y-FH*.56,vx:820*f.facing,owner:f,fx:f.def.sp.fx,c:f.def.c,t:0,dmg:12*f.def.pow})},120)}
 else{setSt(f,'dash');f.dashHit=false}
 return true}

function updFighter(f,o,dt,c){
 f.t+=dt;f.spCd=Math.max(0,f.spCd-dt);f.flash=Math.max(0,f.flash-dt);f.shake=Math.max(0,f.shake-dt);f.comboT=Math.max(0,f.comboT-dt);
 if(!busy(f)&&f.y>=GY-1)f.facing=o.x>f.x?1:-1;
 // trails for fast moves
 if(f.st==='dash'||(f.st==='jump'&&Math.abs(f.vx)>40)||f.st==='upper'){f.trail.push({x:f.x,y:f.y,a:1})}for(const tr of f.trail)tr.a-=dt*5;f.trail=f.trail.filter(tr=>tr.a>0).slice(-5);
 const sp=290*f.def.spd;
 if(f.st==='ko'||f.st==='win'||f.st==='dizzy'){f.vx*=.9}
 else if(f.st==='hit'){f.vx*=.88;if(f.t>.32&&f.y>=GY-1)setSt(f,'idle')}
 else if(MOVES[f.st]){const m=MOVES[f.st];f.vx*=.7;if(!f.hitDone&&f.t>=m.hitAt){f.hitDone=true;m.heavy?SFX.heavyWhoosh():SFX.whoosh();const dx=(o.x-f.x)*f.facing,dy=Math.abs(o.y-f.y);if(dx>0&&dx<m.reach&&dy<160)damage(o,f,m.dmg*f.def.pow,m.kb,m)}if(f.t>=m.dur)setSt(f,'idle')}
 else if(f.st==='special'){f.vx=0;if(f.t>.42)setSt(f,'idle')}
 else if(f.st==='dash'){f.vx=820*f.facing;if(!f.dashHit){const dx=(o.x-f.x)*f.facing;if(dx>0&&dx<210&&Math.abs(o.y-f.y)<150){f.dashHit=true;damage(o,f,13*f.def.pow,460,{heavy:true});f.vx=-140*f.facing;setSt(f,'idle')}}if(f.st==='dash'&&f.t>.38){f.vx=0;setSt(f,'idle')}}
 else{const air=f.y<GY-1;
  if(c.special&&doSpecial(f)){}
  else if(c.punch&&c.down&&!air){setSt(f,'upper')}
  else if(c.punch){setSt(f,'punch')}
  else if(c.kick&&!air){setSt(f,'kick')}
  else if(c.kick&&air){setSt(f,'kick')}
  else if(c.down&&!air){if(f.st!=='block')setSt(f,'block');f.vx=0}
  else if(c.up&&!air){f.vy=-800;setSt(f,'jump');f.spin=0;f.vx=(c.right?sp:c.left?-sp:0)*1.15}
  else if(!air){const dir=(c.right?1:0)-(c.left?1:0);f.vx=dir*sp*(dir===f.facing?1:.8);const st=dir?'walk':'idle';if(f.st!==st)setSt(f,st)}
 }
 if(f.st==='jump'&&Math.abs(f.vx)>40)f.spin+=dt*TAU*1.35;
 f.vy+=2150*dt;f.y+=f.vy*dt;if(f.y>=GY){if(f.vy>400&&f.st!=='ko')SFX.land();f.y=GY;f.vy=0;if(f.st==='jump'||(f.st==='kick'&&f.t>.3))setSt(f,'idle')}
 f.x+=f.vx*dt;f.x=clamp(f.x,LEFT,RIGHT)}
function separate(){const min=190;const dx=P2.x-P1.x;if(Math.abs(dx)<min&&Math.abs(P1.y-P2.y)<160){const push=(min-Math.abs(dx))/2*Math.sign(dx||1);P1.x=clamp(P1.x-push,LEFT,RIGHT);P2.x=clamp(P2.x+push,LEFT,RIGHT)}}

// ================= AI =================
let level=0;
function aiCtl(f,o,dt){const c={};const d=Math.min(1,.25+level*.12+round*.05);const a=f.ai;a.t-=dt;
 if(busy(f))return c;
 if(a.act&&a.until>0){a.until-=dt;Object.assign(c,a.act);if(a.until<=0)a.act=null;return c}
 if(a.t>0)return c;a.t=.16-.08*d+Math.random()*.12;
 const dist=Math.abs(o.x-f.x)-80,toward=o.x>f.x?'right':'left',away=toward==='right'?'left':'right';
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
function go(s){scene=s;sceneT=0}
function startMatch(){round=1;wins=[0,0];startRound()}
function startRound(){P1=mk(p1Def,WW/2-300,1,false);P2=mk(p2Def,WW/2+300,-1,true);projectiles=[];sparks=[];floaters=[];bolts=[];burst=[];timer=60;roundOver=false;finish=null;timeScale=1;slowT=0;cam.x=WW/2;cam.z=1.6;
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
  for(const p of projectiles){p.t+=dt;p.x+=p.vx*dt;const o=p.owner===P1?P2:P1;if(!p.dead&&Math.abs(p.x-o.x)<95&&Math.abs(p.y-(o.y-FH*.55))<130){p.dead=true;damage(o,p.owner,p.dmg,320,{heavy:true})}if(p.x<-100||p.x>WW+100)p.dead=true}
  for(let i=0;i<projectiles.length;i++)for(let j=i+1;j<projectiles.length;j++){const a=projectiles[i],b=projectiles[j];if(a.owner!==b.owner&&Math.abs(a.x-b.x)<45){a.dead=b.dead=true;spark((a.x+b.x)/2,a.y,'#fff',24);ring((a.x+b.x)/2,a.y,'#fff',true);SFX.block()}}
  projectiles=projectiles.filter(p=>!p.dead);
 }
 for(const s of sparks){s.t+=dt;if(!s.ring){s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=1000*dt}}sparks=sparks.filter(s=>s.t<s.life);
 for(const b of burst){b.t+=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.vy+=1400*dt;if(b.y>GY){b.y=GY;b.vy*=-.3;b.vx*=.6}}
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
 ctx.fillStyle='rgba(8,7,12,.35)';ctx.fillRect(0,0,W,H);title3D('MEOWRTAL','KOMBAT',300,1+Math.sin(t*2.4)*.015);
 txt('ミャウネロ格闘',W/2,452,34,'#FA691D',{family:DELA,glow:'#FA691D'});
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
 txt('YOU',320,120,30,'#fff',{stroke:'#000',sw:5});txt(streak>0?`OPPONENT ${streak+1}`:'CPU',960,120,30,'#fff',{stroke:'#000',sw:5});
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
 txt(r.won?'MEOWTORY':'DEFEAT',W/2,150,120,'',{metal:r.won?'#FA691D':'#FF3B2E',stroke:'#000',sw:14});
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
})();
