import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorld, stepWorld, resolveCollision, consumeGateEntry, GATES, LIMIT, collideBuildings } from '../src/components/3d/playgroundPhysics.js';
const advance = (world, input, seconds) => { for (let i = 0; i < seconds * 120; i++) stepWorld(world, input, 1 / 120); };

test('throttle moves the rover forward and reverse moves it backward', () => {
  const forward = createWorld(), reverse = createWorld();
  advance(forward, { forward: true }, 0.5); advance(reverse, { backward: true }, 0.5);
  assert.ok(forward.car.z < 0); assert.ok(reverse.car.z > 0);
});
test('steering changes direction while rolling; braking reduces coasting speed', () => {
  const world = createWorld(); advance(world, { forward: true, left: true }, 0.6);
  assert.ok(world.car.angle > 0); assert.ok(world.car.x < 0);
  const coast = structuredClone(world), brake = structuredClone(world);
  advance(coast, {}, 0.3); advance(brake, { brake: true }, 0.3);
  assert.ok(Math.hypot(brake.car.vx, brake.car.vz) < Math.hypot(coast.car.vx, coast.car.vz));
});
test('a collision separates bodies and transfers momentum to a crate', () => {
  const world = createWorld(), car = world.car, crate = world.crates[0];
  Object.assign(car, { x: 0, z: 0, vx: 3, vz: 0 }); Object.assign(crate, { x: 1, z: 0, vx: 0, vz: 0 });
  assert.ok(resolveCollision(car, crate) > 0); assert.ok(crate.vx > 0);
  assert.ok(Math.hypot(car.x - crate.x, car.z - crate.z) >= car.radius + crate.radius - 1e-8);
});
test('driving through the central crate records an impact', () => {
  const world = createWorld(); advance(world, { forward: true }, 2.8);
  assert.ok(world.hits > 0); assert.notEqual(world.crates[1].z, -9);
});
test('long driving sessions keep all bodies finite and inside the track', () => {
  const world = createWorld(); advance(world, { forward: true, left: true }, 30);
  for (const body of [world.car, ...world.crates]) {
    assert.ok(Number.isFinite(body.x) && Number.isFinite(body.z));
    assert.ok(Math.abs(body.x) <= LIMIT - body.radius + 1e-8);
    assert.ok(Math.abs(body.z) <= LIMIT - body.radius + 1e-8);
  }
});
test('each gateway activates its matching section and clears on departure', () => {
  for (const gate of GATES) {
    const world = createWorld(); Object.assign(world.car, { x: gate.x, z: gate.z });
    stepWorld(world, {}, 1 / 120); assert.equal(world.gate, gate.id);
    Object.assign(world.car, { x: 0, z: 4 }); stepWorld(world, {}, 1 / 120); assert.equal(world.gate, null);
  }
});
test('reset restores vehicle, crates, velocity, and impact count', () => {
  const world = createWorld(); advance(world, { forward: true }, 2);
  const reset = createWorld(); assert.equal(reset.car.z, 0); assert.equal(reset.car.vx, 0);
  assert.equal(reset.hits, 0); assert.equal(reset.crates[1].z, -9);
});

test('spawn stays exactly centered without an overlapping crate', () => {
  const world = createWorld(); advance(world, {}, 1);
  assert.equal(world.car.x, 0); assert.equal(world.car.z, 0); assert.equal(world.hits, 0);
});
test('gate entry fires once, waits for departure and respects cooldown', () => {
  const world = createWorld(); world.time = 2; world.gate = 'projects';
  assert.equal(consumeGateEntry(world), 'projects');
  for (let i = 0; i < 20; i++) assert.equal(consumeGateEntry(world), null);
  world.gate = null; consumeGateEntry(world); world.gate = 'projects';
  assert.equal(consumeGateEntry(world), null);
  world.time = 5; assert.equal(consumeGateEntry(world), null);
  world.gate = null; consumeGateEntry(world); world.gate = 'projects';
  assert.equal(consumeGateEntry(world), 'projects');
  const reset = createWorld(); assert.equal(consumeGateEntry(reset), null);
  assert.equal(reset.car.x, 0); assert.equal(reset.car.z, 0);
});

test('a hard wall impact counts once and rebounds the car', () => {
  const world = createWorld(); world.crates = [];
  world.car.x = LIMIT - world.car.radius - .01; world.car.vx = 4;
  stepWorld(world, {}, .02);
  assert.equal(world.hits, 1); assert.ok(world.car.vx < 0);
  stepWorld(world, {}, .02); assert.equal(world.hits, 1);
});

test('city buildings block the rover and return an audible impact', async () => {
  const { CITY_BLOCKS } = await import('../src/components/3d/cityLayout.js');
  const b=CITY_BLOCKS[0];
  const body={x:b.x-b.width/2-.3,z:b.z,vx:3,vz:0,radius:.57};
  assert.ok(collideBuildings(body)>0);
  assert.ok(body.x<=b.x-b.width/2-.25-body.radius+1e-8);
  assert.ok(body.vx<0);
});
test('city destinations are spread out and spawn has clear roads', () => {
  const world=createWorld();
  assert.ok(LIMIT>=20);
  assert.ok(GATES.every(g=>Math.hypot(g.x,g.z)>15));
  assert.ok(world.crates.every(c=>Math.hypot(c.x,c.z)>8));
});
