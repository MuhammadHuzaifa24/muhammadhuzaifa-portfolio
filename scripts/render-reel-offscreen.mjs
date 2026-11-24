import {spawn} from 'node:child_process';
import {access,mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
const mode=process.argv[2]||'qa';if(!['qa','export'].includes(mode))throw Error('Choose qa or export');
const work=path.resolve('creative/reference-reel');await mkdir(work,{recursive:true});
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';await access(chrome);
const stateFile=path.join(work,mode==='qa'?'qa-status.json':'progress.json');
await writeFile(stateFile,JSON.stringify({phase:'starting',frames:0}));
const gpu=process.env.REEL_SOFTWARE==='1'?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--enable-gpu'];
const child=spawn(chrome,['--headless=new','--no-first-run','--no-default-browser-check',...gpu,'--disable-background-timer-throttling','--disable-renderer-backgrounding','--user-data-dir='+path.join(work,'offscreen-profile',String(process.pid)),`http://127.0.0.1:5182/?renderJob=${mode}${process.argv.includes('--quick')?'&quick=1':''}`],{windowsHide:true,stdio:['ignore','ignore','pipe']});
let log='';child.stderr.on('data',d=>{log+=d.toString();void writeFile(path.join(work,'offscreen-log.txt'),log);});child.on('error',e=>{log+=e.stack;});
try{
 const started=Date.now();let last='';
 while(Date.now()-started<15*60*1000){
  await new Promise(r=>setTimeout(r,2000));
  const state=JSON.parse(await readFile(stateFile,'utf8'));
  const message=JSON.stringify(state);if(message!==last){console.log(message);last=message;}
  if(state.phase==='complete'){console.log('Offscreen '+mode+' completed.');break;}
  if(state.phase==='error')throw Error(state.error||'Render failed');
  if(child.exitCode!==null)throw Error('Render process exited early: '+child.exitCode);
  if(Date.now()-started>14.9*60*1000)throw Error('Render timeout');
 }
}finally{child.kill();await writeFile(path.join(work,'offscreen-log.txt'),log);}
