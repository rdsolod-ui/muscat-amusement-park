import {readFile,stat,readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root=path.join(project,'out');
const fail=message=>{throw new Error(message);};
const exists=async name=>{if(!(await stat(path.join(root,name))).isFile())fail('Missing runtime asset: '+name);};
const required=[
 'models/muscat-park-v5.glb','models/boomerang-v5.glb','models/muscat-wheel-v4.glb',
 'media/v5/google-site.svg','media/v5/model-aerial.webp','media/v5/vision-aerial.webp',
 'media/v5/boomerang-render.webp','media/v5/boomerang-video-poster.webp','media/v5/boomerang-video.webm',
 'media/v5/model-dome.webp','media/v5/model-entrance.webp','media/v5/dome.webp','media/v5/city.webp',
 'media/v5/promenade.webp','media/v5/wheel-final.webp','media/v5/zone-city.webp','media/v5/zone-parking.webp',
 'media/v5/salalah-day.webp','media/v5/salalah-sunset.webp','media/v5/salalah-night.webp',
 'media/v4/wheel-mountains.webp','media/v4/wheel-poster.webp','media/v4/zone-rides.webp',
 'media/v4/zone-water.webp','media/v4/zone-utility.webp','fonts/IBMPlexSansArabic-Regular.woff2',
 'media/masterplan-v3.svg','data/design-references.json','references/index.html'
];
await Promise.all(required.map(exists));

async function inspectGLB(name,expectedClips){
 const buffer=await readFile(path.join(root,name));
 if(buffer.length<28||buffer.toString('ascii',0,4)!=='glTF'||buffer.readUInt32LE(4)!==2||buffer.readUInt32LE(8)!==buffer.length)fail('Invalid GLB header: '+name);
 const length=buffer.readUInt32LE(12);
 if(buffer.readUInt32LE(16)!==0x4e4f534a||20+length>buffer.length)fail('Invalid GLB JSON chunk: '+name);
 const json=JSON.parse(buffer.toString('utf8',20,20+length));
 for(const item of [...(json.buffers||[]),...(json.images||[])])if(item.uri&&!item.uri.startsWith('data:'))fail('External GLB dependency: '+name);
 if(/[A-Za-z]:[\\/]/.test(JSON.stringify(json)))fail('Absolute host path in GLB: '+name);
 const clips=(json.animations||[]).map(a=>a.name);
 if(clips.length!==expectedClips.length||expectedClips.some(c=>!clips.includes(c)))fail('Unexpected animation clips in '+name+': '+clips.join(', '));
 const usedImages=new Set((json.textures||[]).map(t=>t.source??t.extensions?.EXT_texture_webp?.source));
 if([...usedImages].some(i=>!Number.isInteger(i)||!json.images?.[i]))fail('Invalid embedded texture reference: '+name);
 for(const a of json.animations||[]){if(!a.channels?.length||!a.samplers?.length)fail('Empty animation: '+name);}
 if(name.endsWith('muscat-park-v5.glb')){
  const wind=json.animations.find(a=>a.name==='Flags_Wind');
  if(wind.channels.length!==7||wind.channels.some(c=>c.target.path!=='weights'))fail('Expected seven wind morph channels');
  for(const c of wind.channels){const mesh=json.meshes[json.nodes[c.target.node].mesh];if(!mesh?.primitives?.every(p=>p.targets?.length===2))fail('Missing flag morph targets');}
 }
 if(name.endsWith('boomerang-v5.glb')){
  if((json.materials?.length||0)<38||usedImages.size<3)fail('Boomerang source materials/textures missing');
  if(!json.nodes?.some(n=>/WFC.?20A/i.test(n.name||'')))fail('Actual WFC-20A source node marker missing');
 }
 return{file:name,bytes:buffer.length,embedded:true,materials:json.materials?.length||0,images:usedImages.size,clips};
}
const models=await Promise.all([
 inspectGLB('models/muscat-park-v5.glb',['Park_Construction','Wheel_Rotation','Flags_Wind']),
 inspectGLB('models/boomerang-v5.glb',[]),
 inspectGLB('models/muscat-wheel-v4.glb',['Wheel_Construction','Wheel_Rotation'])
]);

// All new presentation photographs are WebP. Old source-evidence JPEGs and the
// globe's technical mask are outside this revision's runtime-photo contract.
const visuals=[];
for(const entry of await readdir(path.join(root,'media/v5'),{withFileTypes:true})){
 if(!entry.isFile())fail('Unexpected v5 media directory or symlink: '+entry.name);
 if(/\.(png|jpe?g|gif|avif|mp4|mov)$/i.test(entry.name))fail('Use WebP photos / WebM video for v5 runtime media: '+entry.name);
 if(entry.name.endsWith('.webp')){
  const buffer=await readFile(path.join(root,'media/v5',entry.name));
  if(buffer.length<16||buffer.toString('ascii',0,4)!=='RIFF'||buffer.toString('ascii',8,12)!=='WEBP'||buffer.readUInt32LE(4)+8!==buffer.length)fail('Invalid WebP image: '+entry.name);
  visuals.push({file:'media/v5/'+entry.name,bytes:buffer.length});
 }
}
// All three supplied-photo lighting interpretations are mandatory v5 runtime assets.
const video=await readFile(path.join(root,'media/v5/boomerang-video.webm'));
if(video.length<1_000_000||video.length>25_000_000||video.readUInt32BE(0)!==0x1a45dfa3||!video.subarray(0,512).includes(Buffer.from('webm')))fail('Invalid or unexpected WebM video size/header');

const html=await readFile(path.join(root,'index.html'),'utf8');
if(!html.includes('/muscat-amusement-park/'))fail('Expected static base path');
if(!html.includes('Muscat Amusement Park (MAP)')||!html.includes('data-version="5.0.0"'))fail('Missing MAP v5 brand/version marker');
if(!html.includes('بناء المجسم')||!html.includes('مسقط')||/Ш§|Щ„|вЂ|\uFFFD/.test(html))fail('Arabic encoding regression');
const expected=['family','place','site','rides','boomerang','city-walk','character','water','indoor','comfort','city','land-request'];
const chapters=[...html.matchAll(/<h([12])\b[^>]*\bid="title-([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g)].map(m=>({id:m[2],heading:m[3].replace(/<[^>]*>/g,'').trim()}));
if(chapters.length!==12||chapters.some((c,i)=>c.id!==expected[i]||!/[\u0600-\u06FF]/.test(c.heading)))fail('Expected twelve ordered Arabic chapter headings including Boomerang');
if(!html.includes('data-chapters="12"'))fail('Chapter count marker is stale');
const final=html.match(/<section\b[^>]*\bid="land-request"[^>]*>([\s\S]*?)<\/section>/)?.[1]||'';
if(!final.includes('ASAAS')||!final.includes('أساس')||!final.includes('2040'))fail('Final chapter is missing the ASAAS / Vision 2040 proposal');
if(!html.includes('بوميرانغ')||!html.includes('Boomerang'))fail('Boomerang Arabic/English labels missing');

let files=0,bytes=0;
async function inspect(folder){for(const entry of await readdir(folder,{withFileTypes:true})){if(entry.isSymbolicLink())fail('Unexpected export symlink');const full=path.join(folder,entry.name);if(entry.isDirectory())await inspect(full);else{if(/\.(srt|blend|py|ps1|pem|key|map)$/i.test(entry.name)||entry.name==='site-content.json'||entry.name.startsWith('.env'))fail('Private/source file in static export');files++;bytes+=(await stat(full)).size;}}}
await inspect(root);
console.log(JSON.stringify({status:'passed',revision:'v5',basePath:'/muscat-amusement-park/',files,bytes,models,visuals,video:{file:'media/v5/boomerang-video.webm',bytes:video.length,ebml:true},chapters},null,2));
