import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
export function createStore(dataDir) {
  let queue = Promise.resolve();
  async function read(name, fallback) { try { return JSON.parse(await readFile(path.join(dataDir, `${name}.json`), 'utf8')); } catch { return fallback; } }
  function update(name, fallback, change) {
    const work = queue.catch(() => {}).then(async () => {
      const next = change(await read(name, fallback));
      await mkdir(dataDir, { recursive: true });
      const file = path.join(dataDir, `${name}.json`); await writeFile(`${file}.tmp`, JSON.stringify(next, null, 2)); await rename(`${file}.tmp`, file); return next;
    }); queue = work; return work;
  }
  return { read, update, record: event => update('analytics', {}, data => {
    const day = new Date().toISOString().slice(0, 10); data[day] ||= {}; data[day][event] = (data[day][event] || 0) + 1;
    return Object.fromEntries(Object.entries(data).sort(([a], [b]) => b.localeCompare(a)).slice(0, 90));
  }) };
}
