import {createHand, poseHand} from './hand.js';
import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const W=1920,H=1080,FPS=30,DURATION=48,starts=[0,6,12,17,23,30,37,41,44],lengths=[6,6,5,6,7,7,4,3,4];
const status=document.querySelector('#status'),progress=document.querySelector('#progress'),error=document.querySelector('#error');
const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(W,H,false);renderer.setPixelRatio(1);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.querySelector('#stage').append(renderer.domElement);
const scene=new T.Scene(),camera=new T.PerspectiveCamera(39,W/H,.1,100);const pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(new RoomEnvironment(),.04).texture;scene.environmentIntensity=.65;
const background=document.createElement('canvas');background.width=2048;background.height=1024;const bc=background.getContext('2d'),bg=bc.createLinearGradient(0,0,2048,800);bg.addColorStop(0,'#b8dfef');bg.addColorStop(.5,'#c9d6f0');bg.addColorStop(1,'#f1d5e6');bc.fillStyle=bg;bc.fillRect(0,0,2048,1024);scene.background=new T.CanvasTexture(background);scene.background.colorSpace=T.SRGBColorSpace;
scene.add(new T.HemisphereLight('#f4f6ff','#9eadd7',1.25));const key=new T.DirectionalLight('#fff7e8',2.4);key.position.set(-5,9,6);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-13,right:13,top:13,bottom:-13,far:45});key.shadow.normalBias=.02;scene.add(key);const fill=new T.DirectionalLight('#a9cbff',1.2);fill.position.set(6,3,-4);scene.add(fill);
const floor=new T.Mesh(new T.PlaneGeometry(70,70),new T.MeshStandardMaterial({color:'#b8cce5',roughness:1,metalness:0,envMapIntensity:0}));floor.rotation.x=-Math.PI/2;floor.position.y=-2.15;floor.receiveShadow=true;scene.add(floor);
const dunes=new T.Group();{const geo=new T.PlaneGeometry(55,36,128,96);geo.rotateX(-Math.PI/2);const p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i)-20,e=T.MathUtils.smoothstep(-z,3,20);p.setZ(i,z);p.setY(i,-2.13+e*(.8+.55*Math.sin(x*.23+z*.22)+.35*Math.cos(z*.35)));}geo.computeVertexNormals();const dune=new T.Mesh(geo,new T.MeshStandardMaterial({color:'#a9bddd',roughness:1,metalness:0,envMapIntensity:.2}));dune.receiveShadow=true;dunes.add(dune);}scene.add(dunes);
const glass=new T.MeshPhysicalMaterial({color:'#dcecff',roughness:.12,metalness:.02,transmission:.68,thickness:.38,ior:1.42,transparent:true,opacity:1,clearcoat:1});
const plastic=c=>new T.MeshStandardMaterial({color:c,roughness:.35,metalness:.08});
function box(w,h,d,c='#dae7f7',r=.1,mat){const m=new T.Mesh(new RoundedBoxGeometry(w,h,d,4,r),mat||plastic(c));m.castShadow=true;m.receiveShadow=true;return m;}
function add(g,obj,x=0,y=0,z=0){obj.position.set(x,y,z);g.add(obj);return obj;}
function tex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;}
function label(title,sub='',w=3,h=.75,{dark=false,badge='',size=64,align='left'}={}){return tex(1400,Math.round(1400*h/w),(c,cw,ch)=>{
 const pad=46;let bw=0;if(badge){c.font='bold 27px Arial';bw=c.measureText(badge).width+40;}
 const available=cw-pad*2-(badge?bw+32:0),x=align==='center'?cw/2:pad;
 const fit=(value,initial,weight,max)=>{let px=initial;c.font=`${weight} ${px}px Arial`;while(c.measureText(value).width>max&&px>16){px--;c.font=`${weight} ${px}px Arial`;}return px;};
 c.textAlign=align;c.fillStyle=dark?'#ffffff':'#283549';fit(title,size,'600',available);c.fillText(title,x,ch*(sub?.40:.64));
 if(sub){c.fillStyle=dark?'#cddaf0':'#62758d';fit(sub,34,'400',cw-pad*2);c.fillText(sub,x,ch*.79);}
 if(badge){c.textAlign='left';c.font='bold 27px Arial';c.fillStyle='#f18a5c';c.beginPath();c.roundRect(cw-bw-28,18,bw,42,17);c.fill();c.fillStyle='white';c.fillText(badge,cw-bw-8,48);}
 });}
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
function heading(g,kicker,title){text(g,kicker,'',6.8,.26,0,3,0,{size:30,align:'center'});}

// 01 / A tangible pastel workspace, with Huzaifa's portfolio on the laptop.
{
 const g=chapters[0];add(g,box(12,.28,6,'#b9dbe9',.16),0,-1.35,0);
 const laptop=new T.Group();add(g,laptop,-1.2,-1.14,.1);laptop.scale.setScalar(.85);add(laptop,box(5.5,.16,3.4,'#343a43',.1));
 const keyboard=tex(1200,650,(c,w,h)=>{c.fillStyle='#353b45';c.fillRect(0,0,w,h);c.fillStyle='#171c23';for(let row=0;row<5;row++)for(let col=0;col<13;col++)c.fillRect(55+col*84,30+row*65,72,52);c.fillStyle='#5e6671';c.fillRect(410,390,390,210);});const keys=surface(keyboard,5,2.9);keys.rotation.x=-Math.PI/2;add(laptop,keys,0,.091,0);
 const screen=new T.Group();add(laptop,screen,0,.06,-1.5);screen.rotation.x=-.12;add(screen,box(5.5,3.35,.16,'#252a32',.12),0,1.65,0);
 const intro=tex(1600,950,(c,w,h)=>{const gradient=c.createLinearGradient(0,0,w,h);gradient.addColorStop(0,'#e0eff8');gradient.addColorStop(1,'#f3e3ec');c.fillStyle=gradient;c.fillRect(0,0,w,h);c.fillStyle='#61718d';c.font='30px Arial';c.fillText('A PORTFOLIO OF PLAYABLE IDEAS',90,110);c.fillStyle='#27344a';c.font='bold 125px Arial';c.fillText('MUHAMMAD',85,330);c.fillStyle='#ed895c';c.fillText('HUZAIFA',85,470);c.fillStyle='#657893';c.font='39px Arial';c.fillText('Game Designer / 3D Artist',90,585);c.fillText('Web3D & VR Developer',90,645);c.font='27px Arial';c.fillText('NED University of Engineering and Technology',90,805);});add(screen,surface(intro,5.22,3.08),0,1.65,.091);
 for(let i=0;i<3;i++){const b=box(1.7,.22,1.25,['#d6b9d7','#f4d3ba','#bdcde8'][i],.05);b.rotation.y=.08*(i-1);add(g,b,-4.9,-1.04+i*.24,-1.1);}
 add(g,box(.8,1.15,.8,'#e2c9e9',.16,glass.clone()),4,-.64,-.8);
 for(let i=0;i<3;i++){const pencil=new T.Mesh(new T.CylinderGeometry(.045,.045,1.6,12),plastic(i?'#c1b9e6':'#f69e62'));pencil.rotation.z=(i-1)*.14;add(g,pencil,3.8+i*.19,.1,-.8);}
 const phone=box(1.2,.13,2.2,'#bfcce4',.14);phone.rotation.y=-.3;add(g,phone,3.9,-1.1,1.4);const phoneface=surface(label('HUZAIFA','CREATIVE WORLDS',1.1,2,{size:94,align:'center'}),1.1,2);phoneface.rotation.x=-Math.PI/2;phoneface.rotation.z=.3;add(g,phoneface,3.9,-1.02,1.4);
 // Identity appears only on the laptop display, leaving the wall clear.
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
 const screen=planeImage(videos.wada.texture,7,3.94);add(g,screen,0,.65,0);g.userData.screen=screen;
 const c=card('WADA','Arabian open-world action adventure',6.7,.75,{badge:'UNITY / BLENDER',size:73});add(g,c,0,-1.88,.35);g.userData.caption=c;
 // Project labels live beneath the display rather than obscuring gameplay.
}
// 05 / R.I.S.E as a connected, physical workflow, echoing the reference's orange paths.
{
 const g=chapters[4];heading(g,'FINAL YEAR DESIGN PROJECT','R.I.S.E');
 const frame=planeImage(videos.rise.texture,5.0,2.85);frame.rotation.y=.12;add(g,frame,-2.8,.35,0);
 text(g,'VR rehabilitation + educational support','Unity / C# / Hand-tracking gloves',5,.7,-2.8,-1.65,.1,{size:49,align:'center'});
 const nodes=[['Hand tracking','Custom glove interaction',2.6,1.2],['Visual feedback','Immersive learning',3.25,-.15],['VR rehabilitation','Educational support',2.6,-1.45]];
 nodes.forEach(([a,b,x,y],i)=>{floating(g,card(a,b,3.55,.88,{dark:true,accent:true,size:69}),x,y,.3,i);});
 for(const points of [[[2.6,.7],[2.6,.35],[3.25,.35],[3.25,.3]],[[3.25,-.65],[3.25,-1],[2.6,-1],[2.6,-1.05]]]){const curve=new T.CatmullRomCurve3(points.map(([x,y])=>new T.Vector3(x,y,.42)));add(g,new T.Mesh(new T.TubeGeometry(curve,32,.025,8,false),new T.MeshBasicMaterial({color:'#f28b60'})));}
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
const originalChapters=[...chapters];
const avatarTemplate=originalChapters[5].userData.avatar;
function avatarCopy(height){const a=avatarTemplate.clone(true);a.position.set(0,0,0);a.rotation.set(0,0,0);a.scale.multiplyScalar(height/3.4);return a;}
const introAvatar=avatarCopy(3.6);add(originalChapters[0],introAvatar,3.05,.66,.8);originalChapters[0].userData.heroAvatar=introAvatar;
const pedestal=new T.Mesh(new T.CylinderGeometry(.65,.75,.07,48),plastic('#d3e3f2'));add(originalChapters[0],pedestal,3.05,-1.17,.8);
// A complete pastel desk set: window, wall slats, hanging headphones and pegboard.
const room=originalChapters[0];add(room,box(13,5.6,.16,'#cbdce9',.08),0,.65,-3.1);
const viewTexture=tex(800,900,(c,w,h)=>{const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#b6dcf2');sky.addColorStop(.55,'#d5d5ed');sky.addColorStop(1,'#f1d4ce');c.fillStyle=sky;c.fillRect(0,0,w,h);for(let i=0;i<3;i++){c.fillStyle=['#b4c7e2','#b8badc','#d5c1d9'][i];c.beginPath();c.moveTo(0,h);c.lineTo(0,500+i*80);c.bezierCurveTo(220,350+i*130,490,700-i*70,w,410+i*140);c.lineTo(w,h);c.closePath();c.fill();}});
add(room,surface(viewTexture,3.4,3.3),-4,1,-2.99);
for(const side of [-1,1]){add(room,box(.12,3.55,.15,'#a4c1df',.03),-4+side*1.76,1,-2.85);add(room,box(3.6,.12,.15,'#a4c1df',.03),-4,1+side*1.76,-2.85);}add(room,box(.065,3.4,.1,'#deedf4',.02),-4,1,-2.77);
for(let i=0;i<9;i++)add(room,box(.13,5.3,.075,'#dfc4d0',.02),-1.9+i*.19,.65,-2.97);
const phones=new T.Group();add(room,phones,-1.1,1.55,-2.7);add(phones,new T.Mesh(new T.TorusGeometry(.56,.075,12,40,Math.PI),plastic('#ecdfdc')));
for(const side of [-1,1])add(phones,box(.22,.48,.28,'#aac6bc',.1),side*.56,-.12,.04);
add(room,box(3.4,4.2,.1,'#bed4e8',.06),4.3,.85,-2.95);
const peg=new T.InstancedMesh(new T.CircleGeometry(.025,8),new T.MeshBasicMaterial({color:'#819db9'}),70);const pegPose=new T.Object3D();for(let i=0;i<70;i++){pegPose.position.set(2.95+(i%7)*.43,-.8+Math.floor(i/7)*.36,-2.89);pegPose.updateMatrix();peg.setMatrixAt(i,pegPose.matrix);}room.add(peg);

// A real 27-piece cube, with animated assembly and technology marks on its faces.
const cubeChapter=new T.Group(),cubeAssembly=new T.Group();cubeChapter.add(cubeAssembly);cubeAssembly.position.y=.35;const cubePieces=[];
const logoNames=['Unity','Blender','React','Threedotjs','Csharp','Python'];let cubeIndex=0;
for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++){
 const piece=new T.Group(),i=cubeIndex++,tint=['#c6dff3','#d2c4e5','#efd2ba'][Math.abs(x+y+z)%3];
 const material=(i%4===0)?new T.MeshPhysicalMaterial({color:tint,transmission:.6,roughness:.1,thickness:.65,ior:1.4,clearcoat:1}):plastic(tint);
 add(piece,box(.79,.79,.79,tint,.075,material));
 for(const side of ['front','right','top']){if((side==='front'&&z!==1)||(side==='right'&&x!==1)||(side==='top'&&y!==1))continue;const icon=surface(logos[logoNames[(x+1+(y+1)*3+(z+1)*2)%6]],.43,.43);if(side==='front')add(piece,icon,0,0,.402);if(side==='right'){icon.rotation.y=Math.PI/2;add(piece,icon,.402,0,0);}if(side==='top'){icon.rotation.x=-Math.PI/2;add(piece,icon,0,.402,0);}}
 cubeAssembly.add(piece);cubePieces.push({piece,base:new T.Vector3(x*.84,y*.84,z*.84),i});
}
const coreOrb=new T.Mesh(new T.IcosahedronGeometry(.25,3),new T.MeshPhysicalMaterial({color:'#f7b276',roughness:.2,emissive:'#e99b57',emissiveIntensity:.2}));add(cubeChapter,coreOrb,0,2.35,0);

for(let i=0;i<3;i++){const ring=new T.Mesh(new T.RingGeometry(1.6+i*.35,1.62+i*.35,80),new T.MeshBasicMaterial({color:'#a9c9ef',transparent:true,opacity:.15-i*.035,depthWrite:false}));ring.rotation.x=-Math.PI/2;add(cubeChapter,ring,0,-2.12+i*.004,0);}
scene.add(cubeChapter);
// Reference-style stacked UI: a tangible phone, floating actions and an articulated hand.
const handChapter=new T.Group(),phone=new T.Group();add(handChapter,phone,-1.2,.35,-.15);phone.rotation.set(-.12,-.2,-.18);
for(let i=4;i>=1;i--)add(phone,box(2.95,4.85,.1,'#ccdff3',.23,glass.clone()),-i*.13,-i*.045,-i*.2);
add(phone,box(2.95,4.85,.22,'#bcc8e1',.25));add(phone,box(2.8,4.68,.08,'#e0ebf7',.22,glass.clone()),0,0,.15);
const phoneUI=tex(900,1450,(c,w,h)=>{const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'#eaf5fa');g.addColorStop(1,'#dedcf3');c.fillStyle=g;c.fillRect(0,0,w,h);c.fillStyle='#ef8b5c';c.font='bold 62px Segoe UI';c.fillText('Huzaifa',72,125);c.fillStyle='#344561';c.font='32px Segoe UI';c.fillText('Game designer / 3D artist',72,190);c.fillStyle='#ffffffaa';c.beginPath();c.roundRect(60,270,780,470,34);c.fill();const img=assets['myavatar.png'].image;const fit=Math.min(420/img.width,380/img.height);c.drawImage(img,450-img.width*fit/2,300,img.width*fit,img.height*fit);c.fillStyle='#273a55';c.font='600 57px Segoe UI';c.fillText('Ask Huzaifa anything',72,845);c.fillStyle='#687b94';c.font='33px Segoe UI';c.fillText('Games, immersive ideas and the web.',72,910);c.fillStyle='#d2d0ed';c.beginPath();c.roundRect(60,1000,370,160,22);c.fill();c.fillStyle='#c8e3f1';c.beginPath();c.roundRect(470,1000,370,160,22);c.fill();c.fillStyle='#344561';c.font='38px Segoe UI';c.fillText('Explore projects',86,1090);c.fillText('Meet the maker',491,1090);c.fillStyle='#bac8e4';c.beginPath();c.roundRect(60,1240,780,110,28);c.fill();c.fillStyle='#657591';c.font='32px Segoe UI';c.fillText('Unity + Blender + Web3D',120,1307);});add(phone,surface(phoneUI,2.65,4.43),0,0,.202);
const selected=card('Explore my projects','WADA / R.I.S.E / Interactive worlds',3.9,1.05,{size:65});add(handChapter,selected,.65,-.85,1);selected.rotation.z=-.04;
const touchRing=new T.Mesh(new T.RingGeometry(.1,.13,48),new T.MeshBasicMaterial({color:'#f18a5c',transparent:true,opacity:0,side:T.DoubleSide,depthWrite:false}));add(handChapter,touchRing,2.1,-.8,1.27);
const hand=await createHand();hand.scale.setScalar(1.1);hand.rotation.set(.10,-.12,1.48);add(handChapter,hand,4.5,.3,1.4);
scene.add(handChapter);
// Make the custom avatar the hero, rather than a tiny model at the edge.
const characterChapter=originalChapters[5],characterAvatar=avatarCopy(4.0);characterChapter.clear();add(characterChapter,characterAvatar,0,-.1,.1);characterChapter.userData.avatar=characterAvatar;
const characterCards=[];
for(const [i,name,title,x,y] of [[0,'kiki-the-explorer.png','Kiki the Explorer',-3.8,.8],[1,'mochi-3d.png','Mochi 3D',3.8,.9]]){const p=planeImage(assets[name],2.7,2.1);p.rotation.y=x<0?.22:-.22;add(characterChapter,p,x,y,-.1);text(characterChapter,title,'BLENDER WORK',2.7,.65,x,y-1.45,.1,{size:62,align:'center'});characterCards.push(p);}
floating(characterChapter,card('FlappyBird / MrJungle / NinniTrap','Original 2D arcade worlds',4.8,.8,{size:53}),0,-1.6,1.1,0);
text(characterChapter,'MYAVATAR','CUSTOM 3D CHARACTER',3.6,.6,0,2.45,0,{size:61,align:'center'});
// Closing: the same custom avatar beside a compact personal glass identity.
const outro=originalChapters[7];outro.clear();const outroAvatar=avatarCopy(3.8);add(outro,outroAvatar,-3,-.2,.5);outro.userData.heroAvatar=outroAvatar;
const identity=card('MUHAMMAD HUZAIFA','Game Designer / 3D Artist / Web3D Developer',6.2,1.5,{size:69});add(outro,identity,1.4,.85,.4);identity.rotation.y=-.1;
add(outro,card('huzaifaraees6146@gmail.com','Let us build something together.',6.2,1,{size:59}),1.4,-1,.5);
text(outro,'CREATE. PLAY. EXPLORE.','',7,.45,0,2.8,0,{size:52,align:'center'});
scene.remove(originalChapters[2]);chapters.splice(0,chapters.length,originalChapters[0],originalChapters[1],cubeChapter,handChapter,originalChapters[3],originalChapters[4],characterChapter,originalChapters[6],outro);
function animateRevision(shot,local,u){
 if(shot===0)introAvatar.rotation.y=-.2+Math.sin(local*.5)*.1;
 if(shot===2){const spread=local<2?T.MathUtils.lerp(2.25,1,ease(local/2)):1+.75*Math.sin(Math.PI*(local-2)/3);cubeAssembly.rotation.set(.12+Math.sin(local*.4)*.1,.25+local*.35,.025);cubePieces.forEach(({piece,base,i})=>{piece.position.copy(base).multiplyScalar(spread);piece.rotation.set(Math.sin(local+i)*.02*(spread-1),Math.cos(local+i)*.04*(spread-1),0);});coreOrb.position.y=2.25+Math.sin(local)*.15;}
 if(shot===3){const contact=Math.exp(-Math.pow((local-2.7)/.19,2)),enter=ease(local/1.4),leave=ease(Math.max(0,local-4.5)/1.2);poseHand(hand,local,contact);hand.position.set(6.5-3.1*enter+2.8*leave-contact*.08,-.43,1.85-contact*.65);selected.position.set(.2+ease(Math.max(0,local-2.8)/.8)*.45,-.85,1);selected.rotation.y=0;selected.scale.setScalar(1-contact*.025);phone.rotation.y=-.22;hand.updateMatrixWorld(true);const tip=handChapter.worldToLocal(hand.userData.indexTip.getWorldPosition(new T.Vector3()));hand.position.addScaledVector(new T.Vector3(1.85,-.8,1.12).sub(tip),contact);touchRing.material.opacity=local>2.7&&local<3.35?(1-(local-2.7)/.65)*.8:0;touchRing.scale.setScalar(1+Math.max(0,local-2.7)*3);touchRing.position.set(1.85,-.8,1.14);}
 if(shot===6){characterAvatar.rotation.y=-.12+local*.13;characterCards.forEach((p,i)=>{p.rotation.y=(i?-.22:.22)+Math.sin(local*.6)*.06;});}
 if(shot===8){outroAvatar.rotation.y=-.12+Math.sin(local*.5)*.07;identity.position.z=.4+u*.2;}
}

let current=0,previewing=false,rendering=false,previewStart=0;
function shotAt(time){for(let i=chapters.length-1;i>=0;i--)if(time>=starts[i])return i;return 0;}
async function seek(key,time){const {v,texture}=videos[key];const desired=Math.min(v.duration-.1,Math.max(.02,time));if(Math.abs(v.currentTime-desired)>.012){await new Promise((resolve,reject)=>{v.addEventListener('seeked',resolve,{once:true});v.addEventListener('error',reject,{once:true});v.currentTime=desired;});}texture.needsUpdate=true;}
async function draw(time,accurate=false){
 const shot=shotAt(time),local=time-starts[shot],u=local/lengths[shot];current=shot;chapters.forEach((g,i)=>g.visible=i===shot);dunes.visible=shot!==0;
 movers.forEach(({obj,x,y,z,phase})=>{obj.position.set(x,y+Math.sin(local*1.15+phase)*.07,z);obj.rotation.z=Math.sin(local*.6+phase)*.012;});bubbles.forEach(({m,x,y,z},i)=>{m.position.set(x,y+Math.sin(time*.7+i)*.15,z);});
 if(shot===0){camera.position.set(2.4-u*.9,2.6-u*.35,10.8-u*.4);camera.lookAt(0,.35,.2);}
 else {const orbit=Math.sin(local*.3)*.25;camera.position.set((shot===3?2.3:shot===2?2:shot===5?1.4:0)+orbit,shot===3?2.2:1.1,shot===2?9.7:shot===6?10.8:11.8-u*.4);camera.lookAt(0,.15,0);}

 chapters[shot].position.y=(1-ease(local/.65))*.45;
 if(shot===4){const name=local<3.5?'wada':'signal';if(accurate)await seek(name,(local<3.5?20:4)+(local%3.5));else{videos[name].v.currentTime=(local<3.5?20:4)+(local%3.5);videos[name].texture.needsUpdate=true;}chapters[4].userData.screen.children[1].material.map=videos[name].texture;const c=chapters[4].userData.caption;if(c.userData.name!==name){c.children[1].material.map=label(name==='wada'?'WADA':'THE SIGNAL SHUTDOWN',name==='wada'?'Arabian open-world action adventure':'Survival / GameCon runner-up',6.7,.75,{size:73,badge:'UNITY / C#'});c.userData.name=name;}}
 if(shot===5){if(accurate)await seek('rise',43+local);else{videos.rise.v.currentTime=43+local;videos.rise.texture.needsUpdate=true;}}
 if(shot===6)chapters[6].userData.avatar.rotation.y=-.18+local*.11;
 animateRevision(shot,local,u);

 renderer.autoClear=true;renderer.render(scene,camera);
 const fade=Math.max(local<.28?1-local/.28:0,local>lengths[shot]-.25?(local-lengths[shot]+.25)/.25:0);overlayMaterial.opacity=fade*.75;if(fade>0){renderer.autoClear=false;renderer.render(overlayScene,overlayCamera);renderer.autoClear=true;}
}
let raf=0;
function previewFrame(now){if(!previewing)return;const t=((now-previewStart)/1000)%48;draw(t);status.textContent=`Preview ${t.toFixed(1)} / 48 seconds`;raf=requestAnimationFrame(previewFrame);}
document.querySelector('#shot').onchange=async event=>{previewing=false;cancelAnimationFrame(raf);await draw(starts[Number(event.target.value)]+2,true);status.textContent='Shot preview ready';};
document.querySelector('#play').onclick=()=>{if(rendering)return;previewing=!previewing;if(previewing){previewStart=performance.now();raf=requestAnimationFrame(previewFrame);}else cancelAnimationFrame(raf);};
document.querySelector('#export').onclick=async()=>{if(rendering)return;previewing=false;cancelAnimationFrame(raf);rendering=true;document.querySelector('#export').disabled=true;try{let r=await fetch('/begin',{method:'POST'});if(!r.ok)throw Error(await r.text());for(let frame=0;frame<1440;frame++){await draw(frame/30,true);const blob=await new Promise(resolve=>renderer.domElement.toBlob(resolve,'image/jpeg',.94));r=await fetch('/frame?index='+frame,{method:'POST',headers:{'Content-Type':'image/jpeg'},body:blob});if(!r.ok)throw Error(await r.text());progress.value=frame+1;status.textContent=`Rendering ${frame+1} / 1440 frames (${Math.round((frame+1)/14.4)}%)`;}status.textContent='Encoding final MP4 with music and voice-over...';r=await fetch('/finish',{method:'POST'});if(!r.ok)throw Error(await r.text());status.textContent='COMPLETE: 48-second 1080p MP4 with audio';}catch(e){error.textContent=e.stack||e.message;status.textContent='Export failed';}rendering=false;document.querySelector('#export').disabled=false;};
await draw(2,true);status.textContent='Ready: 48 seconds / 1920 x 1080 / 30 fps';document.querySelector('#export').disabled=false;
// Dedicated CLI render mode. It uses its own offscreen browser process/profile.
// No browser automation, existing tabs, debug port or native app input is needed.
const renderJob=new URLSearchParams(location.search).get('renderJob');
if(renderJob==='qa'){
 try{const times=new URLSearchParams(location.search).has('quick')?[2,19.7,33.5]:[.5,2,5,7,10,13,15,17.5,19,19.7,20.3,21.5,22.5,23.5,26,28.5,31,33.5,36,37.5,40,41.5,43,45,47.2];
 for(const [index,time] of times.entries()){await draw(time,true);const blob=await new Promise(r=>renderer.domElement.toBlob(r,'image/jpeg',.95));const response=await fetch('/qa-frame?index='+index,{method:'POST',headers:{'Content-Type':'image/jpeg'},body:blob});if(!response.ok)throw Error('QA frame save failed');}
 await fetch('/qa-complete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phase:'complete',times})});
 }catch(e){await fetch('/qa-complete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phase:'error',error:e.stack||e.message})});}
}else if(renderJob==='export')document.querySelector('#export').click();

