import {spawn} from 'node:child_process';import {readFile,mkdir,writeFile} from 'node:fs/promises';import path from 'node:path';
await mkdir('docs/audit',{recursive:true});
for(const [width,height] of [[1440,1000],[820,1180],[390,844],[320,740]]){
 const reportPath='docs/audit/viewport-'+width+'.json';await writeFile(reportPath,'null');
 const child=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--no-first-run','--no-default-browser-check','--use-angle=d3d11','--enable-gpu','--force-prefers-reduced-motion',`--window-size=${width},${height}`,'--user-data-dir='+path.resolve('tmp/audit-live-profile-'+process.pid+'-'+width),`http://127.0.0.1:5183/__audit__?width=${width}&height=${height}`],{windowsHide:true,stdio:'ignore'});
 try{let report;for(let i=0;i<60;i++){await new Promise(r=>setTimeout(r,1000));try{report=JSON.parse(await readFile(reportPath,'utf8'));}catch{}if(report)break;if(child.exitCode!==null)throw Error('Browser closed before audit completed');}if(!report)throw Error('Viewport report timed out');console.log(JSON.stringify(report));if(!report.passed)process.exitCode=1;}finally{child.kill();}
}
