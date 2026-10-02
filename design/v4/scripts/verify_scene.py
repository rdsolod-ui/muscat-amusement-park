import bpy,json,sys,hashlib,re
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent;V4=HERE.parent;ROOT=V4.parents[1];WORK=Path(sys.argv[sys.argv.index('--')+1]);p=V4/'muscat-park-v4.blend';bpy.ops.wm.open_mainfile(filepath=str(p));scene=bpy.context.scene
m=json.loads((V4/'scene-manifest.json').read_text());v3=json.loads((ROOT/'design/v3/scene-manifest.json').read_text())
# Match the web's vertical architectural build reveal while keeping the static footprint stationary.
for name,(a,b)in m['park_stages'].items():
 if not name.startswith('Build_'):continue
 ob=bpy.data.objects[name];ob.animation_data_clear()
 for sec,s in [(0,.001),(a,.001),(b,1),(15,1)]:ob.scale=(1,1,s);ob.keyframe_insert('scale',frame=sec*24+1)
 ob.animation_data.action.name='Construction_'+name
for action in bpy.data.actions:
 for layer in action.layers:
  for strip in layer.strips:
   for cb in strip.channelbags:
    for fc in cb.fcurves:
     for kp in fc.keyframe_points:kp.interpolation='LINEAR'
scene.frame_set(361);bpy.context.view_layer.update()
layout=json.loads((V4/'layout-reference.json').read_text());C=[Vector(v)for v in layout['image_corners_m']];u=422/1280;v=427/922;q=C[0]*(1-u)*(1-v)+C[1]*u*(1-v)+C[2]*u*v+C[3]*(1-u)*v
cam=bpy.data.objects['V4 rides'];cam.location=(q.x+105,q.y-130,100);cam.rotation_euler=(Vector((q.x,q.y,12))-cam.location).to_track_quat('-Z','Y').to_euler()
wheel=bpy.data.objects['Wheel_90m'];zs=[(ob.matrix_world@v.co).z for ob in wheel.children_recursive if ob.type=='MESH'for v in ob.data.vertices];height=max(zs)-min(zs)
assert abs(height-90)<.002,height
images=[]
for im in bpy.data.images:
 if im.type=='IMAGE':images.append({'name':im.name,'packed':bool(im.packed_file),'size':list(im.size),'decodes':len(im.pixels)>0,'relative_path':not bool(re.search('[A-Za-z]:',im.filepath))})
def gh(ob):return hashlib.sha256(json.dumps({'vertices':[list(v.co)for v in ob.data.vertices],'polygons':[list(p.vertices)for p in ob.data.polygons]},separators=(',',':')).encode()).hexdigest()
locks={name:gh(bpy.data.objects[name])==h for name,h in v3['parking_geometry_hashes'].items()}
assert all(locks.values()),locks
bpy.ops.wm.save_as_mainfile(filepath=str(p),compress=True)
scene.render.resolution_x=960;scene.render.resolution_y=600;scene.render.resolution_percentage=100
renders=ROOT/'design/visuals/v4'
for frame in [1,121,241,361]:
 scene.frame_set(frame);scene.render.filepath=str(renders/('construction-%03d.png'%frame));bpy.ops.render.render(write_still=True)
scene.frame_set(361)
report={'pass':all(locks.values())and all(i['packed']and i['decodes']and i['relative_path']for i in images)and abs(height-90)<.002,'blender':bpy.app.version_string,'units':scene.unit_settings.scale_length,'wheel_height_m':height,'parking_bays':1000,'locked_parcel_zones_parking':locks,'images':images,'external_libraries':len(bpy.data.libraries),'source_unchanged':hashlib.sha256((ROOT/'design/v3/muscat-park-v3.blend').read_bytes()).hexdigest()==m['source_v3_sha256'],'actions':len(bpy.data.actions),'coaster_dimensions_m':m['coaster_source_dimensions_m'],'source_coaster_triangles':len(bpy.data.objects['WFC-20A actual source Boomerang'].data.polygons),'proposed_road_and_metre_coaster_placement_not_surveyed':True}
(V4/'native-validation.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
