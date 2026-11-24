import { Box, Code2, BrainCircuit, Gamepad2, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { HighlightCard, stagger } from './MotionPrimitives';
import SectionHeading from './SectionHeading';
const groups = [
  { icon: Box, title: '3D Modeling', subtitle: 'Custom assets for real-time worlds.', skills: ['Blender', 'Custom Avatars', 'glTF / GLB'] },
  { icon: Gamepad2, title: 'VR & Game Engines', subtitle: 'Gameplay, interaction, and immersion.', skills: ['Unity', 'C#', 'Unreal Engine', 'C++', 'AR / VR'] },
  { icon: Code2, title: 'Web Development', subtitle: 'Responsive interfaces with a third dimension.', skills: ['React', 'Three.js', 'React Three Fiber', 'Tailwind CSS', 'JavaScript', 'HTML / CSS'] },
  { icon: BrainCircuit, title: 'AI / Backend', subtitle: 'Intelligent learning and connected systems.', skills: ['Python', 'RAG', 'MCP', 'Hugging Face', 'PHP', 'MySQL'] },
];
export default function Skills() {
  return <section id="skills" className="section-wrap section-space"><SectionHeading number="02" eyebrow="MY CREATIVE TOOLKIT" title={<>Ideas need<br /><span className="text-orange">good tools.</span></>}>The tools behind my games, immersive experiences, web applications, and AI learning projects.</SectionHeading><motion.div className="skills-grid" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>{groups.map(({ icon: Icon, title, subtitle, skills }, index) => <HighlightCard className="skill-card" key={title}><div className="skill-card-top"><Icon size={27} strokeWidth={1.4} /><span>0{index + 1}</span></div><h3>{title}</h3><p>{subtitle}</p><div className="tags">{skills.map(skill => <span key={skill}>{skill}</span>)}</div></HighlightCard>)}</motion.div><div className="section-footnote"><span>Also in my toolkit: Adobe Illustrator, Photoshop, creative thinking, and team collaboration.</span><ArrowUpRight size={18} /></div></section>;
}
