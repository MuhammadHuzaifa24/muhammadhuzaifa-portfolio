import ffmpeg from 'ffmpeg-static';
import { spawn } from 'node:child_process';
import { mkdir, writeFile, access, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const work = path.join(root, 'creative/promo');
await mkdir(work, { recursive: true });
await import('./prepare-promo-assets.mjs');
const image = name => path.join(root, 'public/media/images', name);
const video = name => path.join(root, 'public/media/videos', name);
const W = 1920, H = 1080, FPS = 60;
const scenes = [
  { title: 'Intro & Branding', start: 0, duration: 8, lines: ['MUHAMMAD', 'HUZAIFA'], detail: 'Game Designer / 3D Artist / Web3D Developer', image: 'myavatar.png' },
  { title: 'Core Skills & Tech Stack', start: 8, duration: 10, lines: ['THE TOOLS', 'BEHIND THE WORLDS'], detail: 'Unity / Blender / React / Three.js / C# / Python' },
  { title: '3D Gameplay', start: 18, duration: 12, lines: ['WADA', 'THE SIGNAL SHUTDOWN'], detail: 'Open-world combat / Sci-fi survival' },
  { title: 'R.I.S.E / VR Rehabilitation', start: 30, duration: 12, lines: ['R.I.S.E'], detail: 'Hand tracking / VR shape sorting / Parent survey analytics' },
  { title: '2D Arcade & Blender Characters', start: 42, duration: 10, lines: ['ARCADE WORLDS / 3D CHARACTERS'], detail: 'FlappyBird / MrJungle / NinniTrap / Kiki / Mochi 3D / MyAvatar' },
  { title: 'Achievements & Contact', start: 52, duration: 8, lines: ['LET US BUILD', 'SOMETHING', 'TOGETHER.'], detail: 'huzaifaraees6146@gmail.com', image: 'GameConRunner.jpg' },
];
await writeFile(path.join(work, 'storyboard.json'), JSON.stringify({ duration: 60, width: W, height: H, fps: FPS, scenes }, null, 2));
const font = 'C\\:/Windows/Fonts/arialbd.ttf', regular = 'C\\:/Windows/Fonts/arial.ttf';
const esc = value => value.replace(/'/g, '’').replace(/:/g, '\\:');
const text = (value, x, y, size = 34, color = '17212b', extra = '') => `drawtext=fontfile='${font}':text='${esc(value)}':fontsize=${size}:fontcolor=0x${color}:x='${x}':y='${y}'${extra}`;
const small = (value, x, y, color = '64748b') => `drawtext=fontfile='${regular}':text='${esc(value)}':fontsize=24:fontcolor=0x${color}:x=${x}:y=${y}`;
function run(args) { return new Promise((resolve, reject) => {
  const child = spawn(ffmpeg, ['-y', '-nostdin', '-hide_banner', '-loglevel', 'error', '-filter_complex_threads', '2', ...args], { cwd: root, windowsHide: true });
  let errors = ''; child.stderr.on('data', data => { errors += data; });
  child.on('error', reject); child.on('close', code => code === 0 ? resolve() : reject(new Error(errors.slice(-5000))));
}); }
const loopImage = src => ['-loop', '1', '-framerate', String(FPS), '-threads', '1', '-i', src];
const clipInput = (src, offset = 0) => ['-ss', String(offset), '-stream_loop', '-1', '-threads', '1', '-i', src];
const encode = ['-r', String(FPS), '-an', '-c:v', 'libx264', '-threads', '4', '-preset', 'veryfast', '-crf', '23', '-profile:v', 'high', '-level:v', '4.2', '-pix_fmt', 'yuv420p'];
const selection = process.argv.find(arg => arg.startsWith('--chapters='))?.split('=')[1]?.split(',').map(Number);
async function chapter(i, inputs, filter) {
  if (selection && !selection.includes(i)) return;
  const filename = path.join(work, `scene-${i}.filter`); await writeFile(filename, filter);
  await run([...inputs, '-filter_complex_script', filename, '-map', '[out]', '-t', String(scenes[i].duration), ...encode, path.join(work, `scene-${i}.mp4`)]);
  console.log(`Rendered ${i+1}/6: ${scenes[i].title}`);
}
// Re-encode the actual browser-recorded orbit captures for AE-compatible import.
for (const name of ['kiki', 'mochi', 'avatar']) {
  const raw = path.join(work, 'turntables', `${name}.webm`); await access(raw);
  await run([...clipInput(raw), '-t', '10', '-vf', 'fps=60,scale=640:360:force_original_aspect_ratio=decrease,pad=640:360:(ow-iw)/2:(oh-ih)/2:color=0xf4f3ef', '-an', '-c:v', 'libx264', '-threads', '2', '-preset', 'veryfast', '-crf', '21', '-pix_fmt', 'yuv420p', path.join(work, 'turntables', `${name}.mp4`)]);
}
// 00:00–00:08: cream studio, kinetic name, subtle camera push and RGB offset.
await chapter(0, loopImage(image('myavatar.png')), `[0:v]scale=820:780:force_original_aspect_ratio=increase,crop=820:780,setsar=1[portrait];color=c=0xf4f3ef:s=1920x1080:r=60:d=8[bg];[bg][portrait]overlay=x='1010+90*exp(-3*t)':y='120+10*sin(t*.8)'[p];[p]drawbox=x=90:y=130:w=85:h=7:color=0xf97316:t=fill,${small('PORTFOLIO / MUHAMMAD HUZAIFA',90,190)},${text('MUHAMMAD','90+120*exp(-5*t)',340,100)},${text('HUZAIFA.','90+120*exp(-5*t)',460,110,'f97316')},${small('Game Designer / 3D Artist',96,660)},${small('Web3D Developer / NED University, Karachi',96,708)},rgbashift=rh=4:bh=-4:enable='lt(t,.25)',fade=t=in:st=0:d=0.25:color=0xf4f3ef,format=yuv420p[out]`);
// 00:08–00:18: floating vendor marks, staggered grid entry and light-leak flash.
const brands = [['Unity','UNITY'],['Blender','BLENDER'],['React','REACT'],['Threedotjs','THREE.JS'],['Csharp','C#'],['Python','PYTHON']];
let grid = `color=c=0xf4f3ef:s=1920x1080:r=60:d=10[b0];`;
for (let i=0;i<6;i++) {
  const x=100+(i%3)*600,y=190+Math.floor(i/3)*390;
  grid += `[b${i}]drawbox=x=${x}:y=${y}:w=520:h=320:color=white:t=fill[b${i}a];[${i}:v]scale=150:150,format=rgba[logo${i}];[b${i}a][logo${i}]overlay=x=${x+185}:y='${y+55}+35*exp(-5*max(0,t-${i*.12}))+10*sin(t*1.5+${i})':enable='gte(t,${i*.12})'[b${i+1}];`;
}
grid += `[b6]${text('THE TOOLS / BEHIND THE WORLDS',100,70,44)},${brands.map((b,i)=>text(b[1],245+(i%3)*600,435+Math.floor(i/3)*390,30)).join(',')},${small('Unity / Blender / React / Three.js / C# / Python',100,1000)},fade=t=in:st=0:d=0.18:color=white,fade=t=out:st=9.85:d=0.15:color=white,format=yuv420p[out]`;
await chapter(1, brands.flatMap(([name])=>loopImage(path.join(work,'branding',`${name}.png`))), grid);
// 00:18–00:30: supplied gameplay, a short whip/slide cut and readable HUD labels.
await chapter(2, [...clipInput(video('WADA.mp4'),10),...clipInput(video('signal-shutdown.mp4'),4)], `[0:v]fps=60,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,settb=AVTB,trim=duration=6.125,setpts=PTS-STARTPTS[w];[1:v]fps=60,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,settb=AVTB,trim=duration=6.125,setpts=PTS-STARTPTS[s];[w][s]xfade=transition=slideleft:duration=0.25:offset=5.875,drawbox=x=55:y=55:w=900:h=126:color=0x17212bd9:t=fill,${text('WADA',86,84,48,'ffffff',":enable='lt(t,6)' ")},${text('THE SIGNAL SHUTDOWN',86,84,44,'ffffff',":enable='gte(t,6)' ")},${small('3D GAMEPLAY / UNITY / C#',86,145,'ffffff')},format=yuv420p[out]`);
// 00:30–00:42: use the supplied R.I.S.E workflow footage, not invented statistics.
await chapter(3, clipInput(video('fyp.mp4'),42), `[0:v]fps=60,scale=1320:744:force_original_aspect_ratio=increase,crop=1260:710:x='30+18*sin(t*.35)':y=17,setsar=1[demo];color=c=0xf4f3ef:s=1920x1080:r=60:d=12[b];[b][demo]overlay=x='570+70*exp(-4*t)':y=210[p];[p]${text('R.I.S.E',90,80,78)},${small('VR REHABILITATION & EDUCATIONAL SUPPORT',96,174)},drawbox=x=90:y=300:w=420:h=140:color=white@.85:t=fill,drawbox=x=90:y=490:w=420:h=140:color=white@.85:t=fill,drawbox=x=90:y=680:w=420:h=140:color=white@.85:t=fill,${text('HAND TRACKING',120,355,30,'9a3412')},${text('VR SHAPE SORTING',120,545,30,'9a3412')},${text('PARENT ANALYTICS',120,735,30,'9a3412')},${small('Unity / C# / Immersive interaction',96,970)},fade=t=in:st=0:d=0.2:color=0xf4f3ef,format=yuv420p[out]`);
// 00:42–00:52: 2D images/gameplay over real 3D turntable recordings.
const arcadeInputs = [...loopImage(image('flappybird.jpg')),...loopImage(image('mrjungle.jpg')),...clipInput(video('ninnitrap.mp4'),4),...['kiki','mochi','avatar'].flatMap(name=>clipInput(path.join(work,'turntables',`${name}.mp4`)))];
let split = 'color=c=0xf4f3ef:s=1920x1080:r=60:d=10[c0];';
const labels=['FlappyBird','MrJungle','NinniTrap','Kiki the Explorer','Mochi 3D','MyAvatar'];
for(let i=0;i<6;i++) {
 const x=70+(i%3)*600,y=i<3?155:605;
 split+=`[${i}:v]fps=60,scale=570:330:force_original_aspect_ratio=decrease,pad=570:330:(ow-iw)/2:(oh-ih)/2:color=0xf4f3ef,setsar=1[t${i}];[c${i}][t${i}]overlay=x=${x}:y=${y}[c${i+1}];`;
}
split+=`[c6]${text('ARCADE WORLDS / 3D CHARACTERS',70,58,44)},${labels.map((name,i)=>text(name,90+(i%3)*600,i<3?500:950,28)).join(',')},fade=t=in:st=0:d=0.18:color=0xf4f3ef,format=yuv420p[out]`;
await chapter(4,arcadeInputs,split);
// 00:52–01:00: real award photo, original particle accents and direct contact.
let particles='';for(let i=0;i<12;i++) particles+=','+text('·',`${90+i*145}+12*sin(t+${i})`,`${100+(i%4)*220}+20*cos(t*.8+${i})`,52,'f9731644');
await chapter(5,loopImage(image('GameConRunner.jpg')),`[0:v]scale=820:740:force_original_aspect_ratio=decrease,pad=820:740:(ow-iw)/2:(oh-ih)/2:color=0xf4f3ef,setsar=1[award];color=c=0xf4f3ef:s=1920x1080:r=60:d=8[b];[b][award]overlay=x=1020:y=170[p];[p]${text('GAMECON / RUNNER-UP',100,120,30,'9a3412')},${text('LET US BUILD','100+70*exp(-4*t)',300,88)},${text('SOMETHING','100+70*exp(-4*t)',405,88)},${text('TOGETHER.','100+70*exp(-4*t)',510,88,'f97316')},${small('Let’s build something together.',106,720)},${text('huzaifaraees6146@gmail.com',106,780,30)},${small('Muhammad Huzaifa / Game Designer & Developer',106,980)}${particles},fade=t=out:st=7:d=1:color=black,format=yuv420p[out]`);
await writeFile(path.join(work,'concat.txt'),scenes.map((_,i)=>`file 'scene-${i}.mp4'`).join('\n'));
const synth=`aevalsrc='0.13*sin(2*PI*55*t)*exp(-30*mod(t,0.428571))+0.05*sin(2*PI*110*t)*pow(sin(PI*mod(t,1.714284)/1.714284),2)+0.025*tanh(4*sin(2*PI*220*t))*exp(-10*mod(t,0.214285))+0.025*sin(2*PI*329.63*t)+0.02*sin(2*PI*261.63*t)':s=48000:d=60`;
const whooshes=[8,18,30,42,52].map(t=>`0.12*exp(-18*abs(t-${t}))`).join('+');
const noiseVolume=`0.065*exp(-55*mod(t+0.428571,0.857142))+0.02*exp(-100*mod(t,0.214285))+if(between(t,18,30),0.08*exp(-60*mod(t,0.857142)),0)+${whooshes}`;
await run(['-f','lavfi','-i',synth,'-f','lavfi','-i','anoisesrc=color=pink:amplitude=1:sample_rate=48000:duration=60:seed=314159','-filter_complex',`[1:a]highpass=f=900,lowpass=f=6000,volume='${noiseVolume}':eval=frame[drums];[0:a][drums]amix=inputs=2:normalize=0,afade=t=in:d=0.4,afade=t=out:st=58:d=2,loudnorm=I=-18:TP=-1.5:LRA=8[music]`,'-map','[music]','-ar','48000','-ac','2',path.join(work,'background.wav')]);
await run(['-f','concat','-safe','0','-i',path.join(work,'concat.txt'),'-i',path.join(work,'background.wav'),'-map','0:v','-map','1:a','-c:v','copy','-c:a','aac','-b:a','192k','-t','60','-movflags','+faststart','-metadata','title=Muhammad Huzaifa Portfolio Showreel',path.join(work,'promo-next.mp4')]);
await rename(path.join(work,'promo-next.mp4'),video('promo.mp4'));
await run(['-ss','3','-i',path.join(work,'scene-0.mp4'),'-frames:v','1','-q:v','2',image('promo-poster.jpg')]);
await writeFile(path.join(work,'AUDIO_PROVENANCE.txt'),'Original 140 BPM synthesized synthwave-style music, percussion and transition/impact sounds created in this workspace. No third-party recordings or samples were used.\n');
console.log('Created 60-second, 1920x1080, 60-fps H.264/AAC showreel with original stereo music.');
