import { getConfig } from '../server/config.js';
import { createStore } from '../server/store.js';
console.log(JSON.stringify(await createStore(getConfig().dataDir).read('analytics', {}), null, 2));
