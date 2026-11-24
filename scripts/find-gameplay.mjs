import ffmpeg from 'ffmpeg-static';import {spawnSync} from 'node:child_process';
const r=spawnSync(ffmpeg,['-hide_banner','-i','public/media/playback/WADA.mp4','-vf','blackdetect=d=0.15:pix_th=0.05:pic_th=0.98','-an','-f','null','-'],{encoding:'utf8',windowsHide:true});console.log(r.stderr.split('\n').filter(l=>l.includes('black_start')).join('\n'));
