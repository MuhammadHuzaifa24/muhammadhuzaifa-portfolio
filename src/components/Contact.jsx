import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, CheckCircle2, LoaderCircle, Send } from 'lucide-react';
import { enter, PlayfulButton, PlayfulLink } from './MotionPrimitives';
import SectionHeading from './SectionHeading';
import { profile } from '../data';
import { sendContact } from '../utils/contactDelivery';
import { validateContact } from '../../shared/contact';
const initial = { name: '', email: '', subject: '', message: '' };
const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(profile.email)}`;
export default function Contact() {
  const [values, setValues] = useState(initial), [errors, setErrors] = useState({}), [status, setStatus] = useState({ type: '', text: '' });
  const [company, setCompany] = useState('');
  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '';
  const ready = !!accessKey.trim();
  const form = useRef(), lastSent = useRef(0), busy = status.type === 'loading';
  useEffect(() => { if (status.type !== 'success') return; const timer = setTimeout(() => setStatus({ type: '', text: '' }), 10000); return () => clearTimeout(timer); }, [status.type]);
  async function submit(event) {
    event.preventDefault(); if (busy) return;
    const checked = validateContact(values); setErrors(checked.errors);
    if (!checked.valid) { setStatus({ type: '', text: '' }); form.current.elements[Object.keys(checked.errors)[0]]?.focus(); return; }
    if (Date.now() - lastSent.current < 30000) { setStatus({ type: 'error', text: 'Please wait 30 seconds before sending another message.' }); return; }
    setStatus({ type: 'loading', text: 'Sending your message...' });
    try {
      await sendContact(checked.values, { accessKey, company });
      lastSent.current = Date.now();
      setStatus({ type: 'success', text: 'Message sent successfully. Thank you for getting in touch!' }); setValues(initial); setCompany('');
    } catch (error) { setStatus({ type: 'error', text: error.name === 'TimeoutError' ? 'Confirmation timed out. Please check before retrying or use the direct email link.' : error.message === 'Failed to fetch' ? 'Unable to reach the email service. Your message is preserved; please try again.' : error.message }); }
  }

  function change(event) { setValues(current => ({ ...current, [event.target.name]: event.target.value })); setErrors(current => ({ ...current, [event.target.name]: undefined })); if (!busy) setStatus({ type: '', text: '' }); }
  function field(name, label, placeholder, type = 'text') {
    return <div className="field"><label htmlFor={name}>{label}<span aria-hidden="true"> *</span></label><input id={name} name={name} type={type} autoComplete={name === 'email' || name === 'name' ? name : 'off'} value={values[name]} onChange={change} placeholder={placeholder} required maxLength={{ name: 80, email: 254, subject: 140 }[name]} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-error` : undefined} disabled={busy} />{errors[name] && <span className="field-error" id={`${name}-error`}>{errors[name]}</span>}</div>;
  }
  return <section id="contact" className="section-wrap section-space"><SectionHeading number="07" eyebrow="GOOD THINGS START WITH A CONVERSATION" title={<>Your next idea.<br /><span className="text-orange">My kind of challenge.</span></>} /><div className="contact-layout"><div className="contact-copy"><p className="lead">A project, an interesting question, or just a hello. I’d love to hear it.</p><p>I’m based in Karachi and interested in game development, AR/VR, interactive web experiences, and AI integration.</p><div className="contact-direct"><PlayfulLink href={gmailComposeUrl} target="_blank" rel="noopener noreferrer" aria-label="Compose an email to Muhammad Huzaifa in Gmail" title="Open Gmail compose">{profile.email}<ArrowUpRight size={15} /></PlayfulLink><PlayfulLink href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Muhammad Huzaifa on LinkedIn (opens in a new tab)">LinkedIn<ArrowUpRight size={15} /></PlayfulLink><span>Karachi, Pakistan</span></div><div className="contact-mark" aria-hidden="true"><ArrowUpRight size={78} strokeWidth={0.8} /></div><p className="contact-service-note">{ready === null ? 'Checking email connection…' : ready ? 'Messages are sent securely through Web3Forms.' : 'Use the direct email link while the free contact service is being connected.'}</p></div><motion.form variants={enter} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} ref={form} onSubmit={submit} noValidate className="contact-form glass-panel"><div className="form-row">{field('name', 'Your name', 'Alex Morgan')}{field('email', 'Email address', 'alex@example.com', 'email')}</div>{field('subject', 'Subject', 'Let’s build something together')}<div className="field"><label htmlFor="message">What’s on your mind?<span aria-hidden="true"> *</span></label><textarea id="message" name="message" value={values.message} onChange={change} placeholder="Tell me a little about your idea…" rows={5} minLength={20} maxLength={3000} required aria-invalid={!!errors.message} aria-describedby={errors.message ? 'message-error' : 'message-hint'} disabled={busy} /><span id="message-hint" className="input-hint">20–3,000 characters · {values.message.length}/3,000</span>{errors.message && <span id="message-error" className="field-error">{errors.message}</span>}</div><div className="form-honeypot" aria-hidden="true"><label htmlFor="company">Leave this field empty</label><input id="company" name="company" value={company} onChange={event => setCompany(event.target.value)} tabIndex={-1} autoComplete="off" /></div><div className="form-bottom"><p>Your details are used to respond to your message.</p><PlayfulButton className="button button-primary" type="submit" disabled={busy}>{busy ? 'Sending' : 'Send Message'}{busy ? <LoaderCircle className="animate-spin" size={17} /> : <Send size={17} />}</PlayfulButton></div><div aria-live="polite" aria-atomic="true">{status.text && <p className={`form-status ${status.type} ${status.type === 'success' ? 'contact-success-toast' : ''}`} role={status.type === 'error' ? 'alert' : 'status'}>{status.type === 'success' && <CheckCircle2 size={18} />}{status.text}</p>}</div></motion.form></div></section>;
}
