import { PlayfulButton, PlayfulLink } from './MotionPrimitives';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Magnetic } from './MotionPrimitives';
import ThemeToggle from './ThemeToggle';

const links = ['Home', 'About', 'Skills', 'Projects', 'Film', 'Experience', 'Education', 'Contact'];
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('home');
  useEffect(() => {
    const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); }); }, { rootMargin: '-15% 0px -55% 0px' });
    document.querySelectorAll('section[id]').forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!open) return;
    const close = event => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open]);
  return <header className="nav-shell"><nav className="navbar" aria-label="Main navigation"><PlayfulLink className="brand" href="#home" onClick={() => setOpen(false)} aria-label="Muhammad Huzaifa home"><span className="brand-first">Muhammad</span> Huzaifa<span className="brand-dot">.</span></PlayfulLink><div className="desktop-links">{links.map(label => <PlayfulLink key={label} href={`#${label.toLowerCase()}`} aria-current={active === label.toLowerCase() ? 'location' : undefined} className={active === label.toLowerCase() ? 'active' : ''}>{label}</PlayfulLink>)}</div><Magnetic href="#contact" className="nav-cta">Let’s talk <ArrowUpRight size={15} /></Magnetic><ThemeToggle /><PlayfulButton type="button" className="mobile-toggle" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</PlayfulButton></nav><AnimatePresence>{open && <motion.div id="mobile-menu" className="mobile-menu" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>{links.map(label => <PlayfulLink key={label} href={`#${label.toLowerCase()}`} onClick={() => setOpen(false)}>{label}<ArrowUpRight size={16} /></PlayfulLink>)}</motion.div>}</AnimatePresence></header>;
}
