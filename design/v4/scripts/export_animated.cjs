const fs=require('fs'),path=require('path'),crypto=require('crypto');
const [work,tooling]=process.argv.slice(2),ROOT=path.resolve(__dirname,'../../..'),V4=path.resolve(__dirname,'..');
const {NodeIO}=require(path.join(tooling,'@gltf-transform/core'));
const {ALL_EXTENSIONS}=require(path.join(tooling,'@gltf-transform/extensions'));
const {dedup,prune,weld,meshopt}=require(path.join(tooling,'@gltf-transform/functions'));
const {MeshoptEncoder,MeshoptDecoder}=require(path.join(tooling,'meshoptimizer'));
const validator=require(path.join(tooling,'gltf-validator'));
(async()=>{
 await MeshoptEncoder.ready;await MeshoptDecoder.ready;
 const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
 const manifest=JSON.parse(fs.readFileSync(path.join(V4,'scene-manifest.json'),'utf8'));
 const reports=[];
 for(const kind of ['park','wheel']){
  const doc=await io.read(path.join(work,kind+'-v4-static.glb')),root=doc.getRoot(),buffer=root.listBuffers()[0];
  const nodes=Object.fromEntries(root.listNodes().map(n=>[n.getName(),n]));
  function accessor(name,type,values){return doc.createAccessor(name).setType(type).setArray(new Float32Array(values)).setBuffer(buffer)}
  const build=doc.createAnimation(kind==='park'?'Park_Construction':'Wheel_Construction');
  for(const [name,span] of Object.entries(manifest.park_stages)){
   const node=nodes[name];if(!node)continue;node.setScale([1,1,1]);
   const [a,b]=span,times=[...new Set([0,a,b,15])],vals=[];
   for(const t of times){const s=t<=a?.001:1;vals.push(...(name.startsWith('wheel-')?[s,s,s]:[1,s,1]));}
   const sampler=doc.createAnimationSampler().setInput(accessor(name+' times','SCALAR',times)).setOutput(accessor(name+' scale','VEC3',vals)).setInterpolation('LINEAR');
   build.addSampler(sampler).addChannel(doc.createAnimationChannel().setTargetNode(node).setTargetPath('scale').setSampler(sampler));
  }
  const spin=doc.createAnimation('Wheel_Rotation');
  for(const name of ['wheel-rotor',...Array.from({length:36},(_,i)=>'wheel-cabin-'+String(i).padStart(2,'0'))]){
   const node=nodes[name];if(!node)throw Error('Missing rotor or cabin '+name);
   const times=[],values=[],sign=name==='wheel-rotor'?-1:1;
   for(let i=0;i<=120;i++){const t=i/120;times.push(t*60);values.push(0,0,sign*Math.sin(t*Math.PI),Math.cos(t*Math.PI));}
   const sampler=doc.createAnimationSampler().setInput(accessor(name+' spin times','SCALAR',times)).setOutput(accessor(name+' rotation','VEC4',values)).setInterpolation('LINEAR');
   spin.addSampler(sampler).addChannel(doc.createAnimationChannel().setTargetNode(node).setTargetPath('rotation').setSampler(sampler));
  }
  await doc.transform(dedup(),weld(),prune(),meshopt({encoder:MeshoptEncoder,level:'high'}),dedup(),prune());
  const output=path.join(ROOT,'public/models','muscat-'+kind+'-v4.glb');await io.write(output,doc);
  const data=fs.readFileSync(output);const compressed=await validator.validateBytes(data,{maxIssues:50});
  const reread=await io.read(output);for(const e of reread.getRoot().listExtensionsUsed())if(e.extensionName==='EXT_meshopt_compression')e.dispose();
  const decoded=await validator.validateBytes(await io.writeBinary(reread),{maxIssues:50});
  const result={file:path.basename(output),bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex'),meshCount:root.listMeshes().length,nodeCount:root.listNodes().length,animationClips:root.listAnimations().map(a=>({name:a.getName(),channels:a.listChannels().length})),meshoptRequired:true,compressed:compressed.issues,decoded:decoded.issues};
  reports.push(result);console.log(JSON.stringify(result));
 }
 fs.writeFileSync(path.join(V4,'web-export-validation.json'),JSON.stringify(reports,null,2));
})();
