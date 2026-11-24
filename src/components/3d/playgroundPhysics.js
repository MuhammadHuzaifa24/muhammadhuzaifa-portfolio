import { CITY_BLOCKS } from './cityLayout.js';
// Deterministic planar impulse simulation; rendering runs independently.
export const LIMIT = 22;
export const GATES = [
  { id: 'projects', label: 'PROJECTS', x: -13, z: -17, color: '#fb923c' },
  { id: 'skills', label: 'SKILLS', x: 0, z: -19, color: '#82b6ef' },
  { id: 'contact', label: 'CONTACT', x: 13, z: -17, color: '#76c9b7' },
];
export const CRATES = [
  { label: 'React', x: -9, z: .5, color: '#94a3b8', symbol: 'react' },
  { label: 'Blender', x: 0, z: -9, color: '#fb923c', symbol: 'blender' },
  { label: 'Unity', x: 9, z: .1, color: '#64748b', symbol: 'unity' },
  { label: 'AI / RAG', x: 13, z: 10, color: '#fb923c', symbol: 'ai' },
];
export function createWorld() {
  return { car: { x: 0, z: 0, vx: 0, vz: 0, angle: 0, radius: 0.57, mass: 2.6 }, crates: CRATES.map(item => ({ ...item, vx: 0, vz: 0, radius: 0.6, mass: 0.8, spin: 0, bounce: 0, dragging: false })), hits: 0, time: 0, lastHit: -1, gate: null, gateEntered: null, gateCooldownUntil: 1 };
}
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
function walls(body) {
  const edge = LIMIT - body.radius;
  let impact = 0;
  for (const [position, velocity] of [['x', 'vx'], ['z', 'vz']]) {
    if (Math.abs(body[position]) > edge) {
      body[position] = clamp(body[position], -edge, edge);
      if (Math.sign(body[velocity]) === Math.sign(body[position])) { impact = Math.max(impact, Math.abs(body[velocity])); body[velocity] *= -0.35; }
    }
  }
  return impact;
}
export function collideBuildings(body) {
  let impact = 0;
  for (const b of CITY_BLOCKS) {
    const halfX=b.width/2+.25, halfZ=b.depth/2+.25;
    const nx=clamp(body.x,b.x-halfX,b.x+halfX), nz=clamp(body.z,b.z-halfZ,b.z+halfZ);
    const dx=body.x-nx,dz=body.z-nz,d=Math.hypot(dx,dz);
    if(d>=body.radius)continue;
    let ax,az,depth;
    if(d>.00001){ax=dx/d;az=dz/d;depth=body.radius-d;}
    else { const px=halfX-Math.abs(body.x-b.x),pz=halfZ-Math.abs(body.z-b.z);ax=px<pz?(Math.sign(body.x-b.x)||1):0;az=px<pz?0:(Math.sign(body.z-b.z)||1);depth=Math.min(px,pz)+body.radius; }
    body.x+=ax*depth;body.z+=az*depth;
    const velocity=body.vx*ax+body.vz*az;
    if(velocity<0){impact=Math.max(impact,-velocity);body.vx-=1.35*velocity*ax;body.vz-=1.35*velocity*az;}
  }
  return impact;
}
export function resolveCollision(a, b) {
  const dx = b.x - a.x, dz = b.z - a.z;
  const distance = Math.hypot(dx, dz), minimum = a.radius + b.radius;
  if (distance >= minimum || a.dragging || b.dragging) return 0;
  const nx = distance > 0.0001 ? dx / distance : 1, nz = distance > 0.0001 ? dz / distance : 0;
  const inverseA = 1 / a.mass, inverseB = 1 / b.mass, total = inverseA + inverseB;
  const overlap = minimum - distance;
  a.x -= nx * overlap * inverseA / total; a.z -= nz * overlap * inverseA / total;
  b.x += nx * overlap * inverseB / total; b.z += nz * overlap * inverseB / total;
  const closing = (b.vx - a.vx) * nx + (b.vz - a.vz) * nz;
  if (closing >= 0) return 0;
  const impulse = -(1 + 0.45) * closing / total;
  a.vx -= impulse * nx * inverseA; a.vz -= impulse * nz * inverseA;
  b.vx += impulse * nx * inverseB; b.vz += impulse * nz * inverseB;
  if ('bounce' in b) { b.bounce = Math.min(0.55, impulse * 0.12); b.spin += impulse * 0.15; }
  return impulse;
}
export function stepWorld(world, input, dt) {
  const car = world.car;
  world.time += dt;
  const forwardX = -Math.sin(car.angle), forwardZ = -Math.cos(car.angle);
  const speed = car.vx * forwardX + car.vz * forwardZ;
  const throttle = Number(!!input.forward) - Number(!!input.backward);
  const steer = Number(!!input.left) - Number(!!input.right);
  car.angle += steer * clamp(speed / 2.5, -1, 1) * 2.4 * dt;
  car.vx += forwardX * throttle * 9 * dt; car.vz += forwardZ * throttle * 9 * dt;
  const sideX = Math.cos(car.angle), sideZ = -Math.sin(car.angle);
  const lateral = car.vx * sideX + car.vz * sideZ;
  car.vx -= sideX * lateral * (1 - Math.exp(-8 * dt)); car.vz -= sideZ * lateral * (1 - Math.exp(-8 * dt));
  const drag = Math.exp(-(input.brake ? 10 : 1.6) * dt);
  car.vx *= drag; car.vz *= drag;
  car.x += car.vx * dt; car.z += car.vz * dt;
  for (const crate of world.crates) {
    if (crate.dragging) continue;
    crate.vx *= Math.exp(-2 * dt); crate.vz *= Math.exp(-2 * dt);
    crate.x += crate.vx * dt; crate.z += crate.vz * dt;
    crate.bounce *= Math.exp(-5 * dt); crate.spin *= Math.exp(-1.5 * dt);
    const impulse = resolveCollision(car, crate);
    if (impulse > 0.5 && world.time - world.lastHit > 0.25) { world.hits++; world.lastHit = world.time; }
  }
  for (let i = 0; i < world.crates.length; i++) for (let j = i + 1; j < world.crates.length; j++) resolveCollision(world.crates[i], world.crates[j]);
  const wallImpact = Math.max(walls(car), collideBuildings(car)); world.crates.forEach(body => { walls(body); collideBuildings(body); });
  if (wallImpact > .8 && world.time - world.lastHit > .25) { world.hits++; world.lastHit = world.time; }
  world.gate = GATES.find(gate => Math.hypot(car.x - gate.x, car.z - gate.z) < 1.05)?.id ?? null;
  return world;
}

// One navigation per entry, including entries suppressed by the cooldown.
export function consumeGateEntry(world) {
  if (!world.gate) { world.gateEntered = null; return null; }
  if (world.gateEntered === world.gate) return null;
  world.gateEntered = world.gate;
  if (world.time < world.gateCooldownUntil) return null;
  world.gateCooldownUntil = world.time + 2;
  return world.gate;
}
