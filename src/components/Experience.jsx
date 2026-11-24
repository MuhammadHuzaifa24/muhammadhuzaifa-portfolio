import { motion } from 'framer-motion';
import { BriefcaseBusiness, MapPin } from 'lucide-react';
import { HighlightCard, stagger } from './MotionPrimitives';
import SectionHeading from './SectionHeading';
import { experience } from '../data';
export default function Experience() {
  return <section id="experience" className="section-wrap section-space"><SectionHeading number="05" eyebrow="PROFESSIONAL WORK & INVOLVEMENT" title={<>Learning by<br /><span className="text-orange">doing the work.</span></>}>Studio game development, freelance visual design, and collaborative society work.</SectionHeading><motion.div className="experience-grid" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>{experience.map(job => <HighlightCard key={job.title} className="experience-card"><div className="experience-top"><BriefcaseBusiness size={23} /><span className="mono-label">{job.dates}</span></div><h3>{job.title}</h3><p className="experience-company">{job.organization}</p><p className="experience-location"><MapPin size={13} />{job.location}</p><p>{job.description}</p><ul>{job.highlights.map(point => <li key={point}>{point}</li>)}</ul><div className="tags">{job.tags.map(tag => <span key={tag}>{tag}</span>)}</div></HighlightCard>)}</motion.div></section>;
}
