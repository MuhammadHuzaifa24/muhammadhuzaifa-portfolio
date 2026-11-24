import ffmpeg from 'ffmpeg-static';
import {spawnSync} from 'node:child_process';
import {mediaDelivery} from '../src/mediaDelivery.js';
for(const [src,files] of Object.entries(mediaDelivery)){
 const r=spawnSync(ffmpeg,['-hide_banner','-i',`public${files.webm}`,'-t','8','-vn','-af','volumedetect','-f','null','-'],{encoding:'utf8',windowsHide:true});
 const lines=r.stderr.split('\n').filter(l=>/Audio:|mean_volume|Duration:/.test(l)); console.log(src,lines.join(' / ')); if(r.status!==0||!r.stderr.includes('Audio: opus')||r.stderr.includes('mean_volume: -inf'))process.exitCode=1;
}
