import { collectDocuments, chunkDocuments, localEmbeddingModel, embedLocal } from '../server/retrieval.js';
import { writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const documents = await collectDocuments();
const chunks = chunkDocuments(documents, 700, 100);
const model = localEmbeddingModel(chunks);
const index = { version: 1, model: 'normalized-tfidf', fingerprint: createHash('sha256').update(JSON.stringify(documents)).digest('hex'), documents: documents.length, chunks: chunks.map(c => ({ ...c, vector: embedLocal(c.text, model) })), vocabulary: model.vocab, idf: model.idf };
await writeFile('src/knowledgeIndex.json', JSON.stringify(index));
console.log(`Browser vector index: ${documents.length} CV/portfolio documents, ${chunks.length} overlapping chunks, ${model.vocab.length} dimensions.`);
