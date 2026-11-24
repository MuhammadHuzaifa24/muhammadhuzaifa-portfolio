import {cp,mkdir,readFile,writeFile,copyFile,readdir,stat} from 'node:fs/promises';import path from 'node:path';
const root=process.cwd(),dest=path.resolve(process.argv[2]||'deployment/muhammadhuzaifa/.sites-checkout');await mkdir(dest,{recursive:true});
for(const name of ['src','shared','server','scripts','public','dist'])await cp(name,path.join(dest,name),{recursive:true,force:true,filter:source=>{const relative=path.relative(root,source).replaceAll('\\','/');if(relative==='server/data'||relative.startsWith('scripts/qa')||relative.endsWith('.env'))return false;return !['public/media/videos/Furious7.mp4','public/media/videos/WADA.mp4','public/media/videos/Ambugo.mp4','dist/media/videos/Furious7.mp4','dist/media/videos/WADA.mp4','dist/media/videos/Ambugo.mp4'].includes(relative);}});
for(const name of ['package.json','package-lock.json','index.html','vite.config.js','tailwind.config.js','postcss.config.js','.gitignore','.env.example'])await copyFile(name,path.join(dest,name));
await mkdir(path.join(dest,'.openai'),{recursive:true});await copyFile('.openai/hosting.json',path.join(dest,'.openai/hosting.json'));
// Keep source originals intact locally. Public hosting serves the lighter,
// browser-compatible copy at the same URL for recordings above the asset limit.
for(const base of ['public','dist'])for(const name of ['Furious7','WADA','Ambugo'])await copyFile(`${base}/media/playback/${name}.mp4`,path.join(dest,base,'media/videos',`${name}.mp4`));
const large=[];async function scan(dir){for(const ent of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,ent.name);if(ent.isDirectory())await scan(p);else if((await stat(p)).size>25*1024*1024)large.push(path.relative(dest,p));}}await scan(path.join(dest,'dist'));if(large.length)throw Error('Oversized hosting assets: '+large.join(', '));
console.log('Prepared sanitized deployment checkout; all static assets are below 25 MiB.');
