import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { getConfig } from '../server/config.js';
import { createApp } from '../server/app.js';
import { buildIndex, chunkDocuments, retrieve, cosine } from '../server/retrieval.js';
import { generateAnswer, validateGroundedAnswer } from '../server/generation.js';
import { validateContact } from '../shared/contact.js';
import { sendContact } from '../server/email.js';

async function configFor(t, overrides = {}) {
  const directory = await mkdtemp(path.join(tmpdir(), 'huzaifa-portfolio-test-'));
  t.after(async () => { const resolved = path.resolve(directory); assert.equal(path.dirname(resolved), path.resolve(tmpdir())); assert.ok(path.basename(resolved).startsWith('huzaifa-portfolio-test-')); await rm(resolved, { recursive: true, force: true }); });
  return { ...getConfig({ AI_PROVIDER: 'openai', DATA_DIR: directory }), ...overrides };
}
async function serve(t, options = {}) {
  const config = options.config || await configFor(t);
  const { app, store } = createApp({ config, ...options });
  const server = await new Promise(resolve => { const server = app.listen(0, '127.0.0.1', () => resolve(server)); });
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = async (route, body, extra = {}) => fetch(`${base}${route}`, { method: body === undefined ? 'GET' : 'POST', headers: { 'Content-Type': 'application/json', ...extra.headers }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  return { request, config, store };
}
const valid = { name: 'Portfolio Tester', email: 'tester@example.com', subject: 'Project discussion', message: 'I would like to discuss an interactive Unity project with you.', company: '' };

test('document chunks are bounded, overlapping, and retain source metadata', () => {
  const chunks = chunkDocuments([{ id: 'long', href: '#projects', title: 'Long project', text: 'An interactive Unity project with accessible controls. '.repeat(50) }], 300, 50);
  assert.ok(chunks.length > 1); assert.ok(chunks.every(c => c.text.length <= 300 && c.href === '#projects')); assert.equal(new Set(chunks.map(c => c.id)).size, chunks.length);
});
test('local vector index persists and retrieves the confirmed degree and internship', async t => {
  const config = await configFor(t), index = await buildIndex(config);
  assert.equal(index.mode, 'local-source-search'); assert.ok(index.chunks.length >= 20); assert.ok(index.dimensions > 0);
  const degree = await retrieve(index, 'What is his degree and CGPA?', config);
  assert.ok(degree.some(s => s.text.includes('Bachelor of Gaming and Animation') && s.text.includes('3.57')));
  const work = await retrieve(index, 'Which internship did he complete?', config);
  assert.ok(work.some(s => s.text.includes('The Game Storm Studio')));
  assert.equal((await buildIndex(config)).fingerprint, index.fingerprint);
  assert.equal(cosine([1, 0], [1, 0]), 1);
});
test('unknown questions abstain, and fabricated evidence is rejected', async t => {
  const config = await configFor(t), index = await buildIndex(config);
  const missing = await retrieve(index, 'Tell me about zebras on Neptune', config);
  assert.equal(missing.length, 0);
  const result = await generateAnswer('unknown', 'en', [], missing, config); assert.equal(result.grounded, false); assert.match(result.answer, /don’t have/);
  const source = { id: 'a', text: 'His confirmed CGPA is 3.57.', title: 'Education', href: '#education' };
  assert.equal(validateGroundedAnswer({ supported: true, answer: 'His CGPA is 4.0', evidence: [{ id: 'a', quote: 'CGPA is 4.0' }] }, [source]).grounded, false);
  assert.equal(validateGroundedAnswer({ supported: true, answer: 'His CGPA is 3.57.', evidence: [{ id: 'a', quote: 'His confirmed CGPA is 3.57.' }] }, [source]).sources[0].href, '#education');
});
test('contact validation rejects missing subjects and CRLF header injection', () => {
  assert.equal(validateContact(valid).valid, true);
  assert.ok(validateContact({ ...valid, subject: '' }).errors.subject);
  assert.ok(validateContact({ ...valid, name: 'Eve\r\nBcc: attacker@example.com' }).errors.name);
  assert.ok(validateContact({ ...valid, email: 'x@example.com\r\nX: bad' }).errors.email);
});
test('API serves source search with citations and keeps credentials out of status', async t => {
  const { request } = await serve(t);
  const status = await (await request('/api/status')).json(); assert.equal(status.chat.mode, 'source-search'); assert.equal(status.contact.ready, false); assert.equal(status.openaiKey, undefined);
  const response = await request('/api/chat', { question: 'What is his degree?', language: 'en', history: [] });
  assert.equal(response.status, 200); const data = await response.json(); assert.equal(data.mode, 'source-search'); assert.ok(data.sources.length > 0); assert.ok(data.sources.every(s => s.href.startsWith('#')));
  assert.equal((await request('/api/chat', { question: 'x'.repeat(1001) })).status, 400);
  assert.equal((await request('/api/admin/analytics')).status, 401);
  assert.equal((await request('/api/chat', { question: 'Hi' }, { headers: { Origin: 'https://attacker.example' } })).status, 403);
});
test('missing email credentials never produce success; invalid challenges are rejected', async t => {
  const { request } = await serve(t, { minFormAge: 0 });
  assert.equal((await request('/api/contact', { ...valid, token: 'forged' })).status, 400);
  const { token } = await (await request('/api/contact/challenge')).json();
  const response = await request('/api/contact', { ...valid, token }); assert.equal(response.status, 503);
  assert.equal((await request('/api/contact', { ...valid, token, company: 'spam' })).status, 400);
});
test('SMTP payload uses a fixed recipient and sender, validated reply-to, and plain text', async t => {
  const config = await configFor(t, { emailProvider: 'smtp', contactFrom: 'sender@example.com', contactTo: 'owner@example.com' });
  let sent;
  const receipt = await sendContact(valid, config, 'token', { sendMail: async payload => { sent = payload; return { accepted: ['owner@example.com'], messageId: 'smtp-test-id' }; } });
  assert.equal(sent.to, 'owner@example.com'); assert.equal(sent.from, 'sender@example.com'); assert.equal(sent.replyTo.address, valid.email); assert.equal(sent.html, undefined); assert.equal(receipt.status, 'accepted');
});
test('contact acceptance is idempotent and records provider acceptance without claiming delivery', async t => {
  const config = await configFor(t, { emailReady: true }); let sends = 0;
  const { request, store } = await serve(t, { config, minFormAge: 0, sendContact: async () => { sends++; return { id: 'fixture-provider-id', provider: 'resend', recipient: config.contactTo, status: 'accepted' }; } });
  const { token } = await (await request('/api/contact/challenge')).json();
  const a = await request('/api/contact', { ...valid, token }), b = await request('/api/contact', { ...valid, token });
  assert.equal(a.status, 202); assert.equal(b.status, 202); assert.equal(sends, 1); assert.equal((await a.json()).status, 'accepted');
  const receipts = await store.read('delivery-receipts', []); assert.equal(receipts[0].status, 'accepted'); assert.equal(receipts[0].status === 'delivered', false);
});
test('chat rate limiting and webhook signature rejection work', async t => {
  const config = await configFor(t, { webhookSecret: 'whsec_aW52YWxpZA==' }); const { request } = await serve(t, { config });
  for (let i = 0; i < 20; i++) assert.equal((await request('/api/chat', {})).status, 400);
  assert.equal((await request('/api/chat', {})).status, 429);
  assert.equal((await request('/api/webhooks/resend', { type: 'email.delivered', data: { email_id: 'fake' } })).status, 400);
});

test('signed delivery webhook updates a receipt only after signature verification', async t => {
  const { Webhook } = await import('svix');
  const secret = `whsec_${Buffer.from('portfolio-webhook-fixture-secret1').toString('base64')}`;
  const config = await configFor(t, { webhookSecret: secret }); const { request, store } = await serve(t, { config });
  await store.update('delivery-receipts', [], () => [{ id: 'email-fixture', provider: 'resend', status: 'accepted' }]);
  const body = { type: 'email.delivered', data: { email_id: 'email-fixture' } }, payload = JSON.stringify(body), timestamp = new Date();
  const signature = new Webhook(secret).sign('message-fixture', timestamp, payload);
  const response = await request('/api/webhooks/resend', body, { headers: { 'svix-id': 'message-fixture', 'svix-timestamp': String(Math.floor(timestamp.getTime() / 1000)), 'svix-signature': signature } });
  assert.equal(response.status, 200); assert.equal((await store.read('delivery-receipts', []))[0].status, 'delivered');
});
test('OpenAI embedding and structured answer payloads are compatible and keep URLs server-controlled', async t => {
  const { embedTexts } = await import('../server/retrieval.js');
  const config = await configFor(t, { aiReady: true, openaiKey: 'fixture-key-not-real' });
  const original = globalThis.fetch; t.after(() => { globalThis.fetch = original; });
  const calls = [];
  globalThis.fetch = async (url, options) => {
    const body = JSON.parse(options.body); calls.push({ url, body });
    return { ok: true, json: async () => url.endsWith('/embeddings') ? { data: [{ index: 1, embedding: [0, 1] }, { index: 0, embedding: [1, 0] }] } : { output: [{ content: [{ type: 'output_text', text: JSON.stringify({ answer: 'His CGPA is 3.57.', supported: true, evidence: [{ id: 'degree', quote: 'CGPA: 3.57 / 4.00.' }] }) }] }] } };
  };
  assert.deepEqual(await embedTexts(['first', 'second'], config), [[1, 0], [0, 1]]);
  const result = await generateAnswer('His CGPA?', 'en', [], [{ id: 'degree', title: 'Degree', href: '#education', text: 'CGPA: 3.57 / 4.00.' }], config);
  assert.equal(result.mode, 'rag'); assert.equal(result.sources[0].href, '#education');
  assert.equal(calls[1].body.store, false); assert.equal(calls[1].body.text.format.strict, true);
});
test('Resend adapter sends only the fixed recipient and returns acceptance, not delivery', async t => {
  const config = await configFor(t, { resendKey: 'fixture-key-not-real', contactFrom: 'Portfolio <sender@example.com>', contactTo: 'owner@example.com' });
  const original = globalThis.fetch; t.after(() => { globalThis.fetch = original; });
  let payload, headers;
  globalThis.fetch = async (_url, options) => { payload = JSON.parse(options.body); headers = options.headers; return { ok: true, json: async () => ({ id: 'resend-fixture-id' }) }; };
  const receipt = await sendContact(valid, config, 'fixed-test-token');
  assert.deepEqual(payload.to, ['owner@example.com']); assert.equal(payload.reply_to, valid.email); assert.equal(payload.from, config.contactFrom); assert.ok(headers['Idempotency-Key']); assert.equal(receipt.status, 'accepted');
});

test('explicit source-only requests remain usable when a configured AI provider is unavailable', async t => {
  const config = await configFor(t, { aiReady: true, openaiKey: 'fixture-invalid-key' });
  const { request } = await serve(t, { config });
  const response = await request('/api/chat', { question: 'What is his degree?', sourceOnly: true });
  assert.equal(response.status, 200); const data = await response.json(); assert.equal(data.mode, 'source-search'); assert.ok(data.sources.length > 0);
});

test('production video routes serve native A/V bytes and ranges, never SPA HTML', async t => {
  const config=await configFor(t,{production:true});
  const {request}=await serve(t,{config});
  const {mediaDelivery}=await import('../src/mediaDelivery.js');
  for(const media of Object.values(mediaDelivery)) {
    const response=await request(`${media.native}?playback=native-audio-v2`,undefined,{headers:{Range:'bytes=0-4095'}});
    assert.equal(response.status,206);
    assert.match(response.headers.get('content-type'),/video\/mp4/);
    assert.match(response.headers.get('content-range'),/^bytes 0-4095\//);
    assert.equal((await response.arrayBuffer()).byteLength,4096);
  }
  const missing=await request('/media/playback/missing-video.mp4');
  assert.equal(missing.status,404);assert.match(missing.headers.get('content-type'),/application\/json/);
});
