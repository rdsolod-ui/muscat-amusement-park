import bpy,sys,json
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent;V4=HERE.parent;ROOT=V4.parents[1];WORK=Path(sys.argv[sys.argv.index('--')+1]);bpy.ops.wm.open_mainfile(filepath=str(V4/'muscat-park-v4.blend'));s=bpy.context.scene;s.frame_set(361)
l=json.loads((V4/'layout-reference.json').read_text());C=[Vector(v)for v in l['image_corners_m']]
def xy(x,y):u=x/1280;v=y/922;return C[0]*(1-u)*(1-v)+C[1]*u*(1-v)+C[2]*u*v+C[3]*(1-u)*v
o=bpy.data.objects['WFC-20A actual source Boomerang'];vv=[o.matrix_world@v.co for v in o.data.vertices];center=Vector(((min(v.x for v in vv)+max(v.x for v in vv))/2,(min(v.y for v in vv)+max(v.y for v in vv))/2));q=xy(422,427)-center;o.location+=Vector((q.x,q.y,0));bpy.context.view_layer.update();bpy.ops.wm.save_as_mainfile(filepath=str(V4/'muscat-park-v4.blend'),compress=True)
bpy.ops.object.select_all(action='DESELECT')
for ob in bpy.data.objects:
 if ob.type in ['MESH','EMPTY']and not ob.name.startswith('V3 MIST'):ob.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(WORK/'park-v4-static.glb'),export_format='GLB',use_selection=True,export_yup=True,export_animations=False,export_extras=False,export_cameras=False,export_lights=False,export_apply=True)
s.camera=bpy.data.objects['V4 aerial'];s.render.resolution_x=1920;s.render.resolution_y=1200;s.render.filepath=str(ROOT/'design/visuals/v4/model-aerial.png');bpy.ops.render.render(write_still=True)
cam=bpy.data.objects['V4 rides'];cam.location+=Vector((q.x,q.y,0));s.camera=cam;s.render.resolution_x=1600;s.render.resolution_y=1000;s.render.filepath=str(ROOT/'design/visuals/v4/model-rides.png');bpy.ops.render.render(write_still=True)
p=V4/'scene-manifest.json';m=json.loads(p.read_text());m['coaster_source_px']=[422,427];m['coaster_route_clearance']='moved into north-central ride cell; no overlap with declared pedestrian route centerlines; operating clearances not certified';p.write_text(json.dumps(m,indent=2))
print('COASTER_CORRECTED')
