import { Component, Suspense, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bounds, OrbitControls, useProgress, useFBX, useGLTF, useTexture } from '@react-three/drei';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { frameModel, MODEL_CAMERA } from '../../utils/modelFraming';
import { restoreAvatarMaterials } from '../../utils/avatarMaterials';

class ModelBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
function Asset({ object }) {
  const scene = useMemo(() => frameModel(clone(object)), [object]);
  return <Bounds fit clip observe margin={1.2} maxDuration={0.3}><primitive object={scene} dispose={null} /></Bounds>;
}
function TexturedAvatar({ scene }) {
  const diffuse = useTexture('/models/avatar-basecolor.jpg');
  const object = useMemo(() => restoreAvatarMaterials(clone(scene), diffuse), [scene, diffuse]);
  return <Asset object={object} />;
}
function GLB({ src }) { const { scene } = useGLTF(src); return /avatar\.glb/i.test(src) ? <TexturedAvatar scene={scene} /> : <Asset object={scene} />; }
function FBX({ src }) { return <Asset object={useFBX(src)} />; }
function LoadingIndicator() {
  const { active } = useProgress();
  return active ? <span className="model-loading model-loading-overlay" role="status">Loading 3D model…</span> : null;
}

export default function ProjectModelViewer({ src, autoRotate = false, onCanvasReady }) {
  const [revision, setRevision] = useState(0);
  const fallback = <div className="media-unavailable" role="status"><h4>3D preview unavailable</h4><p>This model could not be displayed. Your browser needs WebGL; FBX assets may also need their original texture files.</p><a href={src} download>Download model file ↗</a></div>;
  const Loader = /\.fbx(?:$|\?)/i.test(src) ? FBX : GLB;
  return <div className="project-model-viewer"><ModelBoundary key={`${src}-${revision}`} fallback={fallback}><Canvas key={revision} frameloop={autoRotate ? 'always' : 'demand'} dpr={[1, 1.5]} camera={MODEL_CAMERA} gl={{ antialias: true }} onCreated={({ gl }) => onCanvasReady?.(gl.domElement)} fallback={fallback}>
    <color attach="background" args={['#f4f3ef']} /><ambientLight intensity={1.8} /><hemisphereLight args={['#f1f5f9', '#b9cbd8', 1.5]} /><directionalLight position={[4, 8, 5]} intensity={3} /><directionalLight position={[-5, 3, -3]} intensity={1.5} />
    <Suspense fallback={null}><Loader src={src} /></Suspense><OrbitControls makeDefault target={[0, 0, 0]} autoRotate={autoRotate} autoRotateSpeed={6} enableDamping enablePan minDistance={0.6} maxDistance={14} />
  </Canvas></ModelBoundary><LoadingIndicator /><div className="model-controls"><span>Drag to rotate · Scroll / pinch to zoom · Right-drag to pan</span><button type="button" onClick={() => setRevision(n => n + 1)}>Reset view</button></div></div>;
}
