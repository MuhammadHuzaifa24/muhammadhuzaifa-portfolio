import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const W=1920,H=1080,FPS=30,DURATION=48,starts=[0,6,12,18,26,34,40,44],lengths=[6,6,6,8,8,6,4,4];
const status=document.querySelector('#status'),progress=document.querySelector('#progress'),error=document.querySelector('#error');
const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(W,H,false);renderer.setPixelRatio(1);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.querySelector('#stage').append(renderer.domElement);
const scene=new T.Scene(),camera=new T.PerspectiveCamera(39,W/H,.1,100);const pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(new RoomEnvironment(),.04).texture;scene.environmentIntensity=.65;
const background=document.createElement('canvas');background.width=2048;background.height=1024;const bc=background.getContext('2d'),bg=bc.createLinearGradient(0,0,2048,800);bg.addColorStop(0,'#b8dfef');bg.addColorStop(.5,'#c9d6f0');bg.addColorStop(1,'#f1d5e6');bc.fillStyle=bg;bc.fillRect(0,0,2048,1024);scene.background=new T.CanvasTexture(background);scene.background.colorSpace=T.SRGBColorSpace;
scene.add(new T.HemisphereLight('#f4f6ff','#9eadd7',1.8));const key=new T.DirectionalLight('#fff7e8',3.2);key.position.set(-5,9,6);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-13,right:13,top:13,bottom:-13,far:45});key.shadow.normalBias=.02;scene.add(key);const fill=new T.DirectionalLight('#a9cbff',1.7);fill.position.set(6,3,-4);scene.add(fill);
const floor=new Reflector(new T.PlaneGeometry(50,50),{color:0xc2d5e8,textureWidth:1024,textureHeight:1024,clipBias:.003});floor.rotation.x=-Math.PI/2;floor.position.y=-2.15;scene.add(floor);
const shadow=new T.Mesh(new T.PlaneGeometry(50,50),new T.ShadowMaterial({opacity:.12}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-2.145;shadow.receiveShadow=true;scene.add(shadow);
const dunes=new T.Group();for(let layer=0;layer<2;layer++){const g=new T.PlaneGeometry(40,22,96,64);g.rotateX(-Math.PI/2);const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,Math.sin(p.getX(i)*.25+p.getZ(i)*.3+layer)*.65+Math.cos(p.getZ(i)*.4)*.4);g.computeVertexNormals();const m=new T.Mesh(g,new T.MeshStandardMaterial({color:layer?'#9b9fcd':'#7d9fc8',roughness:.8}));m.position.set(0,-2.1-layer*.3,-14-layer*5);dunes.add(m);}scene.add(dunes);
const glass=new T.MeshPhysicalMaterial({color:'#edf4ff',roughness:.17,metalness:.02,transmission:.52,thickness:.3,ior:1.42,transparent:true,opacity:.94,clearcoat:1});
const plastic=c=>new T.MeshStandardMaterial({color:c,roughness:.35,metalness:.08});
function box(w,h,d,c='#dae7f7',r=.1,mat){const m=new T.Mesh(new RoundedBoxGeometry(w,h,d,4,r),mat||plastic(c));m.castShadow=true;m.receiveShadow=true;return m;}
function add(g,obj,x=0,y=0,z=0){obj.position.set(x,y,z);g.add(obj);return obj;}
function tex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;}
function label(title,sub='',w=3,h=.75,{dark=false,badge='',size=64,align='left'}={}){return tex(1400,Math.round(1400*h/w),(c,cw,ch)=>{c.fillStyle=dark?'#ffffff':'#283549';c.font=`600 ${size}px Arial`;c.textAlign=align;const x=align==='center'?cw/2:46;c.fillText(title,x,ch*(sub?.4:.62));if(sub){c.font='34px Arial';c.fillStyle=dark?'#cddaf0':'#71839d';c.fillText(sub,x,ch*.78);}if(badge){c.font='bold 27px Arial';const bw=c.measureText(badge).width+40;c.fillStyle='#f18a5c';c.beginPath();c.roundRect(cw-bw-28,22,bw,44,18);c.fill();c.fillStyle='white';c.fillText(badge,cw-bw-8,53);}});}
function surface(texture,w,h){return new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false}));}
function text(g,title,sub,w,h,x,y,z,opts={}){return add(g,surface(label(title,sub,w,h,opts),w,h),x,y,z);}
function card(title,sub='',w=3.1,h=.85,opts={}){const g=new T.Group();add(g,box(w,h,.14,opts.dark?'#273650':'#e8f1ff',.09,opts.dark?plastic('#273650'):glass.clone()));add(g,surface(label(title,sub,w,h,opts),w-.08,h-.08),0,0,.083);if(opts.accent)add(g,box(w-.2,.045,.05,'#f28b60',.02),0,h/2-.04,.1);return g;}
function planeImage(texture,w,h){const g=new T.Group();add(g,box(w+.22,h+.22,.18,'#e9effb',.12,glass.clone()));add(g,new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture,toneMapped:false})),0,0,.104);return g;}
const loader=new T.TextureLoader();const image=async p=>{const t=await loader.loadAsync('/media/images/'+p);t.colorSpace=T.SRGBColorSpace;return t;};
const assets={};await Promise.all(['myavatar.png','flappybird.jpg','mrjungle.jpg','ninnitrap.jpg','GameConRunner.jpg','kiki-the-explorer.png','mochi-3d.png'].map(async n=>assets[n]=await image(n)));
const logos={};for(const n of ['Unity','Blender','React','Threedotjs','Csharp','Python']){const t=await loader.loadAsync('/branding/'+n+'.png');t.colorSpace=T.SRGBColorSpace;logos[n]=t;}
const videos={};for(const [name,file] of [['wada','WADA.mp4'],['signal','signal-shutdown.mp4'],['rise','fyp.mp4'],['arcade','ninnitrap.mp4']]){const v=document.createElement('video');v.src='/media/playback/'+file;v.muted=true;v.playsInline=true;v.preload='auto';await new Promise((resolve,reject)=>{v.onloadeddata=resolve;v.onerror=()=>reject(Error('Video asset failed: '+file));});const texture=new T.VideoTexture(v);texture.colorSpace=T.SRGBColorSpace;videos[name]={v,texture};}
const chapters=Array.from({length:8},()=>new T.Group());chapters.forEach(g=>scene.add(g));const movers=[];
const floating=(g,obj,x,y,z,phase=0)=>{add(g,obj,x,y,z);movers.push({obj,x,y,z,phase});return obj;};
function heading(g,kicker,title){text(g,kicker,'',7.8,.35,0,3.25,0,{size:38,align:'center'});text(g,title,'',9,.65,0,2.7,0,{size:70,align:'center'});}
// 01 / A tangible pastel workspace, with Huzaifa's portfolio on the laptop.
{
 const g=chapters[0];add(g,box(12,.28,6,'#b9dbe9',.16),0,-1.35,0);
 const laptop=new T.Group();add(g,laptop,0,-1.14,.1);add(laptop,box(5.5,.16,3.4,'#d1c8e8',.1));
 const keyboard=tex(1200,650,(c,w,h)=>{c.fillStyle='#afbad0';c.fillRect(0,0,w,h);c.fillStyle='#556078';for(let row=0;row<5;row++)for(let col=0;col<13;col++)c.fillRect(55+col*84,30+row*65,72,52);c.fillStyle='#c4cde0';c.fillRect(410,390,390,210);});const keys=surface(keyboard,5,2.9);keys.rotation.x=-Math.PI/2;add(laptop,keys,0,.091,0);
 const screen=new T.Group();add(laptop,screen,0,.06,-1.5);screen.rotation.x=-.12;add(screen,box(5.5,3.35,.16,'#c6c5df',.12),0,1.65,0);
 const intro=tex(1600,950,(c,w,h)=>{const gradient=c.createLinearGradient(0,0,w,h);gradient.addColorStop(0,'#e0eff8');gradient.addColorStop(1,'#f3e3ec');c.fillStyle=gradient;c.fillRect(0,0,w,h);c.fillStyle='#61718d';c.font='30px Arial';c.fillText('A PORTFOLIO OF PLAYABLE IDEAS',90,110);c.fillStyle='#27344a';c.font='bold 125px Arial';c.fillText('MUHAMMAD',85,330);c.fillStyle='#ed895c';c.fillText('HUZAIFA',85,470);c.fillStyle='#657893';c.font='39px Arial';c.fillText('Game Designer / 3D Artist',90,585);c.fillText('Web3D & VR Developer',90,645);c.font='27px Arial';c.fillText('NED University of Engineering and Technology',90,805);});add(screen,surface(intro,5.22,3.08),0,1.65,.091);
 for(let i=0;i<3;i++){const b=box(1.7,.22,1.25,['#d6b9d7','#f4d3ba','#bdcde8'][i],.05);b.rotation.y=.08*(i-1);add(g,b,-4,-1.04+i*.24,-.7);}
 add(g,box(.8,1.15,.8,'#e2c9e9',.16,glass.clone()),4,-.64,-.8);
 for(let i=0;i<3;i++){const pencil=new T.Mesh(new T.CylinderGeometry(.045,.045,1.6,12),plastic(i?'#c1b9e6':'#f69e62'));pencil.rotation.z=(i-1)*.14;add(g,pencil,3.8+i*.19,.1,-.8);}
 const phone=box(1.2,.13,2.2,'#bfcce4',.14);phone.rotation.y=-.3;add(g,phone,3.9,-1.1,1.4);const phoneface=surface(label('HUZAIFA','CREATIVE WORLDS',1.1,2,{size:94,align:'center'}),1.1,2);phoneface.rotation.x=-Math.PI/2;phoneface.rotation.z=.3;add(g,phoneface,3.9,-1.02,1.4);
 text(g,'MUHAMMAD HUZAIFA','Game designer. 3D artist. Creative developer.',9,1.15,0,3,-1,{size:89,align:'center'});
}
// 02 / Floating glass profile cards above flowing dune shapes.
{
 const g=chapters[1];heading(g,'THE PERSON BEHIND THE PIXELS','Ideas become interactive worlds.');
 const rows=[['NED University','Gaming & Animation','FINAL YEAR',-2.3,1],['3.57 / 4.00','Current CGPA','ACADEMICS',2.1,1.25],['Immersive experiences','AR / VR development','UNITY',-2.6,-.25],['3D + Web','Characters, games, applications','CREATE',2.0,-.1],['Muhammad Huzaifa','Based in Karachi, Pakistan','THE MAKER',-.1,-1.35]];
 rows.forEach(([a,b,badge,x,y],i)=>floating(g,card(a,b,4.15,.95,{badge,size:66}),x,y,-i*.08,i));
}
// 03 / A fanned stack of glass interfaces with real tool identities.
{
 const g=chapters[2];heading(g,'A CREATIVE TOOLKIT','Built with the right tools.');
 const stack=new T.Group();add(g,stack,0,-.05,0);stack.rotation.set(-.08,-.32,.06);stack.scale.setScalar(.88);
 for(let i=4;i>=0;i--){const layer=box(5.7,4.35,.13,'#d5e2f6',.22,glass.clone());add(stack,layer,-i*.19,-i*.06,-i*.25);}
 text(stack,'CREATIVE TOOLKIT','Game engines / 3D / Web / AI',5.2,.8,0,1.45,.14,{size:70});
 ['Unity','Blender','React','Threedotjs','Csharp','Python'].forEach((name,i)=>{const x=-1.72+(i%3)*1.72,y=.25-Math.floor(i/3)*1.5;add(stack,box(1.5,1.25,.18,['#d8e9f4','#f3d2bd','#e1d6ef'][i%3],.13),x,y,.2);add(stack,surface(logos[name],.57,.57),x,y+.1,.303);text(stack,{'Threedotjs':'Three.js','Csharp':'C#'}[name]||name,'',1.3,.3,x,y-.4,.31,{size:48,align:'center'});});
 floating(g,card('Unity + C#','Gameplay systems',2.8,.9,{badge:'BUILD'}),4,.4,.1,1);floating(g,card('Python / RAG / MCP','Intelligent applications',3.3,.9,{badge:'CONNECT'}),-4,-.65,.4,3);
}
// 04 / Actual project gameplay in floating, physical display frames.
{
 const g=chapters[3];heading(g,'SELECTED GAME WORLDS','Designed to be explored.');
 const screen=planeImage(videos.wada.texture,7.6,4.275);add(g,screen,0,.05,0);g.userData.screen=screen;
 const c=card('WADA','Arabian open-world action adventure',6.7,.75,{badge:'UNITY / BLENDER',size:73});add(g,c,0,-1.6,.35);g.userData.caption=c;
 floating(g,card('Third-person combat','Exploration / Custom environments',3.5,.85,{badge:'3D'}),-4.7,.85,.7,2);
}
// 05 / R.I.S.E as a connected, physical workflow, echoing the reference's orange paths.
{
 const g=chapters[4];heading(g,'FINAL YEAR DESIGN PROJECT','R.I.S.E');
 const frame=planeImage(videos.rise.texture,5.0,2.85);frame.rotation.y=.12;add(g,frame,-2.65,.05,0);
 text(g,'VR rehabilitation + educational support','Unity / C# / Hand-tracking gloves',5,.7,-2.6,-1.7,.1,{size:49,align:'center'});
 const nodes=[['Hand tracking','Custom glove interaction',1.7,1.2],['Visual feedback','Immersive learning',3.25,-.15],['VR rehabilitation','Educational support',1.6,-1.45]];
 nodes.forEach(([a,b,x,y],i)=>{floating(g,card(a,b,3.55,.88,{dark:true,accent:true,size:69}),x,y,.3,i);});
 for(const points of [[[1.7,.7],[1.7,.35],[3.25,.35],[3.25,.3]],[[3.25,-.65],[3.25,-1],[1.6,-1],[1.6,-1.05]]]){const curve=new T.CatmullRomCurve3(points.map(([x,y])=>new T.Vector3(x,y,.42)));add(g,new T.Mesh(new T.TubeGeometry(curve,32,.025,8,false),new T.MeshBasicMaterial({color:'#f28b60'})));}
}
// 06 / 2D game collection and the custom, textured 3D avatar.
{
 const g=chapters[5];heading(g,'SMALL DETAILS. BIG IMAGINATION.','Arcade worlds. Original characters.');
 const data=[['flappybird.jpg','FlappyBird'],['mrjungle.jpg','MrJungle'],['ninnitrap.jpg','NinniTrap']];data.forEach(([name,title],i)=>{const tile=planeImage(assets[name],2.5,1.7);tile.rotation.y=.1;floating(g,tile,-3.7+i*2.8,.35,-.1,i);text(g,title,'2D GAME',2.45,.7,-3.7+i*2.8,-.95,.15,{size:66,align:'center'});});
 const gltf=await new GLTFLoader().loadAsync('/models/avatar.glb');const avatar=gltf.scene;const diffuse=await loader.loadAsync('/models/avatar-basecolor.jpg');diffuse.colorSpace=T.SRGBColorSpace;diffuse.flipY=false;
 avatar.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.map=diffuse;o.material.color.set('white');o.material.metalness=0;o.material.metalnessMap=null;o.material.roughness=.8;o.castShadow=true;}});const bounds=new T.Box3().setFromObject(avatar),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());avatar.position.sub(center);const wrap=new T.Group();wrap.add(avatar);wrap.scale.setScalar(3.4/size.y);add(g,wrap,4.5,-.05,.5);g.userData.avatar=wrap;
 text(g,'BLENDER CHARACTERS','Kiki the Explorer / Mochi 3D / MyAvatar',8,.65,-.1,-1.7,.2,{size:64,align:'center'});
}
// 07 / Authentic award photo and academic/professional details.
{
 const g=chapters[6];heading(g,'LEARNING. MAKING. MOVING FORWARD.','Proof in the work.');
 const photo=planeImage(assets['GameConRunner.jpg'],4.3,3.25);photo.rotation.y=.12;add(g,photo,-2.6,-.1,0);
 floating(g,card('GameCon runner-up','The Signal Shutdown / Team project',4.8,1,{badge:'ACHIEVEMENT',size:67}),2.55,1.15,.2,1);
 floating(g,card('3.57 CGPA','NED University of Engineering & Technology',4.8,1,{badge:'ACADEMICS',size:67}),2.55,-.15,.25,2);
 floating(g,card('Unity game development','Internship / The Game Storm Studio',4.8,1,{badge:'EXPERIENCE',size:67}),2.55,-1.45,.3,3);
}
// 08 / Reflective glass identity and direct, readable call to action.
{
 const g=chapters[7];for(let i=0;i<5;i++){const bubble=new T.Mesh(new T.SphereGeometry(1.1,48,32),new T.MeshPhysicalMaterial({color:['#c6dbf1','#d8c4eb','#d3e8ef','#f0d0dd','#f0d8ba'][i],roughness:.08,transmission:.82,thickness:1,ior:1.35,metalness:.02,clearcoat:1}));floating(g,bubble,(i-2)*1.25,-.2,-.45-Math.abs(i-2)*.25,i);}
 text(g,'LET\'S BUILD SOMETHING TOGETHER.','',10,.7,0,2.6,.2,{size:75,align:'center'});
 text(g,'MUHAMMAD HUZAIFA','Game Designer / 3D Artist / Web3D Developer',9,1.2,0,1.4,1.25,{size:92,align:'center'});
 add(g,card('huzaifaraees6146@gmail.com','Karachi, Pakistan',7.6,1,{size:62,align:'center'}),0,-1.5,1.15);
}
const bubbles=[];for(let i=0;i<12;i++){const m=new T.Mesh(new T.SphereGeometry(.08+(i%3)*.07,20,16),new T.MeshPhysicalMaterial({color:i%2?'#d2c5e9':'#b9e3ee',transmission:.8,thickness:.35,roughness:.08,ior:1.38,iridescence:.4}));const x=Math.sin(i*2.2)*6.5,y=-1.3+(i%5)*.9,z=-2.5-(i%4);add(scene,m,x,y,z);bubbles.push({m,x,y,z});}
const overlayScene=new T.Scene(),overlayCamera=new T.OrthographicCamera(-1,1,1,-1,0,1),overlayMaterial=new T.MeshBasicMaterial({color:'#f0e8f4',transparent:true,opacity:0,depthTest:false,toneMapped:false});overlayScene.add(new T.Mesh(new T.PlaneGeometry(2,2),overlayMaterial));
const ease=n=>1-Math.pow(1-Math.max(0,Math.min(1,n)),3);
let current=0,previewing=false,rendering=false,previewStart=0;
function shotAt(time){for(let i=7;i>=0;i--)if(time>=starts[i])return i;return 0;}
async function seek(key,time){const {v,texture}=videos[key];const desired=Math.min(v.duration-.1,Math.max(.02,time));if(Math.abs(v.currentTime-desired)>.012){await new Promise((resolve,reject)=>{v.addEventListener('seeked',resolve,{once:true});v.addEventListener('error',reject,{once:true});v.currentTime=desired;});}texture.needsUpdate=true;}
async function draw(time,accurate=false){
 const shot=shotAt(time),local=time-starts[shot],u=local/lengths[shot];current=shot;chapters.forEach((g,i)=>g.visible=i===shot);dunes.visible=shot!==0;
 movers.forEach(({obj,x,y,z,phase})=>{obj.position.set(x,y+Math.sin(local*1.15+phase)*.07,z);obj.rotation.z=Math.sin(local*.6+phase)*.012;});bubbles.forEach(({m,x,y,z},i)=>{m.position.set(x,y+Math.sin(time*.7+i)*.15,z);});
 if(shot===0){camera.position.set(5.5-u*2.2,3.5-u*.7,9.8-u*.8);camera.lookAt(0,.5,0);}
 else {camera.position.set(Math.sin(local*.22)*.32+(shot===2?2.5:shot===4?.6:0),1.05+Math.sin(local*.15)*.12,shot===2?12.4:shot===6?11.3:12.8-u*.45);camera.lookAt(0,.35,0);}
 chapters[shot].position.y=(1-ease(local/.65))*.45;
 if(shot===3){const name=local<4?'wada':'signal';if(accurate)await seek(name,(local<4?20:4)+(local%4));else{videos[name].v.currentTime=(local<4?20:4)+(local%4);videos[name].texture.needsUpdate=true;}chapters[3].userData.screen.children[1].material.map=videos[name].texture;const c=chapters[3].userData.caption;if(c.userData.name!==name){c.children[1].material.map=label(name==='wada'?'WADA':'THE SIGNAL SHUTDOWN',name==='wada'?'Arabian open-world action adventure':'Survival / GameCon runner-up',6.7,.75,{size:73,badge:'UNITY / C#'});c.userData.name=name;}}
 if(shot===4){if(accurate)await seek('rise',43+local);else{videos.rise.v.currentTime=43+local;videos.rise.texture.needsUpdate=true;}}
 if(shot===5)chapters[5].userData.avatar.rotation.y=-.35+local*.18;
 renderer.autoClear=true;renderer.render(scene,camera);
 const fade=Math.max(local<.28?1-local/.28:0,local>lengths[shot]-.25?(local-lengths[shot]+.25)/.25:0);overlayMaterial.opacity=fade*.75;if(fade>0){renderer.autoClear=false;renderer.render(overlayScene,overlayCamera);renderer.autoClear=true;}
}
let raf=0;
function previewFrame(now){if(!previewing)return;const t=((now-previewStart)/1000)%48;draw(t);status.textContent=`Preview ${t.toFixed(1)} / 48 seconds`;raf=requestAnimationFrame(previewFrame);}
document.querySelector('#shot').onchange=async event=>{previewing=false;cancelAnimationFrame(raf);await draw(starts[Number(event.target.value)]+2,true);status.textContent='Shot preview ready';};
document.querySelector('#play').onclick=()=>{if(rendering)return;previewing=!previewing;if(previewing){previewStart=performance.now();raf=requestAnimationFrame(previewFrame);}else cancelAnimationFrame(raf);};
document.querySelector('#export').onclick=async()=>{if(rendering)return;previewing=false;cancelAnimationFrame(raf);rendering=true;document.querySelector('#export').disabled=true;try{let r=await fetch('/begin',{method:'POST'});if(!r.ok)throw Error(await r.text());for(let frame=0;frame<1440;frame++){await draw(frame/30,true);const blob=await new Promise(resolve=>renderer.domElement.toBlob(resolve,'image/jpeg',.94));r=await fetch('/frame?index='+frame,{method:'POST',headers:{'Content-Type':'image/jpeg'},body:blob});if(!r.ok)throw Error(await r.text());progress.value=frame+1;status.textContent=`Rendering ${frame+1} / 1440 frames (${Math.round((frame+1)/14.4)}%)`;}status.textContent='Encoding final MP4 with music and voice-over...';r=await fetch('/finish',{method:'POST'});if(!r.ok)throw Error(await r.text());status.textContent='COMPLETE: 48-second 1080p MP4 with audio';}catch(e){error.textContent=e.stack||e.message;status.textContent='Export failed';}rendering=false;document.querySelector('#export').disabled=false;};
await draw(2,true);status.textContent='Ready: 48 seconds / 1920 x 1080 / 30 fps';document.querySelector('#export').disabled=false;
