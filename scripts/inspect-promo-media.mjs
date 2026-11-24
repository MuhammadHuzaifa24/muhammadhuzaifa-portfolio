import ffmpeg from 'ffmpeg-static';
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
mkdirSync('creative/promo/qa', { recursive: true });
for (const [name, interval] of [['WADA', 12], ['signal-shutdown', 4], ['fyp', 12]]) {
  const result = spawnSync(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'error', '-i', `public/media/videos/${name}.mp4`, '-vf', `fps=1/${interval},scale=320:-1,tile=3x2`, '-frames:v', '1', `creative/promo/qa/${name}-contact.png`], { windowsHide: true, encoding: 'utf8' });
  if (result.status) throw new Error(result.stderr);
  console.log(`Inspected ${name}`);
}
