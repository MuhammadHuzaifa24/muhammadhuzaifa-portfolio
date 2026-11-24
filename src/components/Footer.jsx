import { PlayfulLink } from './MotionPrimitives';
import { ArrowUp } from 'lucide-react';
export default function Footer() {
  return <footer className="footer section-wrap"><PlayfulLink className="brand" href="#home" aria-label="Muhammad Huzaifa home"><span className="brand-first">Muhammad</span> Huzaifa<span className="brand-dot">.</span></PlayfulLink><p>© {new Date().getFullYear()} Muhammad Huzaifa. Made with curiosity.</p><PlayfulLink href="#home" className="back-top">Back to top <ArrowUp size={15} /></PlayfulLink></footer>;
}
