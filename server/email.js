import nodemailer from 'nodemailer';
import { createHash } from 'node:crypto';
import { requestJSON } from './retrieval.js';
export async function sendContact(values, config, token, transportOverride) {
  const subject = `Portfolio inquiry: ${values.subject}`;
  const text = `Portfolio contact message\n\nName: ${values.name}\nEmail: ${values.email}\nSubject: ${values.subject}\n\n${values.message}`;
  if (config.emailProvider === 'resend') {
    const data = await requestJSON('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${config.resendKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': createHash('sha256').update(token).digest('hex') }, body: JSON.stringify({ from: config.contactFrom, to: [config.contactTo], reply_to: values.email, subject, text }), signal: AbortSignal.timeout(20000) });
    if (!data.id) throw new Error('Email provider did not return an ID');
    return { id: data.id, provider: 'resend', status: 'accepted', recipient: config.contactTo, acceptedAt: new Date().toISOString() };
  }
  const transport = transportOverride || nodemailer.createTransport(config.smtp);
  const data = await transport.sendMail({ from: config.contactFrom, to: config.contactTo, replyTo: { name: values.name, address: values.email }, subject, text, disableFileAccess: true, disableUrlAccess: true });
  if (!data.accepted?.includes(config.contactTo)) throw new Error('Recipient was not accepted by SMTP server');
  return { id: data.messageId, provider: 'smtp', status: 'accepted', recipient: config.contactTo, acceptedAt: new Date().toISOString() };
}
