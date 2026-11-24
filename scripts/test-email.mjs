import { getConfig } from '../server/config.js';
import { createStore } from '../server/store.js';
import { sendContact } from '../server/email.js';
import { profile } from '../src/data.js';
const config = getConfig(), store = createStore(config.dataDir);
if (!process.argv.includes('--send')) { console.log('To send one delivery test to the configured CONTACT_TO, run: npm run email:test -- --send'); process.exit(0); }
if (!config.emailReady) { console.error('Configure RESEND_API_KEY and a verified CONTACT_FROM in .env first. No email was sent.'); process.exit(1); }
try {
  const receipt = await sendContact({ name: profile.name, email: profile.email, subject: 'Module 5 delivery verification', message: 'This is a portfolio integration test for the Module 5 contact system. Reply-to validation, server-side configuration, and provider submission are being verified.' }, config, `delivery-test-${Date.now()}`);
  await store.update('delivery-receipts', [], rows => [receipt, ...rows].slice(0, 500));
  console.log(JSON.stringify(receipt, null, 2)); console.log('Accepted by provider; this is not yet inbox-delivery proof. Run npm run email:verify -- <id> to check Resend delivery status.');
} catch { console.error('Provider acceptance could not be confirmed. Check your Resend sender and credentials.'); process.exitCode = 1; }
