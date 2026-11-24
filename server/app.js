import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import path from 'node:path';
import { Webhook } from 'svix';
import { validateContact } from '../shared/contact.js';
import { ROOT, getConfig } from './config.js';
import { buildIndex, retrieve } from './retrieval.js';
import { generateAnswer } from './generation.js';
import { sendContact } from './email.js';
import { createStore } from './store.js';

export function createApp(options = {}) {
  const config = options.config || getConfig(), app = express(), store = createStore(config.dataDir);
  const secret = config.challengeSecret || randomBytes(32).toString('hex');
  let indexPromise, localIndexPromise;
  const getLocalIndex = () => localIndexPromise ||= buildIndex({ ...config, aiReady: false }).catch(error => { localIndexPromise = null; throw error; });
  const getIndex = () => indexPromise ||= (options.buildIndex || buildIndex)(config).catch(error => { indexPromise = null; throw error; });
  const receipts = new Map();
  app.disable('x-powered-by');
  if (config.trustProxy) app.set('trust proxy', config.trustProxy);
  app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'", "'wasm-unsafe-eval'", "https://cdn.jsdelivr.net"], styleSrc: ["'self'", "'unsafe-inline'"], connectSrc: ["'self'", "https://api.web3forms.com", "https://huggingface.co", "https://*.huggingface.co", "https://*.hf.co", "https://*.xethub.hf.co", "https://cdn.jsdelivr.net"], imgSrc: ["'self'", 'data:', 'blob:'], workerSrc: ["'self'", 'blob:'], fontSrc: ["'self'", 'data:'], upgradeInsecureRequests: config.production ? [] : null } }, crossOriginEmbedderPolicy: false }));
  // Serve media from its stable public directory, even during a dist rebuild.
  // Missing media must return 404, never the SPA HTML document.
  for (const directory of ['media', 'models']) {
    app.use(`/${directory}`, express.static(path.join(ROOT, 'public', directory), { maxAge: 0, acceptRanges: true }));
    app.use(`/${directory}`, (_req, res) => res.status(404).json({ error: 'Media file not found.' }));
  }
  app.post('/api/webhooks/resend', express.raw({ type: 'application/json', limit: '32kb' }), async (req, res) => {
    if (!config.webhookSecret) return res.status(503).json({ error: 'Webhook verification is not configured.' });
    let event;
    try { new Webhook(config.webhookSecret).verify(req.body.toString(), { 'svix-id': req.get('svix-id'), 'svix-timestamp': req.get('svix-timestamp'), 'svix-signature': req.get('svix-signature') }); event = JSON.parse(req.body.toString()); } catch { return res.status(400).json({ error: 'Invalid webhook signature.' }); }
    const statuses = { 'email.delivered': 'delivered', 'email.bounced': 'bounced', 'email.failed': 'failed' };
    if (statuses[event.type] && typeof event.data?.email_id === 'string') await store.update('delivery-receipts', [], rows => { const row = rows.find(r => r.id === event.data.email_id); if (row) { row.status = statuses[event.type]; row.verifiedAt = new Date().toISOString(); row.verification = 'signed-resend-webhook'; } return rows; });
    res.json({ received: true });
  });
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    const origin = req.get('origin');
    const localDev = !config.production && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || '');
    if (origin && origin !== config.origin && !localDev) return res.status(403).json({ error: 'This origin is not allowed.' });
    // The Vite proxy and production server provide same-origin access; no wildcard CORS.
    next();
  });
  app.use('/api', express.json({ limit: '64kb' }));
  const limiter = (limit, windowMs) => rateLimit({ windowMs, limit, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Too many requests. Please try again shortly.' } });
  app.use('/api', limiter(150, 15 * 60 * 1000));
  app.get('/api/status', (_req, res) => res.json({ chat: { mode: config.aiReady ? 'rag' : 'source-search', provider: config.aiReady ? config.provider : null }, contact: { ready: config.emailReady }, analytics: 'anonymous-aggregate' }));
  app.post('/api/chat', limiter(20, 60000), async (req, res) => {
    const { question, language = 'en', history = [], sourceOnly = false } = req.body || {};
    if (typeof sourceOnly !== 'boolean' || typeof question !== 'string' || !question.trim() || question.length > 1000 || !['en', 'ur', 'roman-ur'].includes(language) || !Array.isArray(history) || history.length > 6 || history.some(m => !m || !['user', 'assistant'].includes(m.role) || typeof m.content !== 'string' || m.content.length > 2000)) return res.status(400).json({ error: 'Enter a question under 1,000 characters and use a supported language.' });
    try {
      const runConfig = sourceOnly ? { ...config, aiReady: false } : config;
      const index = sourceOnly ? await getLocalIndex() : await getIndex();
      const previous = history.filter(m => m.role === 'user').at(-1)?.content || '';
      const query = !index.localModel && /\b(it|that|this|more)\b/i.test(question) && previous ? `${question}\nPrevious topic: ${previous}` : question;
      const sources = await (options.retrieve || retrieve)(index, query, runConfig);
      const answer = await (options.generate || generateAnswer)(question.trim(), language, history, sources, runConfig);
      await store.record('chat_questions');
      res.json({ ...answer, language });
    } catch { res.status(503).json({ error: 'The AI service is unavailable. Please try again, or use the portfolio sections below.' }); }
  });
  const sign = text => createHmac('sha256', secret).update(text).digest('base64url');
  app.get('/api/contact/challenge', limiter(20, 60000), (_req, res) => {
    const payload = Buffer.from(JSON.stringify({ id: randomBytes(16).toString('hex'), issued: Date.now() })).toString('base64url');
    res.json({ token: `${payload}.${sign(payload)}` });
  });
  app.post('/api/contact', limiter(5, 15 * 60 * 1000), async (req, res) => {
    const { values, errors, valid } = validateContact(req.body);
    if (!valid) return res.status(400).json({ error: 'Please correct the highlighted fields.', fields: errors });
    if (typeof req.body.company !== 'string' || req.body.company.trim()) return res.status(400).json({ error: 'This message could not be accepted.' });
    let payload;
    try {
      const [text, signature, extra] = String(req.body.token || '').split('.');
      if (!text || !signature || extra || signature.length !== sign(text).length || !timingSafeEqual(Buffer.from(signature), Buffer.from(sign(text)))) throw new Error();
      payload = JSON.parse(Buffer.from(text, 'base64url').toString());
      const age = Date.now() - payload.issued;
      if (!payload.id || !Number.isFinite(age) || age < (options.minFormAge ?? 1500) || age > 20 * 60 * 1000) throw new Error();
    } catch { return res.status(400).json({ error: 'Please wait a moment, or refresh the form and try again.', refreshChallenge: true }); }
    if (!config.emailReady) return res.status(503).json({ error: 'Email delivery is not configured yet. Please use the direct email link.' });
    for (const [id, value] of receipts) if (Date.now() - value.created > 20 * 60 * 1000) receipts.delete(id);
    if (receipts.size > 2000) return res.status(429).json({ error: 'Please try again later.' });
    try {
      let entry = receipts.get(payload.id);
      if (!entry) {
        const promise = (options.sendContact || sendContact)(values, config, req.body.token).then(async receipt => {
          await store.update('delivery-receipts', [], rows => [receipt, ...rows].slice(0, 500));
          await store.record('contact_accepted'); return receipt;
        });
        entry = { created: Date.now(), promise }; receipts.set(payload.id, entry);
      }
      const receipt = await entry.promise;
      res.status(202).json({ status: 'accepted', id: receipt.id, message: 'Your email was accepted by the email service. Thank you for getting in touch.' });
    } catch { receipts.delete(payload.id); res.status(502).json({ error: 'Email acceptance could not be confirmed. Please try again later or use the direct email link.' }); }
  });
  app.post('/api/analytics', limiter(30, 60000), async (req, res) => {
    if (req.body?.event !== 'page_view') return res.status(400).json({ error: 'Unknown event.' });
    await store.record('page_view'); res.status(204).end();
  });
  app.get('/api/admin/analytics', async (req, res) => {
    if (!config.adminToken || req.get('authorization') !== `Bearer ${config.adminToken}`) return res.status(401).json({ error: 'Unauthorized.' });
    res.json(await store.read('analytics', {}));
  });
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Unknown API route.' }));
  if (config.production) { app.use(express.static(path.join(ROOT, 'dist'))); app.get(/.*/, (_req, res) => res.sendFile(path.join(ROOT, 'dist/index.html'))); }
  app.use((error, _req, res, _next) => res.status(error.type === 'entity.too.large' ? 413 : error instanceof SyntaxError ? 400 : 500).json({ error: error.type === 'entity.too.large' ? 'Request is too large.' : 'The request could not be processed.' }));
  return { app, getIndex, config, store };
}
