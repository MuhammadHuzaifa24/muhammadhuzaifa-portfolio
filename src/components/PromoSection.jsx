import { motion } from 'framer-motion';
import { Download, Film } from 'lucide-react';
import SectionHeading from './SectionHeading';
import VideoPlayer from './VideoPlayer';
import { enter, PlayfulLink } from './MotionPrimitives';

export default function PromoSection() {
  return <section id="film" className="section-wrap section-space promo-section">
    <SectionHeading number="04" eyebrow="MODULE 3 / PORTFOLIO SHOWREEL" title={<>A short film.<br /><span className="text-orange">A world of ideas.</span></>}>A cinematic 3D introduction to Muhammad Huzaifa: game worlds, immersive experiences, original characters, and the work behind them.</SectionHeading>
    <motion.div className="promo-video-frame" variants={enter} initial="hidden" whileInView="visible" viewport={{ once: true, amount: .15 }}>
      <VideoPlayer src="/media/videos/promo.mp4" poster="/media/images/promo-poster.jpg?reel=creative-worlds-48-v5" title="Muhammad Huzaifa portfolio showreel" className="promo-video" />
      <div className="promo-player-caption"><span><Film size={16} /> Creative Worlds · 48-second showreel</span><span>3D motion · Voice-over · Original music</span></div>
    </motion.div>
    <div className="promo-downloads"><p>Like what you see? Let’s build something together.</p><PlayfulLink href="/media/videos/promo.mp4?reel=creative-worlds-48-v5" download="Muhammad_Huzaifa_Showreel.mp4" className="button button-quiet"><Download size={16} /> Download MP4</PlayfulLink><PlayfulLink href="/media/files/Muhammad_Huzaifa_Resume.pdf?v=5b59df0a04db" download="Muhammad_Huzaifa_Resume.pdf" className="button button-primary"><Download size={16} /> Download résumé</PlayfulLink></div>
  </section>;
}
