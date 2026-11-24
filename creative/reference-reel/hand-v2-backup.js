import * as T from 'three';
export function createHand(){
 const hand=new T.Group();
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d'),pixels=ctx.createImageData(128,128);let seed=17;
 for(let i=0;i<pixels.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;const n=120+(seed%20);pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=n;pixels.data[i+3]=255;}ctx.putImageData(pixels,0,0);const bump=new T.CanvasTexture(canvas);bump.wrapS=bump.wrapT=T.RepeatWrapping;bump.repeat.set(3,3);
 const skin=new T.MeshPhysicalMaterial({color:'#c9967c',roughness:.55,metalness:0,clearcoat:.035,sheen:.12,sheenColor:new T.Color('#edc0a8'),bumpMap:bump,bumpScale:.008});
 const nail=new T.MeshPhysicalMaterial({color:'#e9c6b5',roughness:.37,clearcoat:.16});
 const mesh=(geo,mat=skin)=>{const m=new T.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;return m;};
 const ellipsoid=(parent,x,y,z,sx,sy,sz,mat=skin)=>{const m=mesh(new T.SphereGeometry(1,32,20),mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m;};
 const palm=ellipsoid(hand,0,-.05,0,.52,.69,.19);palm.rotation.z=-.03;
 ellipsoid(hand,-.28,-.2,.055,.27,.43,.17);ellipsoid(hand,0,-.66,0,.28,.28,.145);
 const arm=mesh(new T.CylinderGeometry(.20,.36,2.6,32));arm.position.set(.02,-1.2,-.01);hand.add(arm);ellipsoid(hand,.02,-2.5,-.01,.36,.24,.26);
 const fingers=[];
 for(const [i,x,length,width] of [[0,-.33,.94,.111],[1,-.09,1.08,.115],[2,.17,1,.106],[3,.39,.8,.087]]){
  const root=new T.Group();root.position.set(x,.43-Math.abs(x)*.13,0);hand.add(root);ellipsoid(hand,x,.43-Math.abs(x)*.13,0,width*1.15,.18,.15);
  let parent=root;const bones=[];
  for(let j=0;j<3;j++){const bone=new T.Group();parent.add(bone);const len=length*[.43,.32,.25][j],r=width*(1-j*.15);const segment=mesh(new T.CylinderGeometry(r*.89,r,len,24));segment.position.y=len/2;bone.add(segment);ellipsoid(bone,0,len,0,r*.91,r*.91,r*.91);ellipsoid(bone,0,.025,0,r,.08,r);
   if(j===2)ellipsoid(bone,0,len-.045,r*.83,r*.64,len*.43,.014,nail);
   bones.push(bone);parent=new T.Group();parent.position.y=len;bone.add(parent);
  }
  fingers.push(bones);
 }
 const thumbRoot=new T.Group();thumbRoot.position.set(-.42,-.21,.02);thumbRoot.rotation.z=-.9;hand.add(thumbRoot);const thumb=[];let parent=thumbRoot;
 for(let j=0;j<2;j++){const b=new T.Group();parent.add(b);const length=j?.34:.4,r=j?.108:.138;const m=mesh(new T.CylinderGeometry(r*.88,r,length,24));m.position.y=length/2;b.add(m);ellipsoid(b,0,length,0,r*.9,r*.9,r*.9);if(j)ellipsoid(b,0,length-.05,r*.8,.07,.13,.015,nail);thumb.push(b);parent=new T.Group();parent.position.y=length;b.add(parent);}
 // Subtle palm creases, kept soft enough for the close-up lighting.
 for(const coords of [[[-.34,-.12,.17],[-.08,-.18,.193],[.29,-.05,.16]],[[-.28,.15,.17],[.02,.2,.19],[.3,.25,.14]]]){const curve=new T.CatmullRomCurve3(coords.map(p=>new T.Vector3(...p)));const crease=mesh(new T.TubeGeometry(curve,20,.004,5,false),new T.MeshStandardMaterial({color:'#bc8d77',transparent:true,opacity:.35,roughness:1}));hand.add(crease);}
 hand.userData={fingers,thumb,thumbRoot};return hand;
}
export function poseHand(hand,time,pinch=0){
 const {fingers,thumb,thumbRoot}=hand.userData;
 fingers.forEach((bones,i)=>bones.forEach((bone,j)=>{bone.rotation.x=(i===0 ? [.02,.08,.04][j]+pinch*[.2,.6,.35][j] : [.55,.8,.55][j])+.025*Math.sin(time*1.4+i);bone.rotation.z=(i-1.5)*.018;}));
 thumbRoot.rotation.z=-.85+pinch*.4;thumbRoot.rotation.x=.25;thumb[0].rotation.x=.22+pinch*.28;thumb[1].rotation.x=.2+pinch*.3;
}
