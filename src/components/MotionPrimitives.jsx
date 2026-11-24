import { motion, useReducedMotion, useSpring } from 'framer-motion';
const playfulSpring = { type: 'spring', stiffness: 340, damping: 18 };
export function PlayfulButton({ children, ...props }) {
  const reduced = useReducedMotion();
  return <motion.button whileHover={reduced ? undefined : { scale: 1.05, rotate: 1 }} whileTap={reduced ? undefined : { scale: 0.94, rotate: -1 }} transition={playfulSpring} {...props}>{children}</motion.button>;
}
export function PlayfulLink({ children, ...props }) {
  const reduced = useReducedMotion();
  return <motion.a whileHover={reduced ? undefined : { scale: 1.05, rotate: 1 }} whileTap={reduced ? undefined : { scale: 0.96 }} transition={playfulSpring} {...props}>{children}</motion.a>;
}
export const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.11, delayChildren: 0.08 } } };
export const enter = { hidden: { opacity: 0, y: 26 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } };

export function Magnetic({ children, className = '', ...props }) {
  const reduced = useReducedMotion();
  const x = useSpring(0, { stiffness: 260, damping: 18 }), y = useSpring(0, { stiffness: 260, damping: 18 });
  return <motion.a {...props} className={className} style={{ x, y }} whileHover={reduced ? undefined : { scale: 1.05, rotate: 1 }} whileTap={reduced ? undefined : { scale: 0.95 }} transition={playfulSpring} onPointerMove={event => {
    if (reduced || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * 0.16); y.set((event.clientY - rect.top - rect.height / 2) * 0.2);
  }} onPointerLeave={() => { x.set(0); y.set(0); }}>{children}</motion.a>;
}
// Shared motion and surface treatment for every portfolio content card.
export function HighlightCard({ as = 'article', children, className = '', ...props }) {
  const reduced = useReducedMotion();
  const Card = { article: motion.article, div: motion.div, li: motion.li }[as] || motion.article;
  return <Card variants={enter} {...props} className={`highlight-card ${className}`} whileHover={reduced ? undefined : { y: -4, scale: 1.01, transition: { duration: 0.2, ease: 'easeOut' } }}>{children}</Card>;
}
