import { restoreAvatarMaterials } from '../../utils/avatarMaterials';
import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Center, ContactShadows, OrbitControls, useGLTF, useTexture } from '@react-three/drei';
import { useReducedMotion } from 'framer-motion';
import { Box3, Vector3 } from 'three';
import { useTheme } from '../../hooks/ThemeContext';
import { useAvatarGesture } from '../../hooks/useAvatarGesture';
import { useVideoPlayback } from '../../hooks/useVideoPlayback';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

class AvatarBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError?.(); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
function LoadingSculpture() {
  return <mesh><icosahedronGeometry args={[0.6, 1]} /><meshStandardMaterial color="#fb923c" wireframe /></mesh>;
}
function Model({ onReady, reduced }) {
  const { scene } = useGLTF('/models/avatar.glb');
  const diffuse = useTexture('/models/avatar-basecolor.jpg');
  const { object, scale } = useMemo(() => {
    const object = restoreAvatarMaterials(clone(scene), diffuse);
    object.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
    const size = new Box3().setFromObject(object).getSize(new Vector3());
    return { object, scale: 2.75 / Math.max(size.x, size.y, size.z, 0.001) };
  }, [scene, diffuse]);
  useAvatarGesture(object, reduced);
  useEffect(() => { onReady(); }, [onReady]);
  return <Center><primitive object={object} scale={scale} /></Center>;
}
function AvatarScene({ reduced, dragging, onReady, dark }) {
  const group = useRef();
  useFrame(({ clock }, delta) => {
    if (reduced) return;
    if (!dragging.current) group.current.rotation.y += Math.min(delta, 0.05) * 0.18;
    group.current.position.y = Math.sin(clock.elapsedTime * 1.3) * 0.055;
  });
  return <><ambientLight intensity={dark ? 0.9 : 1.4} /><hemisphereLight args={['#f1f5f9', '#94a3b8', 1.4]} /><directionalLight castShadow position={[-3, 6, 4]} intensity={2.8} color="#f1f5f9" shadow-mapSize={[1024, 1024]} /><directionalLight position={[4, 2, -2]} intensity={1.5} color="#e2e8f0" /><group ref={group}><Suspense fallback={<LoadingSculpture />}><Model onReady={onReady} reduced={reduced} /></Suspense></group><mesh receiveShadow position={[0, -1.51, 0]}><cylinderGeometry args={[1.05, 1.15, 0.17, 64]} /><meshStandardMaterial color="#fb923c" roughness={0.75} /></mesh><ContactShadows position={[0, -1.61, 0]} scale={7} opacity={0.25} blur={2.5} far={5} resolution={256} frames={reduced ? 1 : Infinity} color="#64748b" /><OrbitControls makeDefault enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.8} onStart={() => { dragging.current = true; }} onEnd={() => { dragging.current = false; }} /></>;
}
export default function AboutAvatarViewer() {
  const videoPlaying=useVideoPlayback();
  const { theme } = useTheme();
  const container = useRef(), dragging = useRef(false);
  const [visible, setVisible] = useState(false), [pageVisible, setPageVisible] = useState(!document.hidden), [status, setStatus] = useState('Loading custom avatar…');
  const reduced = useReducedMotion();
  // A stable setter callback avoids rerunning the model's ready effect on parent updates.
  const onReady = useMemo(() => () => setStatus('Custom Blender avatar · drag to rotate'), []);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '120px' });
    observer.observe(container.current);
    const visibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', visibility);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  const fallback = <div className="canvas-message"><strong>Avatar preview unavailable</strong><span>My work and experience are available alongside this card.</span></div>;
  return <div ref={container} className="about-avatar-viewer" role="region" aria-label="Muhammad Huzaifa’s interactive 3D avatar"><AvatarBoundary fallback={fallback} onError={() => setStatus('3D preview unavailable on this device')}><Canvas shadows dpr={[1, 1.5]} frameloop={visible && pageVisible && !videoPlaying ? 'always' : 'never'} camera={{ position: [0, 0.2, 5.7], fov: 38 }} gl={{ alpha: true, antialias: true }} fallback={fallback}><AvatarScene dark={theme === 'dark'} reduced={reduced} dragging={dragging} onReady={onReady} /></Canvas></AvatarBoundary><p className="about-avatar-status" aria-live="polite">{status}</p></div>;
}
