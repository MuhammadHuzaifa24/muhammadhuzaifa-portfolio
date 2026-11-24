import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export function getConfig(env = process.env) {
  const provider = env.AI_PROVIDER || 'openai';
  const aiReady = provider === 'ollama' || (provider === 'openai' && !!env.OPENAI_API_KEY?.trim());
  const emailProvider = env.EMAIL_PROVIDER || 'resend';
  return {
    port: Number(env.PORT || 3001), production: env.NODE_ENV === 'production',
    origin: env.APP_ORIGIN || 'http://127.0.0.1:5173', trustProxy: Number(env.TRUST_PROXY_HOPS || 0),
    dataDir: path.resolve(env.DATA_DIR || path.join(ROOT, 'server/data')),
    provider, aiReady, openaiKey: env.OPENAI_API_KEY?.trim() || '',
    chatModel: provider === 'ollama' ? (env.OLLAMA_CHAT_MODEL || 'llama3.2') : (env.OPENAI_CHAT_MODEL || 'gpt-4.1-mini'),
    embeddingModel: provider === 'ollama' ? (env.OLLAMA_EMBEDDING_MODEL || 'embeddinggemma') : (env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small'),
    ollamaUrl: (env.OLLAMA_URL || 'http://127.0.0.1:11434').replace(/\/$/, ''),
    emailProvider, resendKey: env.RESEND_API_KEY?.trim() || '', webhookSecret: env.RESEND_WEBHOOK_SECRET || '',
    contactFrom: env.CONTACT_FROM?.trim() || '', contactTo: env.CONTACT_TO || 'huzaifaraees6146@gmail.com',
    smtp: { host: env.SMTP_HOST, port: Number(env.SMTP_PORT || 587), secure: env.SMTP_SECURE === 'true', auth: { user: env.SMTP_USER, pass: env.SMTP_PASS }, requireTLS: env.SMTP_SECURE !== 'true', connectionTimeout: 10000, socketTimeout: 15000 },
    emailReady: !!env.CONTACT_FROM?.trim() && (emailProvider === 'resend' ? !!env.RESEND_API_KEY?.trim() : !!env.SMTP_HOST && !!env.SMTP_USER && !!env.SMTP_PASS),
    adminToken: env.ADMIN_TOKEN || '', challengeSecret: env.CHALLENGE_SECRET || '',
  };
}
