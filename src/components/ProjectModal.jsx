import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import VideoPlayer from './VideoPlayer';
const ProjectModelViewer = lazy(() => import('./3d/ProjectModelViewer'));

function ImagePreview({ src, title }) {
  const [failed, setFailed] = useState(false);
  return failed ? <div className="media-unavailable" role="status">The image is unavailable. Please try another preview.</div> : <img className="project-full-image" src={src} alt={title} onError={() => setFailed(true)} />;
}

export default function ProjectModal({ project, onClose }) {
  const dialog = useRef(), closeButton = useRef();
  const [selected, setSelected] = useState(0), reduced = useReducedMotion();
  const media = project.media || [], active = media[selected];
  useEffect(() => {
    const previous = document.activeElement, overflow = document.body.style.overflow, element = dialog.current;
    element.showModal(); document.body.style.overflow = 'hidden'; closeButton.current?.focus();
    return () => { element.close(); document.body.style.overflow = overflow; if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, []);
  return createPortal(<motion.dialog ref={dialog} className="project-modal-overlay" aria-labelledby="project-modal-title" aria-describedby="project-modal-description" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.18 }} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <motion.div className="project-modal" initial={reduced ? false : { y: 24, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={reduced ? undefined : { y: 12, scale: 0.98 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
      <header className="project-modal-header"><div><p className="eyebrow">{project.category || project.discipline} / {project.type}</p><h3 id="project-modal-title">{project.title}</h3></div><button ref={closeButton} type="button" className="project-modal-close" onClick={onClose} aria-label="Close project preview"><X size={22} /></button></header>
      {media.length > 1 && <div className="project-media-options" role="group" aria-label="Choose project preview">{media.map((item, i) => <button key={item.src} type="button" aria-pressed={i === selected} onClick={() => setSelected(i)}>{item.label || item.type}</button>)}</div>}
      <div className="project-modal-stage" key={active?.src || 'details'}>{active?.type === 'video' ? <VideoPlayer src={active.src} poster={project.thumbnail} title={project.title} /> : active?.type === 'image' ? <ImagePreview src={active.src} title={`${project.title} full-size preview`} /> : active?.type === 'model' ? <Suspense fallback={<div className="media-unavailable" role="status">Opening the 3D viewer…</div>}><ProjectModelViewer src={active.src} /></Suspense> : <div className="media-unavailable"><span className="mono-label">BEHIND THE PROJECT</span><h4>{project.title}</h4><p>A media preview hasn’t been added for this project yet. Explore the project details below.</p></div>}</div>
      <div className="project-modal-details"><p id="project-modal-description">{project.description}</p><div className="tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>{(project.demo || project.repository) && <div className="project-links">{project.demo && <a href={project.demo} onClick={onClose}>Explore live experience <ExternalLink size={15} /></a>}{project.repository && <a href={project.repository} target="_blank" rel="noreferrer">Repository <ExternalLink size={15} /></a>}</div>}</div>
    </motion.div>
  </motion.dialog>, document.body);
}
