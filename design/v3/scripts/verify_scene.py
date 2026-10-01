import bpy,json,sys,re,hashlib
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent;V3=HERE.parent;ROOT=V3.parents[1]
source=Path(sys.argv[sys.argv.index('--')+1])if'--'in sys.argv else V3/'muscat-park-v3.blend'
bpy.ops.wm.open_mainfile(filepath=str(source));M=json.loads((V3/'scene-manifest.json').read_text(encoding='utf8'));images=[];external=[];bad=[]
for im in bpy.data.images:
 if im.type!='IMAGE':continue
 pixel=list(im.pixels[:4])
 images.append({'name':im.name,'packed':bool(im.packed_file),'relative_path':im.filepath,'dimensions':list(im.size),'decoded_pixel':len(pixel)==4})
 if not im.packed_file:external.append(im.name)
 if re.search(r'[A-Za-z]:[\\/]',im.filepath):bad.append('image:'+im.name)
for block in list(bpy.data.objects)+list(bpy.data.materials)+list(bpy.data.scenes):
 for k in block.keys():
  if isinstance(block[k],str)and re.search(r'[A-Za-z]:[\\/]',block[k]):bad.append(block.name+'.'+k)
for lib in bpy.data.libraries:external.append('linked_library:'+lib.name)
wheel=bpy.data.objects['V3 observation wheel90m'];zs=[(wheel.matrix_world@v.co).z for v in wheel.data.vertices]
def geom_hash(ob):return hashlib.sha256(json.dumps({'vertices':[list(v.co)for v in ob.data.vertices],'polygons':[list(p.vertices)for p in ob.data.polygons]},separators=(',',':')).encode()).hexdigest()
locks={name:geom_hash(bpy.data.objects[name])==h for name,h in M['parking_geometry_hashes'].items()}
report={'file':'design/v3/muscat-park-v3.blend','read_from_different_directory':source.parent.resolve()!=V3.resolve(),'native_blender_version':bpy.app.version_string,'units':{'system':bpy.context.scene.unit_settings.system,'scale_length':bpy.context.scene.unit_settings.scale_length},'wheel_total_height_m':max(zs)-min(zs),'images':images,'external_dependencies':external,'absolute_host_paths':bad,'locked_parcel_zones_and_parking':locks,'camera_count':len(bpy.data.cameras),'v3_camera_names':[c.name for c in bpy.data.cameras if c.name.startswith('V3')],'source_scene_unchanged':hashlib.sha256((ROOT/'design/muscat-park.blend').read_bytes()).hexdigest()==M['source_scene_sha256'],'pass':not external and not bad and all(locks.values())and abs(max(zs)-min(zs)-90)<.001 and all(im['decoded_pixel']for im in images)}
# Actual platform/canopy polygons for model-derived schematic, not approximate circular icons.
G=json.loads((V3/'plan-geometry.json').read_text(encoding='utf8'))
for ob in bpy.data.objects:
 if ob.type=='MESH'and ('visitor platform' in ob.name or ob.name=='V3 family carousels'):
  G[ob.name]={'vertices_xy_m':[[float((ob.matrix_world@v.co).x),float((ob.matrix_world@v.co).y)]for v in ob.data.vertices],'faces':[{'v':list(p.vertices),'mat':ob.data.materials[p.material_index].name}for p in ob.data.polygons if p.normal.z>.85 and len(p.vertices)>=8]}
(V3/'plan-geometry.json').write_text(json.dumps(G,separators=(',',':')))
# All new geometry is handed to a planar containment audit, separate from this native read-back.
F={}
for ob in bpy.data.objects:
 if ob.type=='MESH'and ob.name.startswith('V3')and not ob.name.startswith('V3 MIST'):
  F[ob.name]=[[float((ob.matrix_world@v.co).x),float((ob.matrix_world@v.co).y)]for v in ob.data.vertices]
(V3/'all-v3-footprints.json').write_text(json.dumps(F,separators=(',',':')))
(V3/'portable-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(report,ensure_ascii=True))