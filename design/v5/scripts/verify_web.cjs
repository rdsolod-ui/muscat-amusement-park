const fs=require('fs'),path=require('path');
const[tooling]=process.argv.slice(2),ROOT=path.resolve(__dirname,'../../..'),V5=path.resolve(__dirname,'..');
const{NodeIO}=require(path.join(tooling,'@gltf-transform/core')),{ALL_EXTENSIONS}=require(path.join(tooling,'@gltf-transform/extensions')),{MeshoptDecoder}=require(path.join(tooling,'meshoptimizer'));
(async()=>{await MeshoptDecoder.ready;const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});const reports=[];
for(const kind of ['boomerang','park']){
 const file=path.join(ROOT,'public/models',kind==='park'?'muscat-park-v5.glb':'boomerang-v5.glb'),doc=await io.read(file),root=doc.getRoot();let lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity],wheel=[Infinity,-Infinity],triangles=0;
 const names=new Set(['wheel-foundation-geometry','wheel-support-geometry','wheel-rim-geometry','wheel-spoke-geometry',...Array.from({length:36},(_,i)=>'wheel-cabin-'+String(i).padStart(2,'0'))]);
 for(const n of root.listNodes()){if(!n.getMesh())continue;let ancestor=n,isWheel=false;while(ancestor){if(names.has(ancestor.getName()))isWheel=true;ancestor=ancestor.getParentNode();}const mx=n.getWorldMatrix();
  for(const p of n.getMesh().listPrimitives()){const a=p.getAttribute('POSITION');triangles+=(p.getIndices()?.getCount()||a.getCount())/3;
   for(let i=0;i<a.getCount();i++){const v=a.getElement(i,[]),w=[mx[0]*v[0]+mx[4]*v[1]+mx[8]*v[2]+mx[12],mx[1]*v[0]+mx[5]*v[1]+mx[9]*v[2]+mx[13],mx[2]*v[0]+mx[6]*v[1]+mx[10]*v[2]+mx[14]];
    for(let j=0;j<3;j++){lo[j]=Math.min(lo[j],w[j]);hi[j]=Math.max(hi[j],w[j]);}if(isWheel){wheel[0]=Math.min(wheel[0],w[1]);wheel[1]=Math.max(wheel[1],w[1]);}
   }
  }
 }
 const clips=root.listAnimations().map(a=>({name:a.getName(),duration_s:Math.max(...a.listSamplers().map(s=>s.getInput().getMax([])[0])),channels:a.listChannels().length}));
 const flags=root.listNodes().filter(n=>n.getName().startsWith('FLAG_')).map(n=>({name:n.getName(),targets:n.getMesh().listPrimitives().map(p=>p.listTargets().length),has_uv:n.getMesh().listPrimitives().every(p=>!!p.getAttribute('TEXCOORD_0'))}));
 const data=fs.readFileSync(file),j=JSON.parse(data.subarray(20,20+data.readUInt32LE(12)).toString('utf8')),uris=(j.images||[]).filter(im=>im.uri&&!im.uri.startsWith('data:')),abs=/[A-Za-z]:[\\/]/.test(JSON.stringify(j));
 const report={file:path.basename(file),world_bounds_m:{min:lo,max:hi},world_dimensions_m:hi.map((v,i)=>v-lo[i]),triangles,materials:root.listMaterials().length,textures:root.listTextures().length,animation_clips:clips,flags,external_image_uris:uris,absolute_host_paths:abs};
 if(kind==='park'){report.wheel_height_m=wheel[1]-wheel[0];report.pass=Math.abs(report.wheel_height_m-90)<.02&&flags.length===7&&flags.every(f=>f.targets.every(t=>t===2))&&clips.length===3&&clips.find(c=>c.name==='Flags_Wind')?.duration_s===4;}
 else report.pass=Math.abs(report.world_dimensions_m[1]-40.9633102417)<.02&&clips.length===0;
 report.pass&&=uris.length===0&&!abs;reports.push(report);
}
fs.writeFileSync(path.join(V5,'web-model-validation.json'),JSON.stringify(reports,null,2));console.log(JSON.stringify(reports,null,2));})();
