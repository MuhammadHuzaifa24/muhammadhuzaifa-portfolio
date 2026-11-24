import { PlayfulLink } from './MotionPrimitives';
import { lazy, Suspense } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Magnetic, stagger, enter } from './MotionPrimitives';
import { profile } from '../data';
const AvatarViewer = lazy(() => import('./3d/AvatarViewer'));
export default function Hero({ playground, onPlaygroundChange, onNavigate }) {
  return <section id="home" className={`hero section-wrap ${playground ? 'playground-expanded' : ''}`}>
    <motion.div className="hero-intro" variants={stagger} initial="hidden" animate="visible"><motion.div variants={enter}><p className="eyebrow"><span className="status-dot" /> {profile.name.toUpperCase()} / GAME DESIGNER & DEVELOPER</p><h1>Built to explore.<br /><span>Made to <em>play.</em></span></h1></motion.div><motion.div variants={enter} className="hero-intro-aside"><p>I’m Muhammad Huzaifa. I make characters,<br />games, and worlds you can step into.</p><div className="hero-buttons"><Magnetic className="button button-primary" href="#projects">Explore the work <ArrowUpRight size={17} /></Magnetic><Magnetic className="button button-quiet" href="#film">Watch studio film <ArrowUpRight size={17} /></Magnetic></div></motion.div></motion.div>
    <motion.div className="hero-stage" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}><Suspense fallback={<div className="canvas-message">Opening the garage…</div>}><AvatarViewer active={playground} onActiveChange={onPlaygroundChange} onNavigate={onNavigate} /></Suspense></motion.div>
    <div className="hero-under"><span>PLAY / EXPLORE / MAKE SOMETHING UNEXPECTED.</span><PlayfulLink href="#about">MEET THE MAKER <ArrowDownRight size={15} /></PlayfulLink><span className="hero-under-end">WEB / 3D / AI / XR</span></div>
  </section>;
}
