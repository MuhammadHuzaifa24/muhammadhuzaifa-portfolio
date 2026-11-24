import ffmpeg from 'ffmpeg-static';
import {spawnSync} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
const root='creative/reference-reel',rate=48000,seconds=48,samples=rate*seconds,wav=Buffer.alloc(44+samples*4);
wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(2,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*4,28);wav.writeUInt16LE(4,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(samples*4,40);
const chords=[[146.83,185,220],[110,146.83,185],[123.47,146.83,185],[98,123.47,146.83]],notes=[587.33,440,739.99,659.25,587.33,493.88,440,369.99];const beat=60/118;let seed=318741,previous=0;
for(let i=0;i<samples;i++){const t=i/rate,b=t/beat,p=t%beat,note=notes[Math.floor(b*2)%8],arpPhase=t%(beat/2),chord=chords[Math.floor(b/8)%4];seed=(Math.imul(seed,1664525)+1013904223)|0;const noise=(seed>>>0)/2147483648-1,high=noise-previous;previous=noise;
 const pad=chord.reduce((s,f)=>s+Math.sin(2*Math.PI*f*t)+.3*Math.sin(2*Math.PI*(f*1.002)*t),0)*.009;
 const arp=Math.sin(2*Math.PI*note*t)*Math.exp(-arpPhase*12)*.035;
 const kick=Math.sin(2*Math.PI*(48*p+4*(1-Math.exp(-35*p))))*Math.exp(-p*25)*.105;
 const snare=Math.floor(b)%2===1?high*Math.exp(-p*32)*.035:0;
 const hat=high*Math.exp(-arpPhase*110)*.018;
 let fx=0;for(const cut of [6,12,17,23,30,37,41,44]){const d=t-cut;fx+=high*Math.exp(-Math.pow(d/.16,2))*.06;if(d>=0)fx+=Math.sin(2*Math.PI*52*d)*Math.exp(-d*11)*.04;}
 const fade=Math.min(1,t/.6,(48-t)/1.3);const left=Math.tanh((pad+arp+kick+snare+hat+fx)*1.6)*fade,right=Math.tanh((pad+Math.sin(2*Math.PI*note*(t-.004))*Math.exp(-arpPhase*12)*.027+kick+snare+hat+fx)*1.6)*fade;
 wav.writeInt16LE(Math.round(Math.max(-1,Math.min(1,left))*32767),44+i*4);wav.writeInt16LE(Math.round(Math.max(-1,Math.min(1,right))*32767),46+i*4);
}
await writeFile(`${root}/music.wav`,wav);
const segments=JSON.parse(await readFile(`${root}/narration.json`,'utf8'));let concat='';
const run=args=>{const r=spawnSync(ffmpeg,['-y','-nostdin','-hide_banner','-loglevel','error',...args],{encoding:'utf8',windowsHide:true});if(r.status)throw Error(r.stderr);};
for(let i=0;i<segments.length;i++){const file=`${root}/voice-${i}.mp3`;const info=spawnSync(ffmpeg,['-hide_banner','-i',file],{encoding:'utf8',windowsHide:true}).stderr;const m=/Duration: (\d+):(\d+):([\d.]+)/.exec(info);if(!m)throw Error('Narration missing: '+file);const duration=Number(m[1])*3600+Number(m[2])*60+Number(m[3]),target=segments[i].duration,tempo=Math.max(1,duration/(target-.35));run(['-i',file,'-af',`atempo=${tempo.toFixed(5)},aresample=48000,adelay=120|120,apad=pad_len=${target*48000},atrim=end_sample=${target*48000},afade=t=out:st=${target-.12}:d=0.12,asetpts=N/SR/TB`,'-ar','48000','-ac','2',`${root}/voice-fit-${i}.wav`]);console.log(`Voice ${i+1}: ${duration.toFixed(2)}s into ${target}s, tempo ${tempo.toFixed(2)}`);concat+=`file 'voice-fit-${i}.wav'\n`;}
await writeFile(`${root}/voice-concat.txt`,concat);run(['-f','concat','-safe','0','-i',`${root}/voice-concat.txt`,'-c:a','pcm_s16le',`${root}/narration.wav`]);
run(['-i',`${root}/narration.wav`,'-i',`${root}/music.wav`,'-filter_complex','[0:a]volume=1.3,aresample=48000[voice];[1:a]volume=0.5,aresample=48000[music];[voice][music]amix=inputs=2:duration=longest:normalize=0,alimiter=limit=0.9:level=false,apad=pad_len=2304000,atrim=end_sample=2304000,asetpts=N/SR/TB[out]','-map','[out]','-t','48','-ar','48000','-ac','2',`${root}/mix.wav`]);
await writeFile(`${root}/AUDIO_PROVENANCE.txt`,'Original 118 BPM electronic composition, synthesized percussion, transition whooshes and impacts. No reference audio or third-party music samples were copied. Original portfolio narration voiced with Microsoft Edge en-US-GuyNeural. Voice script: narration.json.\n');
console.log('Final 48-second stereo music / narration / SFX mix prepared.');

