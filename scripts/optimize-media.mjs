import ffmpeg from 'ffmpeg-static';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { mediaDelivery as previousDelivery } from '../src/mediaDelivery.js';
const names=['promo','fyp','WADA','TankTrouble','Furious7','signal-shutdown','ninnitrap','Ambugo'];
await mkdir('public/media/playback',{recursive:true});
await mkdir('public/media/audio',{recursive:true});
const run=args=>new Promise((resolve,reject)=>{const p=spawn(ffmpeg,['-y','-nostdin','-hide_banner','-loglevel','error',...args],{windowsHide:true});let error='';p.stderr.on('data',d=>error+=d);p.on('error',reject);p.on('close',c=>c===0?resolve():reject(Error(error)));});
const manifest={...previousDelivery};
for(const name of names){
 const original=`/media/videos/${name}.mp4`,smooth=`/media/playback/${name}.mp4`,audio=`/media/audio/${name}.mp3`;
 const small=name==='ninnitrap'||name==='signal-shutdown';
 if(!process.argv[2] || process.argv.slice(2).includes(name)) {
 await run(['-i',`public${original}`,'-map','0:v:0','-map','0:a:0','-vf',`scale=w='min(1280,iw)':h='min(720,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2,fps=${name==='ninnitrap'?20:30}`,'-c:v','libx264','-preset','veryfast','-threads','4','-crf',small?'27':'22',...(small?['-maxrate',name==='ninnitrap'?'190k':'650k','-bufsize','700k']:[]),'-profile:v','baseline','-level:v','3.1','-pix_fmt','yuv420p','-af','loudnorm=I=-16:TP=-1.5:LRA=9','-c:a','aac','-b:a',small?'96k':'160k','-ar','48000','-ac','2','-movflags','+faststart',`public${smooth}`]);
 await run(['-i',`public${original}`,'-vn','-af','loudnorm=I=-16:TP=-1.5:LRA=9','-c:a','libmp3lame','-b:a','160k','-ar','44100','-ac','2',`public${audio}`]);
 console.log(`Prepared ${name}: up to 720p / 30fps, AAC stereo + original-audio MP3`);
 }
 manifest[original]={...manifest[original],smooth,audio,webm:smooth.replace('.mp4','.webm')};
}
await writeFile('src/mediaDelivery.js',`// Browser-compatible delivery copies; original footage is preserved.\nexport const mediaDelivery = ${JSON.stringify(manifest,null,2)};\n`);
