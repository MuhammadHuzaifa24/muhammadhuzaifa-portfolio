import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, Trash2, Mic, Volume2 } from 'lucide-react';
import { PlayfulButton } from './MotionPrimitives';
import { answerQuestion, semanticAnswer } from '../utils/ragEngine';

export default function ChatWidget() {
  const [open, setOpen] = useState(false), [draft, setDraft] = useState(''), [messages, setMessages] = useState([]);
  const [language, setLanguage] = useState('auto'), [semantic, setSemantic] = useState(false), [notice, setNotice] = useState(''), [listening, setListening] = useState(false);
  const input = useRef(), launcher = useRef(), log = useRef(), serial = useRef(0), recognition = useRef();
  useEffect(() => { if (open) input.current?.focus(); }, [open]);
  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight }); }, [messages, open]);
  useEffect(() => () => { serial.current++; recognition.current?.abort(); window.speechSynthesis?.cancel(); }, []);
  function close() { setOpen(false); setListening(false); recognition.current?.abort(); window.speechSynthesis?.cancel(); launcher.current?.focus(); }
  function clear() { serial.current++; recognition.current?.abort(); setListening(false); window.speechSynthesis?.cancel(); setMessages([]); setNotice(''); input.current?.focus(); }
  async function ask(event, suggestion) {
    event?.preventDefault(); const question = (suggestion || draft).trim(); if (!question) return;
    const id = ++serial.current, answerId = `answer-${id}`;
    const result = answerQuestion(question, { language });
    setDraft(''); setNotice('');
    setMessages(current => [...current, { role: 'user', content: question }, { ...result, id: answerId, role: 'assistant', content: result.answer }]);
    window.dispatchEvent(new CustomEvent('portfolio:assistant', { detail: { state: 'speaking' } }));
    // Keep an instant, grounded answer while optional local generation loads.
    if (semantic && (result.sources?.length || result.allowSemantic)) {
      setNotice('Loading local AI. The first model download can take a few minutes; the source answer stays visible.');
      let enhanced = null;
      try { enhanced = await semanticAnswer(question, language, text => { if (serial.current === id) setNotice(text); }); } catch { /* Local answer remains usable. */ }
      if (serial.current !== id) return;
      if (enhanced) setMessages(current => current.map(m => m.id === answerId ? { ...m, ...enhanced, content: enhanced.answer } : m));
      setNotice(enhanced?.mode === 'local-llm' ? 'AI answer verified against the cited portfolio sources.' : enhanced ? 'Retrieved source text shown; the AI did not produce a verifiable quote.' : 'The local source answer remains active. AI may be unsupported or still unavailable on this device.');
    }
  }
  function voice() {
    if (listening) { recognition.current?.stop(); return; }
    const Engine = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Engine) { setNotice('Voice input is unavailable in this browser. You can type your question.'); return; }
    recognition.current?.abort(); const engine = new Engine(); recognition.current = engine; engine.lang = language === 'ur' ? 'ur-PK' : 'en-US';
    engine.onstart = () => { setListening(true); setNotice('Listening… speak your question, then send it.'); };
    engine.onend = () => setListening(false);
    engine.onresult = e => { setDraft(e.results[0][0].transcript.slice(0, 1000)); input.current?.focus(); };
    engine.onerror = () => { setListening(false); setNotice('Voice input could not start. Check microphone permission or type your question.'); };
    try { engine.start(); } catch { setNotice('Please type your question.'); }
  }
  function speak(message) { if (!window.speechSynthesis) return; window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(message.content); utterance.lang = message.language === 'ur' ? 'ur-PK' : 'en-US'; window.speechSynthesis.speak(utterance); }
  return <div className="assistant-widget"><AnimatePresence>{open && <motion.section className="chat-panel" role="dialog" aria-label="Ask about Muhammad Huzaifa" aria-modal="false" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} onKeyDown={e => { if (e.key === 'Escape') close(); }}>
    <header className="chat-header"><div className="chat-avatar"><Sparkles size={21} /></div><div><h2>Ask about Huzaifa</h2><p>Free local knowledge · English / اردو</p></div><button type="button" className="chat-icon" onClick={close} aria-label="Close assistant"><X size={19} /></button></header>
    <div className="chat-options"><label>Answer language<select value={language} onChange={e => setLanguage(e.target.value)}><option value="auto">Auto / خودکار</option><option value="en">English</option><option value="ur">اردو</option></select></label><label className="read-aloud"><input type="checkbox" checked={semantic} onChange={e => setSemantic(e.target.checked)} /> Local LLM (download)</label><button type="button" className="chat-icon" onClick={clear} aria-label="Clear conversation"><Trash2 size={16} /></button></div>
    <div className="chat-log" ref={log} role="log" aria-live="polite" aria-relevant="additions text">{!messages.length && <div className="chat-welcome"><span>HELLO, CURIOUS HUMAN.</span><h3>Get to know the maker.</h3><p>Ask about projects, skills, education or experience. No account or paid API is needed.</p><div>{['Tell me about R.I.S.E', 'What is his experience?', 'What is his education?'].map(q => <button type="button" key={q} onClick={e => ask(e, q)}>{q}</button>)}</div></div>}{messages.map((m, i) => <article key={m.id || i} className={`chat-message ${m.role}`} dir={m.language === 'ur' ? 'rtl' : 'auto'}><span className="chat-speaker">{m.role === 'user' ? 'You' : 'Portfolio assistant'}</span><p>{m.content}</p>{m.sources?.length > 0 && <div className="chat-sources">{m.sources.map(s => <a key={s.id} href={s.href} onClick={close} title={s.quote}>{s.title} ↗</a>)}</div>}{m.role === 'assistant' && <button className="chat-icon" type="button" onClick={() => speak(m)} aria-label="Read answer aloud" disabled={!window.speechSynthesis}><Volume2 size={14} /></button>}</article>)}</div>
    {notice && <p className="chat-privacy" role="status">{notice}</p>}<form className="chat-compose" onSubmit={ask}><label className="sr-only" htmlFor="chat-question">Your question about Muhammad Huzaifa</label><input id="chat-question" ref={input} value={draft} onChange={e => setDraft(e.target.value)} maxLength={1000} placeholder="Ask in English or اردو…" autoComplete="off" /><button type="button" className="chat-icon" onClick={voice} aria-pressed={listening} aria-label={listening ? "Stop voice input" : "Start voice input"}><Mic size={18} /></button><button type="submit" className="chat-send" disabled={!draft.trim()} aria-label="Send question"><Send size={17} /></button></form><p className="chat-privacy">Answers cite portfolio facts. Optional AI downloads free models and runs on your device. Voice input uses your browser’s speech service and microphone permission.</p>
  </motion.section>}</AnimatePresence><PlayfulButton ref={launcher} type="button" className="assistant-launcher" onClick={() => open ? close() : setOpen(true)} aria-label={open ? 'Close portfolio assistant' : 'Open portfolio assistant'} aria-expanded={open}>{open ? <X size={22} /> : <MessageCircle size={22} />}</PlayfulButton></div>;
}
