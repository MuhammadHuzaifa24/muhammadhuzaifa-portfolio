import ffmpeg from 'ffmpeg-static';
import {spawn} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {mediaDelivery} from '../src/mediaDelivery.js';
for(const [src,files] of Object.entries(mediaDelivery)){
 if(process.argv.length>2 && !process.argv.slice(2).some(n=>src.endsWith('/'+n+'.mp4')))continue;
 const native=files.smooth.replace('.mp4','-native.mp4');
 await new Promise((resolve,reject)=>{const p=spawn(ffmpeg,['-y','-nostdin','-hide_banner','-loglevel','error','-i',`public${files.smooth}`,'-i',`public${files.audio}`,'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','copy','-movflags','+faststart','-shortest',`public${native}`],{windowsHide:true});let err='';p.stderr.on('data',d=>err+=d);p.on('error',reject);p.on('close',c=>c?reject(Error(err)):resolve());});
 files.native=native;console.log(`Prepared H264 + MP3 in one video: ${src}`);
}
await writeFile('src/mediaDelivery.js',`// Original footage plus browser-compatible video/audio delivery.\nexport const mediaDelivery = ${JSON.stringify(mediaDelivery,null,2)};\n`);
