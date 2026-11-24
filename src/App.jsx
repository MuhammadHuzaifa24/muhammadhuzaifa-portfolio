import { scrollToSection } from './utils/sectionNavigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, MotionConfig, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Promo from './components/Promo';
import Education from './components/Education';
import Experience from './components/Experience';
import Contact from './components/Contact';
import ChatWidget from './components/ChatWidget';
import Footer from './components/Footer';
import { enter, stagger } from './components/MotionPrimitives';

let viewCounted = false;
function Reveal({ children }) {
  return <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}><motion.div variants={enter}>{children}</motion.div></motion.div>;
}
export default function App() {
  useEffect(() => {
    if (!viewCounted && navigator.doNotTrack !== '1') { viewCounted = true; fetch('/api/analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'page_view' }), keepalive: true }).catch(() => {}); }
  }, []);
  const [playground, setPlayground] = useState(false);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 28 });
  const navigation = useRef(0);
  const navigate = useCallback(id => {
    cancelAnimationFrame(navigation.current);
    setPlayground(false);
    const started = performance.now();
    const land = () => {
      if (document.getElementById('mobile-menu') && performance.now()-started < 800) {
        navigation.current = requestAnimationFrame(land); return;
      }
      scrollToSection(id, !!reduced);
    };
    navigation.current = requestAnimationFrame(land);
  }, [reduced]);
  useEffect(() => {
    const anchors = event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target.closest?.('a[href^="#"]');
      const id = anchor?.getAttribute('href')?.slice(1);
      if (!id || !document.getElementById(id)) return;
      event.preventDefault(); navigate(id);
    };
    document.addEventListener('click', anchors);
    const hash = decodeURIComponent(location.hash.slice(1));
    if (hash) navigation.current = requestAnimationFrame(() => scrollToSection(hash, true));
    return () => { document.removeEventListener('click', anchors); cancelAnimationFrame(navigation.current); };
  }, [navigate]);
  return <MotionConfig reducedMotion="user"><motion.div className="scroll-progress" style={{ scaleX: reduced ? scrollYProgress : progress }} /><div className="ambient-wash" aria-hidden="true" /><a className="skip-link" href="#main">Skip to content</a><Navbar /><main id="main" className="studio-page"><Hero playground={playground} onPlaygroundChange={setPlayground} onNavigate={navigate} /><div className="ticker" aria-label="Areas of interest"><span>3D CHARACTERS</span><i>+</i><span>IMMERSIVE WORLDS</span><i>+</i><span>GAMES & INTERACTION</span><i>+</i><span>DESIGNED TO FEEL ALIVE</span></div><Reveal><About /></Reveal><Reveal><Skills /></Reveal><Reveal><Projects /></Reveal><Reveal><Promo /></Reveal><Reveal><Experience /></Reveal><Reveal><Education /></Reveal><Reveal><Contact /></Reveal></main><Footer /><ChatWidget /></MotionConfig>;
}
