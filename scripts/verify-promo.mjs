import ffmpeg from 'ffmpeg-static';
import {spawnSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
const header=spawnSync(ffmpeg,['-hide_banner','-i','public/media/videos/promo.mp4'],{encoding:'utf8',windowsHide:true}).stderr;
const duration=/Duration: ([^,]+)/.exec(header)?.[1],video=header.split('\n').find(l=>/Stream.*Video:/.test(l)),audio=header.split('\n').find(l=>/Stream.*Audio:/.test(l));
if(duration!=='00:00:48.00'||!video?.includes('1920x1080')||!video.includes('30 fps')||!audio?.includes('stereo'))throw Error('Showreel master format mismatch');
const job=JSON.parse(await readFile('creative/reference-reel/progress.json','utf8'));if(job.frames!==1440||job.phase!=='complete')throw Error('Frame export incomplete');
const decode=spawnSync(ffmpeg,['-hide_banner','-i','public/media/videos/promo.mp4','-vn','-af','volumedetect','-f','null','-'],{encoding:'utf8',windowsHide:true}).stderr;
if(decode.includes('mean_volume: -inf'))throw Error('Audio track is silent');
for (const file of ['public/media/playback/promo.mp4','public/media/playback/promo-native.mp4']) {
 const probe=spawnSync(ffmpeg,['-hide_banner','-i',file],{encoding:'utf8',windowsHide:true}).stderr;
 if(!probe.includes('Duration: 00:00:48.00') || !probe.includes('stereo'))throw Error('Playback duration/audio mismatch: '+file);
}
console.log(JSON.stringify({duration,video:video.trim(),audio:audio.trim(),frames:job.frames,volume:decode.split('\n').filter(l=>/mean_volume|max_volume/.test(l)).map(l=>l.trim())},null,2));
