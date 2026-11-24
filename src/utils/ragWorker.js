import { pipeline, env } from '@huggingface/transformers';
import { localGenerationMessages, verifiedModelAnswer } from './groundedLocalAI.js';
env.allowLocalModels=false;env.backends.onnx.wasm.numThreads=1;
let embedding, generator, memory, queue=Promise.resolve();
async function cacheRead(key){try{return await new Promise(resolve=>{const r=indexedDB.open('huzaifa-rag-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('vectors');r.onerror=()=>resolve(null);r.onsuccess=()=>{const db=r.result,t=db.transaction('vectors').objectStore('vectors').get(key);t.onsuccess=()=>{resolve(t.result||null);db.close();};t.onerror=()=>{resolve(null);db.close();};};});}catch{return null;}}
async function cacheWrite(key,value){try{await new Promise(resolve=>{const r=indexedDB.open('huzaifa-rag-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('vectors');r.onerror=()=>resolve();r.onsuccess=()=>{const db=r.result,tx=db.transaction('vectors','readwrite');tx.objectStore('vectors').put(value,key);tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>{db.close();resolve();};};});}catch{/* Private browsing can disable persistent storage. */}}
async function run({id,question,language,documents,chunks,fingerprint}){
 const report=status=>self.postMessage({id,status});
 try{
  report('Loading multilingual embeddings. First use downloads model files; later visits reuse the browser cache.');
  embedding ||= pipeline('feature-extraction','Xenova/paraphrase-multilingual-MiniLM-L12-v2',{dtype:'q8'}).catch(e=>{embedding=null;throw e;});
  const model=await embedding;
  // Include the CV/skills chunks as well as the curated bilingual portfolio.
  const corpus=[...documents,...chunks.map(c=>({id:'cv-'+c.id,title:c.title,href:c.href,en:c.text,ur:documents.find(d=>d.href===c.href)?.ur||c.text}))];
  const key=fingerprint+'-multilingual-minilm-v1';
  if(memory?.key!==key){let vectors=await cacheRead(key);if(!vectors||vectors.length!==corpus.length){vectors=[];for(const doc of corpus)vectors.push(Array.from((await model(`${doc.title} ${doc.en}`,{pooling:'mean',normalize:true})).data));await cacheWrite(key,vectors);}memory={key,vectors};}
  const query=(await model(question,{pooling:'mean',normalize:true})).data;
  const ranked=memory.vectors.map((v,i)=>({i,score:v.reduce((sum,n,k)=>sum+n*query[k],0)})).sort((a,b)=>b.score-a.score);
  if(!ranked[0]||ranked[0].score<.55){self.postMessage({id,result:null});return;}
  const selected=ranked.slice(0,3).map(r=>corpus[r.i]);
  const lang=language==='ur'||(language==='auto'&&/[\u0600-\u06ff]/.test(question))?'ur':'en';
  report('Loading the free local language model (several hundred MB on first use). Source answers remain available.');
  generator ||= pipeline('text-generation','onnx-community/Qwen2.5-0.5B-Instruct',{dtype:'q4',device:'wasm'}).catch(e=>{generator=null;throw e;});
  const llm=await generator;report('Generating an answer from the retrieved evidence…');
  const output=await llm(localGenerationMessages(question,selected,lang),{max_new_tokens:220,do_sample:false,return_full_text:false});
  const generated=output[0]?.generated_text;const text=typeof generated==='string'?generated:generated?.at(-1)?.content||'';
  const answer=verifiedModelAnswer(text,selected,lang);
  self.postMessage({id,result:answer||{answer:lang==='ur'?selected[0].ur:selected[0].en,language:lang,mode:'semantic',grounded:true,sources:[{id:selected[0].id,title:selected[0].title,href:selected[0].href,quote:selected[0].en}]}});
 }catch{self.postMessage({id,result:null});}
}
self.onmessage=({data})=>{queue=queue.then(()=>run(data)).catch(()=>self.postMessage({id:data.id,result:null}));};
