import { getConfig } from '../server/config.js';
import { buildIndex } from '../server/retrieval.js';
const config = getConfig();
if (process.argv.includes('--local')) config.aiReady = false;
try { const index = await buildIndex(config); console.log(JSON.stringify({ mode: index.mode, chunks: index.chunks.length, dimensions: index.dimensions, model: index.model, createdAt: index.createdAt }, null, 2)); }
catch (error) { console.error('Indexing failed:', error.message, error.cause?.code || ''); process.exitCode = 1; }
