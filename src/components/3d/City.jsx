import { useLayoutEffect, useMemo, useRef } from 'react';
import { Object3D } from 'three';
import { CITY_BLOCKS, CITY_SIZE, LAMP_POSITIONS } from './cityLayout';

function Box({ position, size, color, ...props }) {
  return <mesh position={position} castShadow receiveShadow><boxGeometry args={size} /><meshStandardMaterial color={color} roughness={.85} {...props} /></mesh>;
}
function Windows({ dark }) {
  const ref = useRef();
  const transforms = useMemo(() => {
    const matrices = [], dummy = new Object3D();
    CITY_BLOCKS.forEach(b => {
      for (let floor = 1; floor < b.height - .4; floor += 1.15) {
        for (const side of [-1,1]) for (const offset of [-.95,0,.95]) {
          dummy.position.set(b.x + offset, floor, b.z + side * (b.depth / 2 + .025)); dummy.rotation.y = 0; dummy.updateMatrix(); matrices.push(dummy.matrix.clone());
          dummy.position.set(b.x + side * (b.width / 2 + .025), floor, b.z + offset); dummy.rotation.y = Math.PI / 2; dummy.updateMatrix(); matrices.push(dummy.matrix.clone());
        }
      }
    });
    return matrices;
  }, []);
  useLayoutEffect(() => { transforms.forEach((m,i)=>ref.current.setMatrixAt(i,m)); ref.current.instanceMatrix.needsUpdate = true; }, [transforms]);
  return <instancedMesh ref={ref} args={[null,null,transforms.length]}><boxGeometry args={[.46,.54,.035]} /><meshStandardMaterial color={dark ? '#ffe7ad' : '#698897'} emissive="#ffbd62" emissiveIntensity={dark ? 2 : 0} roughness={.6} /></instancedMesh>;
}
function Tree({ x, z }) {
  return <group position={[x,0,z]}><Box position={[0,.5,0]} size={[.23,1,.23]} color="#95765c" /><mesh position={[0,1.5,0]} castShadow><icosahedronGeometry args={[.85,0]} /><meshStandardMaterial color="#83a98b" roughness={1} /></mesh></group>;
}
function Crosswalks() {
  const mesh = useRef();
  useLayoutEffect(() => {
    const dummy = new Object3D(); let i = 0;
    for (const direction of [-1,1]) for (let stripe=0;stripe<6;stripe++) {
      dummy.position.set(direction*(3.6+stripe*.45),.02,0); dummy.scale.set(.25,.025,5.3); dummy.updateMatrix(); mesh.current.setMatrixAt(i++,dummy.matrix);
      dummy.position.set(0,.025,direction*(3.6+stripe*.45)); dummy.scale.set(5.3,.025,.25); dummy.updateMatrix(); mesh.current.setMatrixAt(i++,dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  }, []);
  return <instancedMesh ref={mesh} args={[null,null,24]} receiveShadow><boxGeometry /><meshStandardMaterial color="#e4e5dc" roughness={1} /></instancedMesh>;
}
function Bench({ position, rotation = 0 }) {
  return <group position={position} rotation={[0,rotation,0]}>
    {[-.55,.55].map(x=><Box key={x} position={[x,.25,0]} size={[.12,.5,.6]} color="#536475" />)}
    {[-.18,0,.18].map(z=><Box key={z} position={[0,.55,z]} size={[1.6,.1,.14]} color="#bd9871" />)}
    <Box position={[0,.9,.28]} size={[1.6,.4,.09]} color="#bd9871" />
  </group>;
}
function ParkDetails({ dark }) {
  return <group>
    <Bench position={[-7,.1,9.6]} /><Bench position={[-4.3,.1,7]} rotation={Math.PI/2} />
    <group position={[-9.5,.1,7]}>
      <mesh receiveShadow><cylinderGeometry args={[.8,.9,.28,24]} /><meshStandardMaterial color={dark ? '#62778a' : '#dce3df'} roughness={.9} /></mesh>
      <mesh position={[0,.15,0]}><cylinderGeometry args={[.68,.68,.035,24]} /><meshStandardMaterial color="#7ec9cf" metalness={.15} roughness={.25} emissive="#6ebaca" emissiveIntensity={dark ? .45 : .05} /></mesh>
      <mesh position={[0,.5,0]}><cylinderGeometry args={[.04,.08,.7,8]} /><meshStandardMaterial color="#a5e0e3" transparent opacity={.65} /></mesh>
      <mesh position={[0,.88,0]}><sphereGeometry args={[.1,10,8]} /><meshStandardMaterial color="#a5e0e3" emissive="#7ec9cf" emissiveIntensity={.3} /></mesh>
    </group>
    {[[-10,10],[-4,4],[10,-10],[-10,-4]].map(([x,z],i)=><group key={i} position={[x,.12,z]}>
      <Box position={[0,.2,0]} size={[.7,.4,.7]} color="#b4bfba" />
      <mesh position={[0,.6,0]}><icosahedronGeometry args={[.4,0]} /><meshStandardMaterial color={['#c48f8d','#89b5a2','#c9b98f','#9baed0'][i]} roughness={1} /></mesh>
    </group>)}
  </group>;
}
export default function City({ dark }) {
  const road = dark ? '#293647' : '#88969f', curb = dark ? '#465365' : '#dfe2df';
  return <group>
    <Box position={[0,-.3,0]} size={[CITY_SIZE+.8,.5,CITY_SIZE+.8]} color={dark ? '#283b3c' : '#c5d4c1'} />
    {[-13,0,13].map(offset => <group key={offset}>
      <Box position={[offset,-.025,0]} size={[offset===0?6:4,.06,CITY_SIZE]} color={road} />
      <Box position={[0,-.02,offset]} size={[CITY_SIZE,.06,offset===0?6:4]} color={road} />
      {Array.from({length:20},(_,i)=>-20+i*2.1).filter(n=>Math.abs(n)>3.5 && Math.abs(Math.abs(n)-13)>2.5).map(n=><group key={n}><Box position={[offset,.02,n]} size={[.08,.015,.8]} color="#f4f0d9" /><Box position={[n,.025,offset]} size={[.8,.015,.08]} color="#f4f0d9" /></group>)}
    </group>)}
    <Crosswalks />
    {CITY_BLOCKS.map((b,i)=><group key={i}>
      <Box position={[b.x,.04,b.z]} size={[b.width+1,.17,b.depth+1]} color={curb} />
      <Box position={[b.x,b.height/2+.15,b.z]} size={[b.width,b.height,b.depth]} color={b.color} />
      <Box position={[b.x,b.height+.2,b.z]} size={[b.width+.18,.2,b.depth+.18]} color={curb} />
      <Box position={[b.x+.5,b.height+.55,b.z]} size={[1,.6,1.2]} color={dark ? '#5b6674' : '#a5b2b9'} />
      <Box position={[b.x,.65,b.z+b.depth/2+.03]} size={[.7,1.1,.05]} color="#52636c" />
      {i<3 && <><Box position={[b.x,1.5,b.z+b.depth/2+.35]} size={[1.7,.16,.7]} color={['#c99879','#8bb4af','#9eafca'][i]} /><Box position={[b.x,1.9,b.z+b.depth/2+.04]} size={[1.4,.3,.06]} color="#f2e4d3" emissive="#ffd1a0" emissiveIntensity={dark ? .5 : 0} /></>}
    </group>)}
    <Windows dark={dark} />
    <Box position={[-7,.02,7]} size={[7,.12,7]} color={dark ? '#304c42' : '#b2ceb1'} />
    <Box position={[-7,.1,7]} size={[3,.1,3]} color={curb} />
    <ParkDetails dark={dark} />
    {[[-9,5],[-9,9],[-5,9],[-5,5],[-18,18],[18,18],[-18,-18],[18,-18],[-19,1],[19,-1]].map(([x,z])=><Tree key={`${x},${z}`} x={x} z={z} />)}
    {LAMP_POSITIONS.map(([x,z],i)=><group key={i} position={[x,0,z]}>
      <Box position={[0,1.6,0]} size={[.13,3.2,.13]} color={dark ? '#647488' : '#526273'} />
      <Box position={[.35,3.18,0]} size={[.8,.12,.16]} color="#526273" />
      <mesh position={[.68,3.1,0]}><boxGeometry args={[.45,.12,.32]} /><meshStandardMaterial color="#fff1cf" emissive="#ffc879" emissiveIntensity={dark ? 3 : .15} /></mesh>
      {dark && <><mesh rotation={[-Math.PI/2,0,0]} position={[.68,.045,0]}><circleGeometry args={[2.1,24]} /><meshBasicMaterial color="#ffd68e" transparent opacity={.11} depthWrite={false} /></mesh>{i<4 && <pointLight position={[.6,2.9,0]} color="#ffd398" intensity={9} distance={8} decay={2} />}</>}
    </group>)}
    {[-1,1].map(side=><group key={side}><Box position={[0,.02,side*22]} size={[44,.22,.2]} color={curb} /><Box position={[side*22,.02,0]} size={[.2,.22,44]} color={curb} /></group>)}
  </group>;
}
