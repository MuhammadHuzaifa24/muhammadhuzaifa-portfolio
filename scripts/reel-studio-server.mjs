import express from 'express';
import ffmpeg from 'ffmpeg-static';
import {spawn} from 'node:child_process';
import {mkdir,writeFile,access} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd(),work=path.join(root,'creative/reference-reel');await mkdir(work,{recursive:true});
const app=express();let job=null;
app.post('/qa-frame',express.raw({type:'image/jpeg',limit:'8mb'}),async(req,res)=>{
 const index=Number(req.query.index);if(!Number.isInteger(index)||index<0||index>40||!Buffer.isBuffer(req.body))return res.status(400).end();
 await mkdir(path.join(work,'qa','revision-3'),{recursive:true});await writeFile(path.join(work,'qa','revision-3',`frame-${String(index).padStart(2,'0')}.jpg`),req.body);res.json({ok:true});
});
app.post('/qa-complete',express.json(),async(req,res)=>{await writeFile(path.join(work,'qa-status.json'),JSON.stringify(req.body));res.json({ok:true});});
app.use('/vendor',express.static(path.join(root,'node_modules/three/build')));
app.use('/addons',express.static(path.join(root,'node_modules/three/examples/jsm')));
app.use('/media',express.static(path.join(root,'public/media')));
app.use('/models',express.static(path.join(root,'public/models')));
app.use(express.static(work));
const save=()=>writeFile(path.join(work,'progress.json'),JSON.stringify({frames:job?.frames||0,total:1440,phase:job?.phase||'idle',error:job?.error||null}));
app.post('/begin',async(_req,res)=>{
 if(job?.phase==='rendering')return res.status(409).json({error:'A render is already running.'});
 try{await access(path.join(work,'mix.wav'));}catch{return res.status(409).json({error:'Prepare audio first.'});}
 const args=['-y','-nostdin','-hide_banner','-loglevel','error','-f','image2pipe','-vcodec','mjpeg','-framerate','30','-i','pipe:0','-i',path.join(work,'mix.wav'),'-map','0:v','-map','1:a','-c:v','libx264','-threads','4','-preset','fast','-crf','18','-pix_fmt','yuv420p','-profile:v','high','-level:v','4.1','-c:a','aac','-b:a','192k','-ar','48000','-ac','2','-t','48','-movflags','+faststart','-metadata','title=Muhammad Huzaifa | Creative Worlds',path.join(work,'final-master.mp4')];
 const child=spawn(ffmpeg,args,{windowsHide:true});job={child,frames:0,phase:'rendering',error:'',exit:null};
 child.stderr.on('data',d=>job.error+=d.toString());job.done=new Promise(resolve=>child.on('close',c=>{job.exit=c;resolve();}));child.on('error',e=>{job.error=e.message;job.phase='error';});
 await save();res.json({ok:true});
});
app.post('/frame',express.raw({type:'image/jpeg',limit:'8mb'}),async(req,res)=>{
 if(!job||job.phase!=='rendering'||job.exit!==null)return res.status(409).json({error:job?.error||'No active render.'});
 if(Number(req.query.index)!==job.frames||!Buffer.isBuffer(req.body))return res.status(400).end();
 try {await new Promise((resolve,reject)=>job.child.stdin.write(req.body,e=>e?reject(e):resolve()));job.frames++;if(job.frames%30===0)await save();res.json({frames:job.frames});}catch(e){job.error=e.message;job.phase='error';await save();res.status(500).json({error:e.message});}
});
app.post('/finish',async(_req,res)=>{if(!job||job.frames!==1440)return res.status(400).json({error:'Incomplete frame sequence.'});job.phase='encoding';await save();job.child.stdin.end();await job.done;job.phase=job.exit===0?'complete':'error';await save();res.status(job.exit===0?200:500).json({phase:job.phase,error:job.error});});
app.get('/status',(_req,res)=>res.json({frames:job?.frames||0,phase:job?.phase||'idle',error:job?.error||null}));
const server=app.listen(5182,'127.0.0.1',()=>console.log('Reel studio: http://127.0.0.1:5182/'));
process.on('SIGINT',()=>{if(job?.phase==='rendering')job.child.kill();server.close();});
