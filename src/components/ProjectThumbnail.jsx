import { useState } from 'react';
import { ArrowUpRight, Play, Box, Image as ImageIcon } from 'lucide-react';

export default function ProjectThumbnail({ project }) {
  const [failed, setFailed] = useState(false);
  const first = project.media?.[0];
  const Icon = first?.type === 'video' ? Play : first?.type === 'model' ? Box : ImageIcon;
  return <div className={`project-thumbnail ${project.thumbnail && !failed ? 'has-image' : 'is-fallback'}`}>
    {project.thumbnail && !failed ? <img src={project.thumbnail} alt={`${project.title} project preview`} loading="lazy" decoding="async" onError={() => setFailed(true)} /> : <div className="project-thumbnail-fallback"><span className="mono-label">{project.category || project.discipline}</span><strong>{project.title}</strong><span>IDEAS BUILT TO EXPLORE</span></div>}
    <span className="project-media-badge"><Icon size={14} />{first?.type === 'video' ? 'Watch film' : first?.type === 'model' ? 'Explore in 3D' : first?.type === 'image' ? 'View image' : 'Explore project'}</span><ArrowUpRight className="project-thumbnail-arrow" size={20} />
  </div>;
}
