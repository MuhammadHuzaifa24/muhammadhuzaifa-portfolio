import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
// MIT WebXR Input Profiles skinned hand; retains a continuous anatomical mesh.
export async function createHand(){
 const hand=new T.Group(),gltf=await new GLTFLoader().loadAsync('/right-hand.glb'),model=gltf.scene;
 const skin=new T.MeshPhysicalMaterial({color:'#bd896d',roughness:.64,metalness:0,sheen:.1});
 model.traverse(o=>{if(o.isMesh){o.material=skin;o.castShadow=true;o.receiveShadow=true;}});
 model.updateMatrixWorld(true);
 const wrist=model.getObjectByName('wrist'),wristPosition=wrist.getWorldPosition(new T.Vector3());
 // The WebXR asset stores absolute joint poses. Make a real hierarchy before
 // bending, preserving every rest transform and skin inverse-bind matrix.
 const chains=[['thumb-metacarpal','thumb-phalanx-proximal','thumb-phalanx-distal','thumb-tip'],...['index','middle','ring','pinky'].map(n=>[n+'-finger-metacarpal',n+'-finger-phalanx-proximal',n+'-finger-phalanx-intermediate',n+'-finger-phalanx-distal',n+'-finger-tip'])];
 const joints=[];
 for(const names of chains){let parent=wrist;for(const name of names){const bone=model.getObjectByName(name);parent.attach(bone);joints.push({bone,rest:bone.quaternion.clone(),name});parent=bone;}}
 const offset=new T.Group();offset.add(model);model.position.sub(wristPosition);
 const oriented=new T.Group();oriented.add(offset);oriented.quaternion.setFromRotationMatrix(new T.Matrix4().set(0,0,1,0,0,-1,0,0,1,0,0,0,0,0,0,1));oriented.scale.setScalar(8.2);oriented.position.y=-.45;hand.add(oriented);
 // Forearm enters from frame-right; a sleeve gives the wrist an intentional,
 // clean silhouette instead of an open-ended floating tube.
 const arm=new T.Mesh(new T.CylinderGeometry(.19,.27,2.0,40),skin);arm.position.set(0,-1.57,0);arm.castShadow=true;hand.add(arm);
 const sleeve=new T.Mesh(new T.CylinderGeometry(.24,.35,2.7,40),new T.MeshStandardMaterial({color:'#3e4859',roughness:.9}));sleeve.position.set(0,-1.9,0);sleeve.castShadow=true;hand.add(sleeve);
 hand.userData.indexTip=model.getObjectByName('index-finger-tip');hand.userData.joints=joints;poseHand(hand,0,0);return hand;
}
export function poseHand(hand,time,tap=0){
 const axis=new T.Vector3(1,0,0);
 for(const {bone,rest,name} of hand.userData.joints){
  let flex=0;
  if(name.includes('index-finger'))flex=name.includes('proximal')?.015+tap*.08:name.includes('intermediate')?.025+tap*.05:0;
  else if(/middle|ring|pinky/.test(name))flex=name.includes('proximal')?.55:name.includes('intermediate')?.9:name.includes('distal')?.3:0;
  else if(name.includes('thumb'))flex=name.includes('proximal')?.13:0;
  bone.quaternion.copy(rest).multiply(new T.Quaternion().setFromAxisAngle(axis,-flex));
 }
 hand.updateMatrixWorld(true);
}
