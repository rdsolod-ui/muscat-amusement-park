import bpy,sys,json,hashlib,re
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
V5=Path(__file__).resolve().parents[1];ROOT=V5.parents[1]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
v4=ROOT/'design/v4/muscat-park-v4.blend';park=V5/'muscat-park-v5.blend';ridefile=V5/'boomerang.blend'
before={p.name:sha(p) for p in [v4,park,ridefile]}
bpy.ops.wm.open_mainfile(filepath=str(v4));cam=bpy.data.objects['V4 aerial'];v4camera={'matrix':[list(r) for r in cam.matrix_world],'ortho_scale':cam.data.ortho_scale}
bpy.ops.wm.open_mainfile(filepath=str(park));scene=bpy.context.scene;scene.frame_set(361);bpy.context.view_layer.update();cam=bpy.data.objects['V4 aerial']
def images():
 return [{'name':im.name,'packed':bool(im.packed_file),'dimensions':list(im.size),'decodes':len(im.pixels)>0,'relative_path':not bool(re.search('[A-Za-z]:',im.filepath))} for im in bpy.data.images if im.type=='IMAGE']
def gh(ob):return hashlib.sha256(json.dumps({'vertices':[list(v.co) for v in ob.data.vertices],'polygons':[list(p.vertices) for p in ob.data.polygons]},separators=(',',':')).encode()).hexdigest()
locks={n:gh(bpy.data.objects[n])==h for n,h in json.loads((ROOT/'design/v3/scene-manifest.json').read_text())['parking_geometry_hashes'].items()}
wheel=bpy.data.objects['Wheel_90m'];zs=[(ob.matrix_world@v.co).z for ob in wheel.children_recursive if ob.type=='MESH' for v in ob.data.vertices]
flags=[]
for ob in bpy.data.objects:
 if ob.name.startswith('FLAG_') and ob.type=='MESH':
  keys=ob.data.shape_keys;scene.frame_set(1);a=[tuple(v.co) for v in ob.evaluated_get(bpy.context.evaluated_depsgraph_get()).data.vertices];scene.frame_set(33);b=[tuple(v.co) for v in ob.evaluated_get(bpy.context.evaluated_depsgraph_get()).data.vertices]
  flags.append({'name':ob.name,'morph_targets':[k.name for k in keys.key_blocks][1:],'max_wind_displacement_m':max((Vector(x)-Vector(y)).length for x,y in zip(a,b)),'uv_layers':len(ob.data.uv_layers)})
scene.frame_set(361);bpy.context.view_layer.update()
anchors=json.loads((ROOT/'design/v4/model-anchors.json').read_text());pins=[]
for p in anchors['pins']:
 q=world_to_camera_view(scene,cam,Vector((*p['world_m'],4)))
 pins.append({'id':p['id'],'projected_percent':[q.x*100,(1-q.y)*100],'previous_percent':[p['x'],p['y']],'error_percent':max(abs(q.x*100-p['x']),abs((1-q.y)*100-p['y']))})
park_report={'wheel_height_m':max(zs)-min(zs),'camera_unchanged':v4camera=={'matrix':[list(r) for r in cam.matrix_world],'ortho_scale':cam.data.ortho_scale},'locks':locks,'images':images(),'flags':flags,'pins':pins,'external_libraries':len(bpy.data.libraries),'palms_added':json.loads((V5/'park-additions.json').read_text())['perimeter_palms']}
bpy.ops.wm.open_mainfile(filepath=str(ridefile));scene=bpy.context.scene;ob=bpy.data.objects['WFC-20A Boomerang actual source'];vv=[ob.matrix_world@v.co for v in ob.data.vertices];dims=[max(v[i] for v in vv)-min(v[i] for v in vv) for i in range(3)]
ride_report={'dimensions_m':dims,'source_triangles':len(ob.data.polygons),'source_material_slots':len(ob.data.materials),'uv_layers':len(ob.data.uv_layers),'modifiers':[{'type':m.type,'ratio':getattr(m,'ratio',None)} for m in ob.modifiers],'images':images(),'external_libraries':len(bpy.data.libraries)}
after={p.name:sha(p) for p in [v4,park,ridefile]}
report={'blender_version':bpy.app.version_string,'read_only_checks_preserved_files':before==after,'park':park_report,'boomerang':ride_report}
report['pass']=before==after and all(locks.values()) and abs(park_report['wheel_height_m']-90)<.002 and park_report['camera_unchanged'] and all(i['packed'] and i['decodes'] and i['relative_path'] for i in park_report['images']+ride_report['images']) and len(flags)==7 and all(f['max_wind_displacement_m']>.1 for f in flags) and max(p['error_percent'] for p in pins)<.005 and abs(dims[2]-40.9633102417)<.002
(V5/'native-validation.json').write_text(json.dumps(report,indent=2));print(json.dumps(report),flush=True)
