import { getConfig } from '../server/config.js';
import { createStore } from '../server/store.js';
import { requestJSON } from '../server/retrieval.js';
const config = getConfig(), store = createStore(config.dataDir), id = process.argv[2];
if (!id || !config.resendKey || config.emailProvider !== 'resend') { console.error('Usage: npm run email:verify -- <Resend email id>. Configure the Resend key first.'); process.exit(1); }
try {
  const data = await requestJSON(`https://api.resend.com/emails/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${config.resendKey}` } });
  const status = data.last_event || 'unknown';
  await store.update('delivery-receipts', [], rows => { const row = rows.find(r => r.id === id); if (row) { row.status = status; row.verifiedAt = new Date().toISOString(); row.verification = 'resend-retrieve-api'; } return rows; });
  console.log(JSON.stringify({ id, status, verifiedAt: new Date().toISOString(), verification: 'Resend API', delivered: status === 'delivered' }, null, 2));
} catch { console.error('Could not verify delivery status.'); process.exitCode = 1; }
