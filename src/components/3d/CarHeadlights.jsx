import { useMemo } from 'react';
import { AdditiveBlending, Object3D } from 'three';

export default function CarHeadlights({ dark }) {
  const targets = useMemo(() => [-.28,.28].map(x => {
    const target = new Object3D(); target.position.set(x,.02,-9); return target;
  }), []);
  return <group name="car-headlights" visible={dark}>
    {targets.map((target,i) => <group key={i}>
      <primitive object={target} />
      <spotLight position={[i ? .28 : -.28,.52,-.8]} target={target} color="#fff0cd" intensity={42} distance={15} angle={.27} penumbra={.7} decay={1.5} castShadow={i===0} shadow-mapSize={[512,512]} shadow-camera-near={.1} shadow-camera-far={16} shadow-bias={-.0003} />
      <mesh position={[i ? .35 : -.35,.046,-4.8]} rotation={[-Math.PI/2,0,0]} scale={[.85,3,1]}><circleGeometry args={[1,32]} /><meshBasicMaterial color="#fff0bd" transparent opacity={.12} depthWrite={false} blending={AdditiveBlending} toneMapped={false} /></mesh>
    </group>)}
  </group>;
}
