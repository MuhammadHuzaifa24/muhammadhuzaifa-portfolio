import express from 'express';import {readFile,writeFile,mkdir} from 'node:fs/promises';
const app=express();app.use(express.json());await mkdir('docs/audit',{recursive:true});
app.get('/__audit__',async(_req,res)=>res.type('html').send(await readFile('scripts/qa/viewport.html','utf8')));
app.get('/__speech-mock.js',(_req,res)=>res.type('js').send(`window.__speechLog=[];window.SpeechRecognition=class { start(){this.onstart?.();setTimeout(()=>{this.onresult?.({results:[[{transcript:'Tell me about R.I.S.E'}]]});this.onend?.();},60);}stop(){this.onend?.();}abort(){this.onend?.();}};Object.defineProperty(window,'speechSynthesis',{value:{speaking:false,cancel(){},speak(u){window.__speechLog.push({text:u.text,lang:u.lang});}}});`));
app.get('/',async(req,res)=>{let html=await readFile('dist/index.html','utf8');if(req.query.__audit)html=html.replace('<head>','<head><script src="/__speech-mock.js"></script>');res.type('html').send(html);});
app.post('/__report',async(req,res)=>{await writeFile(`docs/audit/viewport-${Number(req.body.width)}.json`,JSON.stringify(req.body,null,2));res.json({ok:true});});
app.use(express.static('dist'));const server=app.listen(5183,'127.0.0.1',()=>console.log('Audit server: http://127.0.0.1:5183'));
process.on('SIGINT',()=>server.close());
