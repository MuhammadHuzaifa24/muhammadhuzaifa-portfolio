import test from 'node:test';
import assert from 'node:assert/strict';
import { answerQuestion } from '../src/utils/ragEngine.js';
import { sendContact } from '../src/utils/contactDelivery.js';

for (const [question, source] of [
  ['Tell me about R.I.S.E', 'project-01'], ['What is his education?', 'education'],
  ['What is his experience?', 'experience'], ['What technologies does he use?', 'skills'],
  ['حذیفہ کی تعلیم کیا ہے؟', 'education'], ['اس کی مہارتیں کیا ہیں؟', 'skills'],
  ['What 2D games has he made?', '2d'], ['Tell me about NinniTrap', 'project-13'],
  ['Which programming languages does he know?', 'skills'],
  ['What are his projects?', 'project-01'],
  ['اس کے پروجیکٹس بتائیں', 'project-01'],
  ['Tell me about 3D games', 'project-06'],
]) test(`local retrieval: ${question}`, () => {
  const result = answerQuestion(question);
  assert.equal(result.sources[0]?.id, source);
  assert.ok(result.answer.length > 30);
  if (/[\u0600-\u06ff]/.test(question)) assert.equal(result.language, 'ur');
});
test('unknown personal facts and unrelated questions never invent an answer', () => {
  for (const q of ['What is his salary?', 'When is his birthday?', 'What is his github?', 'How do I bake a cake?']) {
    const answer = answerQuestion(q); assert.equal(answer.matched, false); assert.deepEqual(answer.sources, []);
  }
});
const values = { name: 'Test Visitor', email: 'visitor@example.com', subject: 'Portfolio question', message: 'This is a sufficiently detailed test message.' };
test('contact posts directly to Web3Forms and accepts confirmed success only', async () => {
  let sent;
  await sendContact(values, { accessKey: 'public-test-key', fetcher: async (url, options) => {
    sent = { url, body: JSON.parse(options.body) }; return { ok: true, json: async () => ({ success: true }) };
  } });
  assert.equal(sent.url, 'https://api.web3forms.com/submit'); assert.equal(sent.body.replyto, values.email);
  assert.equal(sent.body.access_key, 'public-test-key'); assert.equal(sent.body.message, values.message);
  await assert.rejects(sendContact(values, { accessKey: 'test', fetcher: async () => ({ ok: true, json: async () => ({ success: false }) }) }), /could not accept/);
});
test('missing key, invalid fields and spam do not make a network request', async () => {
  const fetcher = () => { throw new Error('Unexpected network request'); };
  await assert.rejects(sendContact(values, { fetcher }), /access key/);
  await assert.rejects(sendContact({ ...values, email: 'bad' }, { accessKey: 'test', fetcher }), /check the form/);
  await assert.rejects(sendContact(values, { accessKey: 'test', company: 'spam', fetcher }), /rejected/);
});

test('project previews reference real assets and project categories match the updated showcase', async () => {
  const { projects } = await import('../src/data.js');
  const { access, readdir } = await import('node:fs/promises');
  const wada = projects.find(p => p.title === 'WADA');
  assert.equal(wada.category, '3D Games');
  assert.equal(wada.media[0].type, 'video');
  assert.equal(wada.media[0].src, '/media/videos/WADA.mp4');
  assert.ok(!projects.some(p => ['The Living Jungle', 'Interactive 3D Web Portfolio', 'AI Adaptive Tutor'].includes(p.title)));
  const signal = projects.find(p => p.title === 'The Signal Shutdown');
  assert.equal(signal.category, '3D Games');
  assert.equal(signal.thumbnail, '/media/images/signal-shutdown.jpg');
  assert.equal(signal.media[0].src, '/media/videos/signal-shutdown.mp4');
  const twoD = projects.filter(p => p.category === '2D Games');
  assert.deepEqual(twoD.map(p => p.title), ['FlappyBird', 'MrJungle', 'NinniTrap']);
  assert.deepEqual(twoD.map(p => p.media[0].type), ['image', 'image', 'video']);
  const models = projects.filter(p => p.category === 'Blender Work');
  assert.equal(models.length, 3);
  assert.ok(models.every(p => p.media[0].type === 'model' && p.media[0].src.startsWith('/media/models/')));
  const { projectFilters } = await import('../src/data.js');
  assert.deepEqual(projectFilters, ['All Work', '3D Games', '2D Games', 'AR / VR', 'Blender Work']);
  for (const project of projects) for (const src of [project.thumbnail, ...(project.media || []).map(m => m.src)].filter(Boolean)) {
    const url = new URL(`../public${src}`, import.meta.url);
    await access(url);
    const names = await readdir(new URL('.', url));
    assert.ok(names.includes(decodeURIComponent(url.pathname.split('/').pop())), `Asset casing must match: ${src}`);
  }
  assert.equal(answerQuestion('Tell me about WADA').sources[0].id, 'project-07');
  assert.match(answerQuestion('Tell me about WADA').answer, /Arabian/);
});

test('model framing centers offset, scaled assets without changing authored root transforms', async () => {
  const { Mesh, BoxGeometry, MeshBasicMaterial, Box3, Vector3 } = await import('three');
  const { frameModel } = await import('../src/utils/modelFraming.js');
  const mesh = new Mesh(new BoxGeometry(2, 5, 3), new MeshBasicMaterial());
  mesh.position.set(800, -500, 1200); mesh.rotation.set(.3, .7, -.2); mesh.scale.setScalar(100);
  const position = mesh.position.clone(), scale = mesh.scale.clone();
  const framed = frameModel(mesh), bounds = new Box3().setFromObject(framed), size = bounds.getSize(new Vector3());
  assert.ok(bounds.getCenter(new Vector3()).length() < 1e-8);
  assert.ok(Math.abs(Math.max(size.x, size.y, size.z) - 2.4) < 1e-8);
  assert.deepEqual(mesh.position.toArray(), position.toArray()); assert.deepEqual(mesh.scale.toArray(), scale.toArray());
  mesh.geometry.dispose(); mesh.material.dispose();
});
test('renamed R.I.S.E and Blender cards expose their requested media', async () => {
  const { projects, achievements } = await import('../src/data.js');
  const rise = projects.find(p => p.id === '01');
  assert.equal(rise.title, 'R.I.S.E'); assert.equal(rise.thumbnail, '/media/images/fyp.jpg');
  assert.equal(rise.media[0].src, '/media/videos/fyp.mp4');
  assert.deepEqual(projects.filter(p => p.category === 'Blender Work').map(p => p.title), ['Kiki the Explorer', 'Mochi 3D', 'MyAvatar']);
  assert.ok(projects.filter(p => p.category === 'Blender Work').every(p => p.thumbnail));
  assert.equal(achievements[0].thumbnail, '/media/images/GameConRunner.jpg');
});

test('avatar materials retain the color atlas without mutating cached GLTF materials', async () => {
  const { Mesh, BoxGeometry, MeshStandardMaterial, Texture, SRGBColorSpace } = await import('three');
  const { restoreAvatarMaterials } = await import('../src/utils/avatarMaterials.js');
  const cached=new MeshStandardMaterial({color:'#777777',metalness:1});
  const mesh=new Mesh(new BoxGeometry(),cached),texture=new Texture();
  restoreAvatarMaterials(mesh,texture);
  assert.notEqual(mesh.material,cached); assert.equal(cached.metalness,1);
  assert.equal(mesh.material.map,texture); assert.equal(texture.colorSpace,SRGBColorSpace);
  assert.equal(texture.flipY,false); assert.equal(mesh.material.metalness,0);
  assert.equal(mesh.material.color.getHexString(),'ffffff');
  mesh.geometry.dispose();mesh.material.dispose();cached.dispose();texture.dispose();
});

test('section navigation centers short content and clears the sticky header for tall sections', async () => {
  const { sectionScrollTop } = await import('../src/utils/sectionNavigation.js');
  assert.equal(sectionScrollTop({contentTop:1000,contentHeight:400,viewportHeight:800,headerHeight:80,maxScroll:5000}),760);
  assert.equal(sectionScrollTop({contentTop:1500,contentHeight:1200,viewportHeight:800,headerHeight:80,maxScroll:5000}),1392);
  assert.equal(sectionScrollTop({contentTop:100,contentHeight:500,viewportHeight:800,headerHeight:80,maxScroll:5000}),0);
  assert.equal(sectionScrollTop({contentTop:4900,contentHeight:800,viewportHeight:800,headerHeight:80,maxScroll:4500}),4500);
});
