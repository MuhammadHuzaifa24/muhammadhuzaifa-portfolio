import test from 'node:test';
import assert from 'node:assert/strict';
import { ArcadeAudio } from '../src/utils/arcadeAudio.js';
import { mediaDelivery } from '../src/mediaDelivery.js';
import { projectMedia } from '../src/projectMedia.js';
import { access, stat } from 'node:fs/promises';
const param = () => ({value:0,setValueAtTime(v){this.value=v;},exponentialRampToValueAtTime(v){this.value=v;},setTargetAtTime(v){this.value=v;}});
class Context {
 constructor(){this.state='suspended';this.currentTime=1;this.destination={};this.oscillators=[];}
 createGain(){return {gain:param(),connect(){},disconnect(){}};}
 createBiquadFilter(){return {frequency:param(),connect(){},disconnect(){}};}
 createOscillator(){const o={frequency:param(),started:false,stopped:false,connect(){},disconnect(){},start(){this.started=true;},stop(){this.stopped=true;}};this.oscillators.push(o);return o;}
 async resume(){this.state='running';}
 async close(){this.state='closed';}
}
test('arcade audio starts only after unlock, changes RPM, mutes and cleans up', async()=>{
 const saved=globalThis.AudioContext;globalThis.AudioContext=Context;
 try {
  const audio=new ArcadeAudio();audio.start();assert.equal(audio.context,null);
  assert.equal(await audio.unlock(),true);audio.start();const engine=audio.engine;
  audio.start();assert.equal(audio.engine,engine);
  audio.update(5,true,false);assert.ok(engine.o.frequency.value>48);
  audio.horn();audio.crash();const count=audio.context.oscillators.length;
  audio.crash();assert.equal(audio.context.oscillators.length,count,'crash cooldown avoids repeated sound spam');
  audio.setEnabled(false);assert.equal(audio.engine,null);assert.equal(engine.o.stopped,true);
  audio.horn();assert.equal(audio.context.oscillators.length,count);
  audio.setEnabled(true);audio.start();const ctx=audio.context;audio.dispose();assert.equal(ctx.state,'closed');assert.equal(audio.context,null);
 } finally {globalThis.AudioContext=saved;}
});
test('every video has real smooth delivery and original soundtrack assets',async()=>{
 const expected = new Set(['/media/videos/promo.mp4', ...Object.values(projectMedia).flatMap(project => project.media.filter(item => item.type === 'video').map(item => item.src))]);
 assert.deepEqual(new Set(Object.keys(mediaDelivery)), expected);
 for(const [original,files] of Object.entries(mediaDelivery)){
  for(const path of [original,files.smooth,files.audio,files.webm,files.native]) await access(new URL(`../public${path}`,import.meta.url));
  const source=await stat(new URL(`../public${original}`,import.meta.url));const smooth=await stat(new URL(`../public${files.smooth}`,import.meta.url));
  assert.ok(smooth.size>1000);assert.ok(smooth.size<source.size,`delivery should be lighter: ${original}`);
 }
});

test('video recovery tries integrated MP3, WebM and MP4 sources without duplicates',async()=>{
 const {videoSources}=await import('../src/utils/videoSources.js');
 assert.deepEqual(videoSources('/original.mp4',{native:'/native.mp4',webm:'/clip.webm',smooth:'/smooth.mp4'}),['/native.mp4','/clip.webm','/smooth.mp4','/original.mp4']);
 assert.deepEqual(videoSources('/original.mp4',{smooth:'/original.mp4'}),['/original.mp4']);
});
