import CarHeadlights from './CarHeadlights';
import City from './City';
import { MAKER_POSITION } from './cityLayout';
import { restoreAvatarMaterials } from '../../utils/avatarMaterials';
import { Component, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Center, ContactShadows, Float, RoundedBox, useGLTF, useTexture, Sparkles } from '@react-three/drei';
import { motion, useReducedMotion } from 'framer-motion';
import { PlayfulButton } from '../MotionPrimitives';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Gamepad2, RotateCcw, X } from 'lucide-react';
import { AdditiveBlending, Box3, MathUtils, Plane, Vector3 } from 'three';
import { useTheme } from '../../hooks/ThemeContext';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { ArcadeAudio } from '../../utils/arcadeAudio';
import { useVideoPlayback } from '../../hooks/useVideoPlayback';
import { CRATES, GATES, LIMIT, consumeGateEntry, createWorld, stepWorld } from './playgroundPhysics';

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.warn('Playground fallback:', error.message); this.props.onError?.(); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
function Block({ position, args, color = '#cbd5e1', emissive = '#000000', emissiveIntensity = 0, ...props }) {
  return <mesh position={position} castShadow receiveShadow {...props}><boxGeometry args={args} /><meshStandardMaterial color={color} roughness={0.65} emissive={emissive} emissiveIntensity={emissiveIntensity} /></mesh>;
}
function Rover({ world, reduced, dark }) {
  const rover = useRef(), chassis = useRef(), wheels = useRef([]);
  useFrame(({ clock }, delta) => {
    const car = world.current.car;
    rover.current.position.set(car.x, 0, car.z); rover.current.rotation.y = car.angle;
    const speed = Math.hypot(car.vx, car.vz);
    chassis.current.rotation.z = MathUtils.damp(chassis.current.rotation.z, Math.sin(car.angle) * speed * 0.012, 6, delta);
    chassis.current.position.y = reduced ? 0 : Math.sin(clock.elapsedTime * 9) * Math.min(speed, 1) * 0.012;
    wheels.current.forEach(wheel => { if (wheel) wheel.rotation.x -= speed * Math.min(delta, 0.04) * 3; });
  });
  return <group ref={rover}><CarHeadlights dark={dark} /><group ref={chassis}>
    <RoundedBox args={[0.88, 0.28, 1.42]} radius={0.09} position={[0, 0.42, 0]} castShadow><meshStandardMaterial color="#fb923c" metalness={0.02} roughness={0.65} /></RoundedBox>
    <RoundedBox args={[0.67, 0.38, 0.66]} radius={0.065} position={[0, 0.73, 0.12]} castShadow><meshStandardMaterial color="#f4f3ef" roughness={0.65} /></RoundedBox>
    <Block args={[0.58, 0.22, 0.025]} position={[0, 0.76, -0.222]} color="#42546a" />
    <Block args={[0.92, 0.12, 0.13]} position={[0, 0.32, -0.76]} color="#0f172a" />
    <Block args={[0.92, 0.12, 0.13]} position={[0, 0.32, 0.76]} color="#0f172a" />
    {[-0.28, 0.28].map(x => <mesh key={x} position={[x, 0.47, -0.72]}><boxGeometry args={[0.16, 0.1, 0.025]} /><meshStandardMaterial color="#f4f3ef" emissive="#fff1ce" emissiveIntensity={dark ? 4 : .4} /></mesh>)}
    <Block args={[0.4, 0.055, 0.4]} position={[0, 0.96, 0.1]} color="#fb923c" />
  </group>{[[-0.49, -0.43], [0.49, -0.43], [-0.49, 0.47], [0.49, 0.47]].map(([x, z], i) => <group key={i} position={[x, 0.28, z]}><group ref={node => { wheels.current[i] = node; }}><mesh rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.25, 0.25, 0.17, 16]} /><meshStandardMaterial color="#111827" roughness={0.9} /></mesh><mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.12, 0.12, 0.185, 8]} /><meshStandardMaterial color="#f4f3ef" metalness={0.6} roughness={0.35} /></mesh></group></group>)}</group>;
}
function TechSymbol({ symbol, color }) {
  if (symbol === 'react') return <group position={[0, 0, 0.51]}>{[0, Math.PI / 3, -Math.PI / 3].map(angle => <mesh rotation={[0, 0, angle]} scale={[1, 0.4, 1]} key={angle}><torusGeometry args={[0.31, 0.018, 8, 36]} /><meshBasicMaterial color={color} /></mesh>)}<mesh><sphereGeometry args={[0.045, 12, 12]} /><meshBasicMaterial color={color} /></mesh></group>;
  if (symbol === 'blender') return <group position={[0, 0, 0.51]}><mesh><torusGeometry args={[0.18, 0.045, 8, 32]} /><meshBasicMaterial color={color} /></mesh>{[0.2, 0.9, 1.6].map(angle => <Block key={angle} args={[0.35, 0.065, 0.04]} position={[-0.18, 0.08 + angle * 0.07, 0]} rotation={[0, 0, -angle]} color={color} />)}</group>;
  return <mesh position={[0, 0, 0.53]} rotation={[0.3, 0.5, Math.PI / 4]}><octahedronGeometry args={[0.32]} /><meshStandardMaterial color={color} wireframe={symbol === 'unity'} emissive={color} emissiveIntensity={0.2} /></mesh>;
}
function SkillCrate({ index, world, reduced, active }) {
  const group = useRef(), visual = useRef(), hovered = useRef(false), drag = useRef(null);
  const plane = useMemo(() => new Plane(new Vector3(0, 1, 0), -0.55), []);
  const point = useMemo(() => new Vector3(), []);
  const item = CRATES[index];
  useEffect(() => () => { if (drag.current) drag.current.body.dragging = false; }, []);
  useEffect(() => { if (drag.current) { drag.current.body.dragging = false; drag.current = null; } }, [active]);
  function end(event) {
    if (!drag.current) return;
    drag.current.body.dragging = false; drag.current = null;
    event.target.releasePointerCapture?.(event.pointerId);
  }
  useFrame(({ clock }, delta) => {
    const body = world.current.crates[index];
    group.current.position.set(body.x, 0.6 + body.bounce + (reduced ? 0 : Math.sin(clock.elapsedTime * 1.5 + index) * 0.06), body.z);
    visual.current.rotation.y += body.spin * Math.min(delta, 0.04);
    visual.current.scale.setScalar(MathUtils.damp(visual.current.scale.x, hovered.current ? 1.12 : 1, 9, delta));
    visual.current.rotation.z = MathUtils.damp(visual.current.rotation.z, hovered.current ? 0.1 : 0, 8, delta);
  });
  return <group ref={group} onPointerOver={event => { event.stopPropagation(); hovered.current = true; }} onPointerOut={() => { hovered.current = false; }} onPointerDown={event => {
    event.stopPropagation();
    const body = world.current.crates[index];
    if (!event.ray.intersectPlane(plane, point)) return;
    drag.current = { body, dx: body.x - point.x, dz: body.z - point.z };
    body.dragging = true; body.vx = 0; body.vz = 0; event.target.setPointerCapture(event.pointerId);
  }} onPointerMove={event => {
    if (!drag.current || !drag.current.body.dragging || !event.ray.intersectPlane(plane, point)) return;
    event.stopPropagation();
    const { body, dx, dz } = drag.current;
    body.x = MathUtils.clamp(point.x + dx, -LIMIT + .8, LIMIT - .8); body.z = MathUtils.clamp(point.z + dz, -LIMIT + .8, LIMIT - .8);
  }} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}>
    <group ref={visual}><RoundedBox args={[1, 1, 1]} radius={0.07} castShadow><meshStandardMaterial color={item.color} metalness={0.02} roughness={0.75} /></RoundedBox><TechSymbol symbol={item.symbol} color="#17212b" /><mesh position={[0, 0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.2, 0.24, 4]} /><meshBasicMaterial color="#ffffff" /></mesh></group>
  </group>;
}
function Gateway({ gate, reduced, dark }) {
  const ring = useRef();
  useFrame(({ clock }) => {
    if (!reduced) { ring.current.rotation.z = clock.elapsedTime * .18; ring.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 1.8) * .055); }
  });
  const glow = dark ? 1.7 : .45;
  return <group position={[gate.x,0,gate.z]}>
    <Block args={[2.2,.12,2.2]} position={[0,.06,0]} color={dark ? '#425167' : '#dce4e7'} />
    {[.82,1.05,1.3].map((radius,i)=><mesh key={radius} rotation={[-Math.PI/2,0,0]} position={[0,.135+i*.002,0]}><ringGeometry args={[radius-.12,radius,48]} /><meshBasicMaterial color={gate.color} transparent opacity={(dark ? .38 : .26)/(i+1)} blending={AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>)}
    {[-.85,.85].map(x=><Block key={x} args={[.13,1.5,.13]} position={[x,.85,0]} color={gate.color} emissive={gate.color} emissiveIntensity={glow} />)}
    <Block args={[1.83,.14,.13]} position={[0,1.57,0]} color={gate.color} emissive={gate.color} emissiveIntensity={glow} />
    <mesh ref={ring} position={[0,.85,0]}><torusGeometry args={[.51,.035,8,48]} /><meshBasicMaterial color={gate.color} toneMapped={false} /></mesh>
    <Sparkles count={18} scale={[1.7,1.8,1]} position={[0,1,0]} size={dark ? 3 : 2} speed={reduced ? 0 : .3} color={gate.color} opacity={dark ? .8 : .5} />
    <pointLight position={[0,.8,0]} color={gate.color} intensity={dark ? 4 : .6} distance={4} decay={2} />
  </group>;
}

function Sculpture() { return <mesh castShadow><icosahedronGeometry args={[0.65, 0]} /><meshStandardMaterial color="#94a3b8" wireframe /></mesh>; }
function AvatarModel() {
  const { scene } = useGLTF('/models/avatar.glb');
  const diffuse = useTexture('/models/avatar-basecolor.jpg');
  const { object, scale } = useMemo(() => {
    const object = restoreAvatarMaterials(clone(scene), diffuse); object.traverse(child => { if (child.isMesh) child.castShadow = true; });
    const size = new Box3().setFromObject(object).getSize(new Vector3());
    return { object, scale: 1.9 / Math.max(size.x, size.y, size.z, 0.001) };
  }, [scene, diffuse]);
  return <Center><primitive object={object} scale={scale} /></Center>;
}
function AvatarExhibit({ available, reduced }) {
  const rotating = useRef();
  useFrame((_, delta) => { if (!reduced) rotating.current.rotation.y += Math.min(delta, 0.04) * 0.3; });
  return <group position={MAKER_POSITION}>
    <mesh position={[0, 0.18, 0]} receiveShadow castShadow><cylinderGeometry args={[0.95, 1.05, 0.35, 48]} /><meshStandardMaterial color="#fb923c" roughness={0.7} /></mesh>
    <mesh position={[0, 0.37, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.82, 0.88, 48]} /><meshBasicMaterial color="#94a3b8" /></mesh>
    <group ref={rotating} position={[0, 1.35, 0]}><SceneBoundary fallback={<Sculpture />}><Suspense fallback={<Sculpture />}>{available ? <AvatarModel /> : <Sculpture />}</Suspense></SceneBoundary></group>
  </group>;
}
function Simulation({ sound, world, input, labels, active, available, reduced, dark, onNavigate, onTelemetry }) {
  const accumulator = useRef(0), lastHUD = useRef(0);
  const projected = useMemo(() => new Vector3(), []);
  const cameraTarget = useMemo(() => new Vector3(), []), cameraPosition = useMemo(() => new Vector3(), []);
  useFrame(({ camera, pointer, size }, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    if (active) {
      accumulator.current += dt;
      while (accumulator.current >= 1 / 120) { stepWorld(world.current, input.current, 1 / 120); accumulator.current -= 1 / 120; }
      const entered = consumeGateEntry(world.current); if (entered) { sound.current.gate(); onNavigate(entered); }
      sound.current.update(Math.hypot(world.current.car.vx,world.current.car.vz),input.current.forward || input.current.backward,input.current.backward);
      if(world.current.hits !== (sound.current.hits || 0)) { sound.current.hits=world.current.hits; sound.current.crash(); }
    } else { accumulator.current = 0; }
    const car = world.current.car, distance = Math.max(1, 1.35 / (size.width / size.height));
    const px = reduced ? 0 : pointer.x * 0.55, py = reduced ? 0 : pointer.y * 0.35;
    if (active) cameraPosition.set(car.x + (10 + px) * Math.max(1,distance*.75), 12 * Math.max(1,distance*.75), car.z + (14 + py) * Math.max(1,distance*.75));
    else cameraPosition.set((33+px)*distance, 37*distance, (41+py)*distance);
    camera.position.lerp(cameraPosition, reduced ? 1 : 1 - Math.exp(-3 * dt));
    cameraTarget.set(active ? car.x : 0, 0, active ? car.z : 0); camera.lookAt(cameraTarget);
    camera.updateMatrixWorld();
    const projectLabel = (element, x, y, z) => {
      if (!element) return;
      projected.set(x, y, z).project(camera);
      element.style.left = MathUtils.clamp((projected.x + 1) * size.width / 2, 44, size.width - 44) + 'px';
      element.style.top = ((1 - projected.y) * size.height / 2) + 'px';
      element.style.visibility = projected.z < -1 || projected.z > 1 || Math.abs(projected.x) > .94 || Math.abs(projected.y) > .86 ? 'hidden' : 'visible';
    };
    world.current.crates.forEach((body, i) => projectLabel(labels.current.crates[i], body.x, 1.6 + body.bounce, body.z));
    GATES.forEach((gate, i) => projectLabel(labels.current.gates[i], gate.x, 2.05, gate.z));
    projectLabel(labels.current.avatar, MAKER_POSITION[0], 2.8, MAKER_POSITION[2]);
    lastHUD.current += dt;
    if (lastHUD.current > 0.15) { onTelemetry({ speed: Math.round(Math.hypot(car.vx, car.vz) * 12), hits: world.current.hits, x: car.x.toFixed(1), z: car.z.toFixed(1) }); lastHUD.current = 0; }
  });
  return <>
    <color attach="background" args={[dark ? '#0c1424' : '#f4f3ef']} />
    <fog attach="fog" args={[dark ? '#0c1424' : '#f4f3ef', 65, 160]} />
    <ambientLight intensity={dark ? .4 : 1.3} />
    <hemisphereLight args={[dark ? '#91b7ef' : '#fff5e8', dark ? '#142420' : '#cbd5c4', dark ? .65 : 1.2]} />
    <directionalLight color={dark ? '#adcbff' : '#fff4df'} position={[-12,25,14]} intensity={dark ? .9 : 2.8} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-30} shadow-camera-right={30} shadow-camera-top={30} shadow-camera-bottom={-30} shadow-camera-far={90} shadow-normalBias={.04} />
    <mesh position={[0,-.56,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[240,240]} /><meshStandardMaterial color={dark ? '#0c1424' : '#f4f3ef'} roughness={1} /></mesh>
    <City dark={dark} /><Rover world={world} reduced={reduced} dark={dark} />
    {CRATES.map((_,index)=><SkillCrate key={index} index={index} world={world} reduced={reduced} active={active} />)}
    {GATES.map(gate=><Gateway key={gate.id} gate={gate} reduced={reduced} dark={dark} />)}
    <AvatarExhibit available={available} reduced={reduced} />
  </>;

}
const KEY_MAP = { w: 'forward', arrowup: 'forward', s: 'backward', arrowdown: 'backward', a: 'left', arrowleft: 'left', d: 'right', arrowright: 'right', ' ': 'brake' };
export default function AvatarViewer({ active = false, onActiveChange, onNavigate }) {
  const { theme } = useTheme();
  const videoPlaying=useVideoPlayback();
  const sound=useRef(new ArcadeAudio());
  const [soundOn,setSoundOn]=useState(true);
  const [soundMessage,setSoundMessage]=useState('');
  async function beginSound(){try {if(await sound.current.unlock()){sound.current.setEnabled(soundOn);sound.current.start();setSoundMessage('');}else setSoundMessage('Audio output unavailable.');}catch{setSoundMessage('Could not start audio. Check your device output.');}}
  function togglePlay(){if(!active)beginSound();else sound.current.stop();onActiveChange(!active);}
  async function toggleSound(){const enabled=!soundOn;setSoundOn(enabled);sound.current.setEnabled(enabled);if(enabled){try{await sound.current.unlock();if(active)sound.current.start();sound.current.test();}catch{setSoundMessage('Check your device sound output.');}}}
  useEffect(()=>()=>sound.current.dispose(),[]);
  const [available, setAvailable] = useState(false), [visible, setVisible] = useState(true), [documentVisible, setDocumentVisible] = useState(true), [failed, setFailed] = useState(false);
  const [telemetry, setTelemetry] = useState({ speed: 0, hits: 0, x: '0.0', z: '0.0' });
  const [pressed, setPressed] = useState({});
  const touchKeys = useRef(new Set());
  const labels = useRef({ crates: [], gates: [], avatar: null });
  const container = useRef(), world = useRef(createWorld()), input = useRef({}), heldKeys = useRef(new Set());
  const reduced = useReducedMotion();
  useEffect(()=>{if(!active || !visible || !documentVisible || videoPlaying)sound.current.stop();},[active,visible,documentVisible,videoPlaying]);
  const syncInput = useCallback(() => {
    const next = {};
    heldKeys.current.forEach(key => { next[KEY_MAP[key]] = true; });
    touchKeys.current.forEach(action => { next[action] = true; });
    input.current = next; setPressed(next);
  }, []);
  function touch(action, down) { if(soundOn && down && !sound.current.engine) beginSound(); if (down) touchKeys.current.add(action); else touchKeys.current.delete(action); syncInput(); }
  const clear = useCallback(() => { input.current = {}; heldKeys.current.clear(); touchKeys.current.clear(); setPressed({}); world.current.crates.forEach(body => { body.dragging = false; }); }, []);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/models/avatar.glb', { signal: controller.signal }).then(async response => {
      if (!response.ok) return;
      const bytes = await response.arrayBuffer(); setAvailable(bytes.byteLength >= 12 && new DataView(bytes).getUint32(0, true) === 0x46546c67);
    }).catch(() => {});
    const observer = new IntersectionObserver(([entry]) => { setVisible(entry.isIntersecting); if (!entry.isIntersecting) clear(); }, { threshold: 0.05 }); observer.observe(container.current);
    const visibility = () => { setDocumentVisible(!document.hidden); clear(); };
    const loseFocus=()=>{clear();sound.current.stop();};
    window.addEventListener('blur', loseFocus); document.addEventListener('visibilitychange', visibility);
    return () => { controller.abort(); observer.disconnect(); window.removeEventListener('blur', loseFocus); document.removeEventListener('visibilitychange', visibility); };
  }, [clear]);
  useEffect(() => {
    clear();
    if (active) {
      world.current = createWorld();
      sound.current.hits=0;
      setTelemetry({ speed: 0, hits: 0, x: '0.0', z: '0.0' });
      container.current.focus({ preventScroll: true });
      const top = container.current.getBoundingClientRect().top + window.scrollY - (document.querySelector('.navbar')?.offsetHeight || 0) - 16;
      window.scrollTo({ top, behavior: reduced ? 'instant' : 'smooth' });
    }
  }, [active, clear, reduced]);
  function reset() { sound.current.hits=0; if(active){sound.current.stop();beginSound();} clear(); world.current = createWorld(); setTelemetry({ speed: 0, hits: 0, x: '0.0', z: '0.0' }); container.current.focus({ preventScroll: true }); }
  function key(event, down) {
    if (!active || !visible || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    const name = event.key.toLowerCase();
    if (name === 'escape' && down) { clear(); onActiveChange(false); return; }
    if (/BUTTON|A/.test(event.target.tagName)) return;
    if (name === 'h' && down && !event.repeat) { event.preventDefault(); sound.current.horn(); return; }
    if (name === ' ' && down && !event.repeat) sound.current.brake();
    if(soundOn && down && !sound.current.engine) beginSound();
    if (name === 'r' && down && !event.repeat) { reset(); return; }
    if (!KEY_MAP[name]) return;
    event.preventDefault();
    if (down) heldKeys.current.add(name); else heldKeys.current.delete(name);
    syncInput();
  }
  const fallback = <div className="canvas-message"><Gamepad2 size={40} /><strong>The garage needs WebGL.</strong><span>You can still explore every project below.</span></div>;
  return <div ref={container} className={`playground ${active ? 'is-playing' : ''}`} tabIndex={0} role="region" aria-label="Interactive driving playground" aria-describedby="drive-instructions" onKeyDown={event => key(event, true)} onKeyUp={event => key(event, false)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) clear(); }}>
    <div className="garage-topline"><span><span className="status-dot" /> HZ CITY <b>/ FREE ROAM</b></span><span className="garage-live">{theme === 'dark' ? 'NIGHT DRIVE' : 'DAY DRIVE'}</span></div>
    <SceneBoundary fallback={fallback} onError={() => setFailed(true)}><Canvas shadows dpr={[1, 1.5]} frameloop={visible && documentVisible && !videoPlaying ? 'always' : 'never'} camera={{ position: [33, 37, 41], fov: 43, near: 0.1, far: 200 }} gl={{ alpha: true, antialias: true }} fallback={fallback}><Simulation sound={sound} dark={theme === 'dark'} world={world} input={input} labels={labels} active={active && !failed} available={available} reduced={reduced} onNavigate={onNavigate} onTelemetry={setTelemetry} /></Canvas></SceneBoundary>
    {!failed && <div className="scene-labels">{CRATES.map((item, index) => <span key={item.label} ref={element => { labels.current.crates[index] = element; }} className="tech-label" style={{ '--badge-color': item.color }}>{item.label}</span>)}{GATES.map((gate, index) => <PlayfulButton type="button" key={gate.id} ref={element => { labels.current.gates[index] = element; }} className="gate-label" style={{ '--badge-color': gate.color }} onClick={() => onNavigate(gate.id)}>{gate.label} ↗</PlayfulButton>)}<span ref={element => { labels.current.avatar = element; }} className="exhibit-label">THE MAKER</span></div>}
    <div className="garage-audio"><button type="button" onClick={toggleSound} aria-pressed={soundOn}>{soundOn ? 'Sound on' : 'Sound off'}</button>{active && <button type="button" onClick={()=>sound.current.horn()}>Horn · H</button>}<span role="status">{soundMessage}</span></div><div className="garage-bottom"><div><p className="garage-title">A little city. A longer detour.</p><p id="drive-instructions">{active ? 'WASD / arrows · Space brake · H horn · R reset · Esc exit' : 'Explore the streets, move the crates, find the three gateways.'}</p></div><PlayfulButton type="button" className={`play-toggle ${active ? 'engaged' : ''}`} aria-pressed={active} disabled={failed} onClick={togglePlay}>{active ? <X size={16} /> : <Gamepad2 size={17} />}{active ? 'Exit Playground' : 'Playground Mode'}<span>{active ? 'ESC' : '↵'}</span></PlayfulButton></div>
    {active && <><motion.div className="drive-telemetry" initial={reduced ? false : { opacity: 0, scale: 0.75, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: -2 }} transition={{ type: 'spring', stiffness: 300, damping: 17 }}>
      <div className="arcade-title"><span /> PLAYER 01 / FREE ROAM</div>
      <div className="arcade-score"><b>{telemetry.speed.toString().padStart(2, '0')}</b><small>KM/H</small></div><PlayfulButton type="button" onClick={reset} aria-label="Reset playground"><RotateCcw size={16} /></PlayfulButton>
      <div className="keyboard-hud" aria-label="Live keyboard controls">{[['forward', 'W'], ['left', 'A'], ['backward', 'S'], ['right', 'D'], ['brake', 'SPACE']].map(([action, label]) => <motion.kbd key={action} className={pressed[action] ? 'is-down' : ''} animate={reduced ? undefined : { y: pressed[action] ? 3 : 0, scale: pressed[action] ? 0.9 : 1, rotate: pressed[action] ? -4 : 0 }} transition={{ type: 'spring', stiffness: 450, damping: 14 }}>{label}</motion.kbd>)}</div>
      <span className="arcade-hits">{telemetry.hits} BUMPS & COUNTING</span><span className="coordinates">X {telemetry.x} / Z {telemetry.z}</span>
    </motion.div><div className="touch-drive" aria-label="Touch driving controls">{[['left', ArrowLeft], ['forward', ArrowUp], ['backward', ArrowDown], ['right', ArrowRight]].map(([action, Icon]) => <PlayfulButton type="button" key={action} className={pressed[action] ? 'is-down' : ''} aria-label={`Drive ${action}`} aria-pressed={!!pressed[action]} onPointerDown={event => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); touch(action, true); }} onPointerUp={event => { touch(action, false); event.currentTarget.releasePointerCapture(event.pointerId); }} onPointerCancel={() => touch(action, false)} onLostPointerCapture={() => touch(action, false)}><Icon size={20} /></PlayfulButton>)}</div></>}
    <span className="sr-only" aria-live="polite">{active ? 'Playground active. Focus this area to drive. Drive through a gateway to open its section.' : 'Playground inactive. Scroll to explore the portfolio.'}</span>
  </div>;
}
