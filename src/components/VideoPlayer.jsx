import { useEffect, useMemo, useRef, useState } from 'react';
import { mediaDelivery } from '../mediaDelivery';
import { videoSources } from '../utils/videoSources';

export default function VideoPlayer(props) {
  return <NativeVideo key={props.src} {...props} />;
}
function NativeVideo({ src, poster, title, className = 'project-video' }) {
  const sources = useMemo(() => videoSources(src, mediaDelivery[src]), [src]);
  const revision = mediaDelivery[src]?.revision || 'native-audio-v2';
  const player = useRef(), restore = useRef({time:0,volume:1,muted:false,resume:false});
  const [index,setIndex] = useState(0), [failed,setFailed] = useState(false);
  const switching = useRef(false), lastFailure = useRef('');
  function diagnostics(video) {
    video.dataset.audioDecodedBytes = String(video.webkitAudioDecodedByteCount ?? 'unsupported');
    video.dataset.audioTracks = String(video.audioTracks?.length ?? (video.mozHasAudio === true ? 1 : 'unsupported'));
    video.dataset.playbackTime = String(video.currentTime);
    video.dataset.playbackDuration = String(video.duration);
    video.dataset.playbackMuted = String(video.muted);
    video.dataset.playbackVolume = String(video.volume);
    video.dataset.lastFailure = lastFailure.current;
  }
  function nextSource(video, reason) {
    if (switching.current || video !== player.current) return;
    switching.current = true; lastFailure.current = reason;
    restore.current = {time:video.currentTime || 0,volume:video.volume,muted:video.muted,resume:!video.paused};
    video.pause();
    if (index + 1 < sources.length) setIndex(index + 1);
    else { setFailed(true); switching.current = false; }
  }
  useEffect(() => {
    switching.current = false;
    const video = player.current;
    // Preserve the visitor's native volume/mute choice across codec recovery.
    video.volume = restore.current.volume; video.muted = restore.current.muted;
    const stalled = setTimeout(() => { if (video.readyState === 0) nextSource(video,'metadata-timeout'); },15000);
    return () => { clearTimeout(stalled); video.pause(); };
  }, [index]);
  function loaded(video) {
    setFailed(false); diagnostics(video);
    if (restore.current.time) video.currentTime = Math.min(restore.current.time,Math.max(0,video.duration-.1));
    if (restore.current.resume) video.play().catch(()=>{});
  }
  function progress(video) {
    diagnostics(video);
    // Some embedded Chromium builds render H264 while silently rejecting AAC.
    // Retry the next integrated A/V source if a supported byte counter never decodes audio.
    if (!video.paused && video.currentTime > 4 && video.webkitAudioDecodedByteCount === 0)
      nextSource(video,'no-audio-decoded');
  }
  return <div className="video-player">
    <video key={index} ref={player} src={`${sources[index]}?playback=${revision}`} poster={poster} className={className}
      controls controlsList="nodownload" playsInline autoPlay={false} preload="metadata" aria-label={`${title} video`}
      data-source-index={index} onLoadedMetadata={event=>loaded(event.currentTarget)}
      onPlaying={event=>diagnostics(event.currentTarget)} onTimeUpdate={event=>progress(event.currentTarget)}
      onVolumeChange={event=>diagnostics(event.currentTarget)}
      onError={event=>nextSource(event.currentTarget,`media-${event.currentTarget.error?.code || 'unknown'}`)}>
      {src === '/media/videos/promo.mp4' && <track kind="captions" src="/media/files/portfolio-showreel-en.vtt" srcLang="en" label="English" />}
    </video>
    {failed && <div className="video-load-message" role="status"><p>The video could not load. Please retry playback.</p><button type="button" onClick={()=>{setFailed(false);restore.current.time=0;switching.current=false;if(index===0)player.current.load();else setIndex(0);}}>Retry video</button></div>}
  </div>;
}
