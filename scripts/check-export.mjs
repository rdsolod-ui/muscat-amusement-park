import {readFile,stat,readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../out');
const html=await readFile(path.join(root,'index.html'),'utf8');
if(!html.includes('/muscat-amusement-park/'))throw new Error('Expected static base path');
for(const name of ['models/muscat-park.glb','fonts/IBMPlexSansArabic-Regular.woff2'])if(!(await stat(path.join(root,name))).isFile())throw new Error('Missing runtime asset: '+name);
const glb=await readFile(path.join(root,'models/muscat-park.glb'));
if(glb.toString('ascii',0,4)!=='glTF'||glb.readUInt32LE(4)!==2||glb.readUInt32LE(8)!==glb.length)throw new Error('Invalid GLB header');
const scene=JSON.parse(glb.toString('utf8',20,20+glb.readUInt32LE(12)));
for(const x of [...(scene.buffers||[]),...(scene.images||[])])if(x.uri&&!x.uri.startsWith('data:'))throw new Error('External GLB dependency');
let files=0,bytes=0;
async function inspect(folder){for(const entry of await readdir(folder,{withFileTypes:true})){if(entry.isSymbolicLink())throw new Error('Unexpected export symlink');const full=path.join(folder,entry.name);if(entry.isDirectory())await inspect(full);else {if(/\.(srt|blend|py|ps1|pem|key|map)$/i.test(entry.name)||entry.name==='site-content.json'||entry.name.startsWith('.env'))throw new Error('Private/source file in static export');files++;bytes+=(await stat(full)).size;}}}
await inspect(root);
console.log(JSON.stringify({status:'passed',basePath:'/muscat-amusement-park/',files,bytes,glb:'self-contained v2'},null,2));
