import bpy,sys,json,hashlib,array,shutil,datetime
from pathlib import Path
V5=Path(__file__).resolve().parents[1];ROOT=V5.parents[1];WORK=Path(sys.argv[sys.argv.index('--')+1]);p=V5/'muscat-park-v5.blend'
backup=WORK/('metadata-backup-'+datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ'));backup.mkdir(parents=True,exist_ok=False);shutil.copy2(p,backup/p.name)
def fingerprint():
 h=hashlib.sha256()
 for me in sorted(bpy.data.meshes,key=lambda x:x.name):
  h.update(me.name.encode());v=array.array('f',[0.0])*(len(me.vertices)*3);me.vertices.foreach_get('co',v);h.update(v.tobytes());idx=array.array('i',[0])*len(me.loops);me.loops.foreach_get('vertex_index',idx);h.update(idx.tobytes());h.update(json.dumps([m.name if m else None for m in me.materials]).encode())
  for uv in me.uv_layers:
   values=array.array('f',[0.0])*(len(uv.data)*2);uv.data.foreach_get('uv',values);h.update(values.tobytes())
 for ob in sorted(bpy.data.objects,key=lambda x:x.name):h.update(json.dumps([ob.name,[list(r)for r in ob.matrix_world],ob.parent.name if ob.parent else None]).encode())
 return h.hexdigest()
def packed():return {i.name:hashlib.sha256(bytes(i.packed_file.data)).hexdigest()for i in bpy.data.images if i.type=='IMAGE'and i.packed_file}
bpy.ops.wm.open_mainfile(filepath=str(p));before=fingerprint();images=packed();fixed=[]
for im in bpy.data.images:
 for data in im.packed_files:
  if ':'in data.filepath:
   data.filepath='//textures/'+im.name;fixed.append(im.name)
bpy.context.preferences.filepaths.save_version=0;bpy.ops.wm.save_as_mainfile(filepath=str(p),compress=True);bpy.ops.wm.open_mainfile(filepath=str(p))
report={'metadata_fields_changed':fixed,'mesh_uv_material_assignment_transform_fingerprint_unchanged':before==fingerprint(),'packed_image_bytes_unchanged':images==packed(),'absolute_packed_paths_remaining':[im.name for im in bpy.data.images for d in im.packed_files if ':'in d.filepath],'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
report['pass']=report['mesh_uv_material_assignment_transform_fingerprint_unchanged']and report['packed_image_bytes_unchanged']and not report['absolute_packed_paths_remaining'];(V5/'metadata-portability-validation.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
