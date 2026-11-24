import ffmpeg from 'ffmpeg-static';
import {spawn} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {mediaDelivery} from '../src/mediaDelivery.js';
for(const [source,files] of Object.entries(mediaDelivery)){
 if(process.argv.length>2 && !process.argv.slice(2).some(n=>source.endsWith('/'+n+'.mp4')))continue;
 const webm=files.smooth.replace('.mp4','.webm');
 await new Promise((resolve,reject)=>{const p=spawn(ffmpeg,['-y','-nostdin','-hide_banner','-loglevel','error','-i',`public${files.smooth}`,'-map','0:v:0','-map','0:a:0','-c:v','libvpx','-b:v','1400k','-crf','10','-deadline','realtime','-cpu-used','5','-threads','4','-c:a','libopus','-b:a','128k',`public${webm}`],{windowsHide:true});let err='';p.stderr.on('data',d=>err+=d);p.on('error',reject);p.on('close',c=>c?reject(Error(err)):resolve());});
 files.webm=webm;console.log(`WebM + Opus prepared: ${source}`);
}
await writeFile('src/mediaDelivery.js',`// Original footage plus browser-compatible video/audio delivery.\nexport const mediaDelivery = ${JSON.stringify(mediaDelivery,null,2)};\n`);
