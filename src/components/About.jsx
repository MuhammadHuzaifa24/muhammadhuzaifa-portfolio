import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Box, BrainCircuit, Gamepad2, ArrowUpRight } from 'lucide-react';
import { enter, stagger, PlayfulLink } from './MotionPrimitives';
import SectionHeading from './SectionHeading';
import { profile } from '../data';
const AboutAvatarViewer = lazy(() => import('./3d/AboutAvatarViewer'));

export default function About() {
  return <section id="about" className="section-wrap section-space">
    <SectionHeading number="01" eyebrow="THE PERSON BEHIND THE PIXELS" title={<>Meet<br /><span className="text-orange">Muhammad Huzaifa.</span></>} />
    <div className="about-layout"><div className="about-art about-avatar-card glass-panel"><div className="art-label">THE MAKER / IN THREE DIMENSIONS</div><Suspense fallback={<div className="canvas-message">Preparing my avatar…</div>}><AboutAvatarViewer /></Suspense><span className="art-bottom">CUSTOM AVATAR · BUILT IN BLENDER <Box size={17} /></span></div>
    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="about-copy">
      <motion.p variants={enter} className="lead">I’m {profile.name}, a final-year Gaming and Animation student at NED University of Engineering and Technology, Karachi.</motion.p>
      <motion.p variants={enter}>I specialize in 3D graphics, VR/AR development, AI integration, and web applications. My work connects Unity gameplay, immersive environments, and interactive interfaces—from game prototypes to real-time experiences in the browser.</motion.p>
      <motion.p variants={enter}>My Final Year Design Project, R.I.S.E, explores VR rehabilitation and educational support using hand-tracking gloves and custom visual feedback. I also bring hands-on Unity and C# experience from The Game Storm Studio, alongside freelance visual design work.</motion.p>
      <div className="interest-list"><span><Box size={17} /> 3D graphics</span><span><Gamepad2 size={17} /> VR / AR & games</span><span><BrainCircuit size={17} /> AI & web applications</span></div>
      <div className="about-profile-links"><PlayfulLink href="#experience">My experience <ArrowUpRight size={15} /></PlayfulLink><PlayfulLink href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <ArrowUpRight size={15} /></PlayfulLink></div>
    </motion.div></div>
  </section>;
}
