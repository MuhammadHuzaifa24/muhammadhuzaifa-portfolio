import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const source=await readFile('E:/huzaifa uni/Gaming/Documents/Muhammad_Huzaifa_Resume.pdf');
const response=await fetch('http://127.0.0.1:3001/media/files/Muhammad_Huzaifa_Resume.pdf?v=5b59df0a04db');
const served=Buffer.from(await response.arrayBuffer());
const hash=b=>createHash('sha256').update(b).digest('hex');
if(!response.ok||hash(source)!==hash(served))throw Error('Resume download differs from supplied PDF');
console.log('Resume endpoint: 200, PDF verified, exact supplied file, SHA256 '+hash(served));
