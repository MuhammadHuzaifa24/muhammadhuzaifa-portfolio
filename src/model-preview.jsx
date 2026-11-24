// Local-only asset capture page; omitted from the production entry points.
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import ProjectModelViewer from './components/3d/ProjectModelViewer';
const files = { kiki: '/media/models/Player.fbx', mochi: '/media/models/CHARAC.fbx', avatar: '/media/models/avatar.glb' };
const selected = new URLSearchParams(location.search).get('model');
function Studio() {
  const [canvas, setCanvas] = useState(null), [recording, setRecording] = useState(false), [status, setStatus] = useState('Ready');
  async function record() {
    if (!canvas || recording) return;
    setRecording(true); setStatus('Recording 10-second turntable...');
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    try {
      const stream = canvas.captureStream(60), chunks = [];
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8') ? 'video/webm;codecs=vp8' : 'video/webm';
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5000000 });
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop()); setRecording(false);
        const url = URL.createObjectURL(new Blob(chunks, { type: mimeType })), link = document.createElement('a');
        link.href = url; link.download = `${selected}-turntable.webm`; link.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000); setStatus('Turntable exported');
      };
      recorder.start(250); setTimeout(() => recorder.stop(), 10000);
    } catch (error) { setRecording(false); setStatus(error.message); }
  }
  return files[selected] ? <><ProjectModelViewer src={files[selected]} autoRotate={recording} onCanvasReady={setCanvas} /><div style={{ position:'fixed',top:12,left:12,zIndex:10,background:'white',padding:12,borderRadius:10,font:'12px Arial' }}><button type="button" onClick={record} disabled={!canvas || recording}>Record turntable</button><p role="status">{status}</p></div></> : <p>Select kiki, mochi, or avatar.</p>;
}
createRoot(document.getElementById('root')).render(<Studio />);
