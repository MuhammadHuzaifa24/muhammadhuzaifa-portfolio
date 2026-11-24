import { createApp } from './app.js';
const { app, config } = createApp();
const server = app.listen(config.port, '127.0.0.1', () => console.log(`Portfolio API listening on http://127.0.0.1:${config.port} · chat: ${config.aiReady ? config.provider : 'local source search'} · email: ${config.emailReady ? config.emailProvider : 'not configured'}`));
process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
