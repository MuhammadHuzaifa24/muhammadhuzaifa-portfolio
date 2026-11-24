import { validateContact } from '../../shared/contact.js';

export async function sendContact(values, { accessKey, company = '', fetcher = fetch } = {}) {
  const checked = validateContact(values);
  if (!checked.valid) throw new Error('Please check the form fields.');
  if (company) throw new Error('Submission rejected. Please leave the hidden field empty.');
  if (!accessKey?.trim()) throw new Error('Email delivery needs a free Web3Forms access key. Please use the direct email link for now.');
  const response = await fetcher('https://api.web3forms.com/submit', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ ...checked.values, access_key: accessKey.trim(), from_name: 'Muhammad Huzaifa Portfolio', replyto: checked.values.email, botcheck: false }),
    signal: AbortSignal.timeout(25000),
  });
  const data = await response.json();
  if (!response.ok || data.success !== true) throw new Error('The email service could not accept your message. Please try again or use the direct email link.');
  return data;
}
