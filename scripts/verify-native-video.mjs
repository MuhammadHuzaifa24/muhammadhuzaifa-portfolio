import ffmpeg from 'ffmpeg-static';
import {spawnSync} from 'node:child_process';
import {mediaDelivery} from '../src/mediaDelivery.js';
for(const files of Object.values(mediaDelivery)){
 const result=spawnSync(ffmpeg,['-hide_banner','-i',`public${files.native}`,'-t','8','-vn','-af','volumedetect','-f','null','-'],{encoding:'utf8',windowsHide:true});
 const lines=result.stderr.split('\n').filter(l=>/Stream.*Audio: mp3|mean_volume/.test(l));
 console.log(files.native,lines.join(' / '));
 if(result.status!==0 || !result.stderr.includes('Audio: mp3') || result.stderr.includes('mean_volume: -inf'))process.exitCode=1;
}
