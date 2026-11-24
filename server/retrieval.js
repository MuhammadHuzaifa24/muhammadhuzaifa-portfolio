import { readFile, readdir, mkdir, writeFile, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { profile, projects, experience, education, achievements } from '../src/data.js';
import { ROOT } from './config.js';

export async function collectDocuments() {
  const docs = [{ id: 'profile', title: 'Profile · Muhammad Huzaifa', href: '#about', text: `${profile.name}. ${profile.role}. ${profile.location}. Final-year ${profile.degree} student at ${profile.university}. Email: ${profile.email}. LinkedIn: ${profile.linkedin}.` }];
  projects.forEach(p => docs.push({ id: `project-${p.id}`, title: p.title, href: '#projects', text: `${p.title}. ${p.type}. ${p.category || p.discipline}. ${p.description} Technologies: ${p.tags.join(', ')}.` }));
  experience.forEach((p, i) => docs.push({ id: `experience-${i}`, title: `${p.title} · ${p.organization}`, href: '#experience', text: `${p.title} at ${p.organization}. ${p.dates}. ${p.location}. ${p.description} ${p.highlights.join(' ')} Technologies and skills: ${p.tags.join(', ')}.` }));
  education.forEach((p, i) => docs.push({ id: `education-${i}`, title: p.title, href: '#education', text: `${p.title}. ${p.institution}. ${p.dates}. ${p.detail}. ${p.description}` }));
  achievements.forEach((p, i) => docs.push({ id: `achievement-${i}`, title: p.title, href: '#education', text: `${p.title}. ${p.dates}. ${p.description}` }));
  for (const file of (await readdir(path.join(ROOT, 'server/knowledge'))).sort()) {
    if (!file.endsWith('.md')) continue;
    docs.push({ id: file.replace('.md', ''), title: file === 'cv.md' ? 'CV · verified background' : 'Technical skills', href: file === 'cv.md' ? '#education' : '#skills', text: await readFile(path.join(ROOT, 'server/knowledge', file), 'utf8') });
  }
  return docs;
}
export function chunkDocuments(documents, maxChars = 850, overlap = 120) {
  const chunks = [];
  for (const document of documents) {
    const text = document.text.replace(/\s+/g, ' ').trim();
    let start = 0, part = 0;
    while (start < text.length) {
      let end = Math.min(start + maxChars, text.length);
      if (end < text.length) { const boundary = text.lastIndexOf(' ', end); if (boundary > start + maxChars * 0.6) end = boundary; }
      chunks.push({ id: `${document.id}-${part++}`, title: document.title, href: document.href, text: text.slice(start, end).trim() });
      if (end === text.length) break;
      start = Math.max(start + 1, end - overlap);
      const nextWord = text.indexOf(' ', start); if (nextWord > start && nextWord < end) start = nextWord + 1;
    }
  }
  return chunks;
}
const stop = new Set('a an the is are was were what which who how when where does do did can could would should tell me about his her he she him it its and or of in on from by as at to for with that this not has have you your their they please muhammad huzaifa student know'.split(' '));
export function tokenize(text) {
  const expanded = text.toLowerCase().replace(/\bcgpa\b/g, 'cgpa grade').replace(/\b(worked|working|work|internship|intern)\b/g, '$& experience').replace(/\b(graduate|degree|university|study|studied|studies)\b/g, '$& education').replace(/\b(award|awards|won|win|achievement|achievements)\b/g, '$& competition').replace(/\b(tech|technology|technologies|tools)\b/g, '$& skills');
  return (expanded.match(/[\p{L}\p{N}+#.]+/gu) || []).filter(t => t.length > 1 && !stop.has(t));
}
export function localEmbeddingModel(chunks) {
  const vocab = [...new Set(chunks.flatMap(c => tokenize(c.text)))].sort();
  const sets = chunks.map(c => new Set(tokenize(c.text)));
  return { vocab, idf: vocab.map(word => Math.log((chunks.length + 1) / (1 + sets.filter(set => set.has(word)).length)) + 1) };
}
export function embedLocal(text, model) {
  const counts = new Map(); tokenize(text).forEach(t => counts.set(t, (counts.get(t) || 0) + 1));
  const vector = model.vocab.map((word, i) => counts.has(word) ? (1 + Math.log(counts.get(word))) * model.idf[i] : 0);
  const norm = Math.hypot(...vector) || 1; return vector.map(n => n / norm);
}
export function cosine(a, b) {
  if (a.length !== b.length || !a.length) return 0;
  let dot = 0, aa = 0, bb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; aa += a[i] ** 2; bb += b[i] ** 2; }
  return aa && bb ? dot / Math.sqrt(aa * bb) : 0;
}
export async function requestJSON(url, options = {}) {
  const response = await fetch(url, { ...options, signal: options.signal || AbortSignal.timeout(45000) });
  if (!response.ok) {
    let body; try { body = await response.json(); } catch {}
    const rawCode = body?.error?.code || body?.error?.type || 'provider_error';
    const code = typeof rawCode === 'string' && /^[a-zA-Z0-9_]+$/.test(rawCode) ? rawCode : 'provider_error';
    throw new Error(`Provider request failed (${response.status}): ${code}`);
  }
  return response.json();
}
export async function embedTexts(texts, config) {
  if (config.provider === 'ollama') {
    const result = await requestJSON(`${config.ollamaUrl}/api/embed`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: config.embeddingModel, input: texts, truncate: false }) });
    return result.embeddings;
  }
  const result = await requestJSON('https://api.openai.com/v1/embeddings', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.openaiKey}` }, body: JSON.stringify({ model: config.embeddingModel, input: texts, encoding_format: 'float' }) });
  return result.data.sort((a, b) => a.index - b.index).map(row => row.embedding);
}
export async function buildIndex(config) {
  const chunks = chunkDocuments(await collectDocuments());
  const mode = config.aiReady ? config.provider : 'local-source-search';
  const fingerprint = createHash('sha256').update(JSON.stringify({ chunks, mode, model: config.embeddingModel, version: 3 })).digest('hex');
  const file = path.join(config.dataDir, `index-${mode}.json`);
  try { const cached = JSON.parse(await readFile(file, 'utf8')); if (cached.fingerprint === fingerprint) return cached; } catch {}
  const localModel = mode === 'local-source-search' ? localEmbeddingModel(chunks) : null;
  const vectors = localModel ? chunks.map(c => embedLocal(c.text, localModel)) : await embedTexts(chunks.map(c => `${c.title}\n${c.text}`), config);
  if (!Array.isArray(vectors) || vectors.length !== chunks.length || vectors.some(v => !Array.isArray(v) || !v.length || v.some(n => !Number.isFinite(n)) || v.length !== vectors[0].length)) throw new Error('Invalid embedding response');
  const index = { fingerprint, mode, model: localModel ? 'tfidf-local-v2' : config.embeddingModel, createdAt: new Date().toISOString(), dimensions: vectors[0].length, localModel, chunks: chunks.map((c, i) => ({ ...c, vector: vectors[i] })) };
  await mkdir(config.dataDir, { recursive: true }); await writeFile(`${file}.tmp`, JSON.stringify(index)); await rename(`${file}.tmp`, file);
  return index;
}
export async function retrieve(index, question, config) {
  const vector = index.localModel ? embedLocal(question, index.localModel) : (await embedTexts([question], config))[0];
  if (!Array.isArray(vector) || vector.length !== index.dimensions) throw new Error('Embedding dimension mismatch');
  const scored = index.chunks.map(chunk => ({ ...chunk, score: cosine(vector, chunk.vector) })).sort((a, b) => b.score - a.score);
  const threshold = index.localModel ? 0.10 : 0.23;
  return scored.filter(c => c.score >= threshold).slice(0, 5).map(({ vector: _, ...chunk }) => chunk);
}
