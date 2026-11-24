import { spawn } from 'node:child_process';
import { ROOT } from '../server/config.js';
const children = [spawn(process.execPath, ['--watch', 'server/index.js'], { cwd: ROOT, stdio: 'inherit' }), spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1'], { cwd: ROOT, stdio: 'inherit' })];
let stopping = false;
function stop(code = 0) { if (stopping) return; stopping = true; children.forEach(child => child.kill()); setTimeout(() => process.exit(code), 300).unref(); }
children.forEach(child => { child.on('error', () => stop(1)); child.on('exit', code => { if (!stopping) stop(code || 0); }); });
process.on('SIGINT', () => stop()); process.on('SIGTERM', () => stop());
