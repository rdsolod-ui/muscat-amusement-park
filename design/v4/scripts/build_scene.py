import bpy,sys,json,math,hashlib
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
HERE=Path(__file__).resolve().parent;V4=HERE.parent;ROOT=V4.parents[1];WORK=Path(sys.argv[sys.argv.index('--')+1]);sys.path.insert(0,str(HERE))
from scene_utils import *
BASE=ROOT/'design/v3/muscat-park-v3.blend';bpy.ops.wm.open_mainfile(filepath=str(BASE));scene=bpy.context.scene
V3=json.loads((ROOT/'design/v3/scene-manifest.json').read_text(encoding='utf8'));layout=json.loads((V4/'layout-reference.json').read_text(encoding='utf8'));C=[Vector(p)for p in layout['image_corners_m']]
coords=json.loads((ROOT/'docs/v4-site/site-coordinate-manifest.json').read_text(encoding='utf8'))
def xy(px,py):
 u=px/1280;v=py/922;return C[0]*(1-u)*(1-v)+C[1]*u*(1-v)+C[2]*u*v+C[3]*(1-u)*v
def at(p,z=0):q=xy(*p);return(q.x,q.y,z)
for ma in bpy.data.materials:M[ma.name]=ma
for name in ['V3 grand coaster concept','V3 observation wheel90m']:remove_object(name)
for script in ['details_v4.py','wheel_v4.py']:exec(compile((HERE/script).read_text(),str(HERE/script),'exec'),globals())
before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(WORK/'boomerang-wfc20a.glb'));imported=list(set(bpy.data.objects)-before)
coaster=[o for o in imported if o.type=='MESH'][0];coaster.name='WFC-20A actual source Boomerang'
verts=[coaster.matrix_world@v.co for v in coaster.data.vertices];mn=Vector(tuple(min(v[i]for v in verts)for i in range(3)));mx=Vector(tuple(max(v[i]for v in verts)for i in range(3)))
q=xy(422,427);coaster.location+=Vector((q.x-(mn.x+mx.x)/2,q.y-(mn.y+mx.y)/2,.3-mn.z))
for c in list(coaster.users_collection):c.objects.unlink(coaster)
collection('V4_WFC_SOURCE').objects.link(coaster)
coaster['source']='WFC-20A.skp; native SketchUp C API export';coaster['source_sha256']='de22eab1dd6574b41d671921c333a1c56093ecebb7cc0a011c8eb7062883d816'
dec=coaster.modifiers.new('Presentation LOD retain source silhouette','DECIMATE');dec.ratio=.55;dec.use_collapse_triangulate=True
print('WFC_IMPORTED',len(coaster.data.polygons),list(mx-mn),flush=True)
material('v4_asphalt',(.075,.086,.082),.9);material('v4_line',(.86,.80,.61),.8)
road=Batch('V4 junction connection and existing road context','V4_ACCESS');mark=Batch('V4 road lane detail','V4_ACCESS')
def ribbon(ps,width,z,mat,batch=road):
 pts=[Vector((p[0],p[1],z))for p in ps]
 for a,b in zip(pts[:-1],pts[1:]):
  if (b-a).length<.001:continue
  t=(b-a).normalized();s=Vector((-t.y,t.x,0))*width/2;batch.plane([a+s,a-s,b-s,b+s],z,mat)
def route(src,width=12,z=.22):
 ps=[list(xy(*p))for p in src];ribbon(ps,width,z,'v4_asphalt')
 for a,b in zip(ps[:-1],ps[1:]):
  a,b=Vector(a),Vector(b);d=b-a;l=d.length
  for t in range(0,int(l)-3,9):ribbon([a+d*(t/l),a+d*((t+3)/l)],.2,z+.025,'v4_line',mark)
 return ps
route([(80,6),(300,42),(520,77),(755,111),(980,151),(1012,158)],23)
route([(1058,168),(1130,190),(1280,232)],23);route([(1049,140),(1059,100),(1075,52),(1094,0)],18)
existing=xy(1035,164);ring=[(existing.x+28*math.cos(i*math.tau/96),existing.y+28*math.sin(i*math.tau/96))for i in range(97)]
ribbon(ring,15,.23,'v4_asphalt');road.ellipse(existing,19,19,.26,'v3_sand');approach=[]
for r in coords['roads']:
 ps=[p['local_utm_m']for p in r['points']];ribbon(ps,13,.28,'v4_asphalt');approach.extend(ps)
 for a,b in zip(ps[:-1],ps[1:]):
  a,b=Vector(a),Vector(b);d=b-a;l=d.length
  for t in range(0,max(0,int(l)-3),9):ribbon([a+d*(t/l),a+d*((t+3)/l)],.22,.31,'v4_line',mark)
end=Vector(approach[-1]);candidates=[]
for o in bpy.data.objects:
 if o.type=='MESH'and o.name.startswith('Parking connected aisle'):
  vs=[o.matrix_world@v.co for v in o.data.vertices]
  for e in o.data.edges:
   aa,bb=[Vector((vs[i].x,vs[i].y))for i in e.vertices];d=bb-aa;t=max(0,min(1,(end-aa).dot(d)/max(d.length_squared,1e-9)));p=aa+t*d;candidates.append(((p-end).length,p,o.name))
tie=min(candidates,key=lambda a:a[0]);ribbon([end,tie[1]],13,.29,'v4_asphalt');road.finish();mark.finish()
u=Batch('V4 utility workshop and filtration equipment','V4_UTILITIES');p=xy(255,348)
u.box((p.x,p.y,3.1),(30,17,6.2),'v3_cream');u.box((p.x,p.y,6.4),(32,19,.4),'v3_trim')
for dx in [-8,8]:u.box((p.x+dx,p.y-8.6,2.4),(6,.2,4.5),'v3_steel')
for dx in [-10,0,10]:u.cylinder((p.x+dx,p.y+22,2.5),2.8,5,'v3_steel',16)
for i in range(30):u.box((p.x-20+i*1.4,p.y+29,2.8),(.4,.4,5.6),'v3_wood')
u.finish()
for ob in list(bpy.data.objects):
 if ob.type=='FONT'and ob.name.startswith('V4'):
  bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob;bpy.ops.object.convert(target='MESH')
for im in bpy.data.images:
 if im.type=='IMAGE':
  if not im.packed_file:im.pack()
  im.filepath='//textures/'+Path(im.name).name
scene.unit_settings.system='METRIC';scene.unit_settings.scale_length=1
scene.render.engine='BLENDER_EEVEE';scene.render.threads_mode='FIXED';scene.render.threads=8;scene.render.fps=24;scene.frame_start=1;scene.frame_end=1801
scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
f=xy(611,440);CAM={'aerial':camera('V4 aerial',(f.x+340,f.y-810,1590),(f.x,f.y+55,0),1640,(1920,1200))}
for key,p,offset,target,width in [('entrance',(648,381),(65,132,54),(0,-18,7),215),('promenade',(585,501),(92,155,84),(0,-52,7),265),('dome',(580,642),(108,155,110),(0,0,12),250),('rides',(422,427),(105,-130,100),(0,0,12),250),('water',(790,510),(210,-240,210),(0,0,5),440)]:
 q=xy(*p);CAM[key]=camera('V4 '+key,(q.x+offset[0],q.y+offset[1],offset[2]),(q.x+target[0],q.y+target[1],target[2]),width,(1600,1000))
stages={}
def animation_group(name,objects,span):
 root=empty(name)
 for ob in objects:m=ob.matrix_world.copy();ob.parent=root;ob.matrix_world=m
 stages[name]=span;return root
meshes=[o for o in bpy.data.objects if o.type=='MESH']
animation_group('Build_Promenade',[o for o in meshes if o.name.startswith(('V3 two-storey','V3 cafe','V3 arrival','V4 facade','V4 cafe','V4 entrance','V4 sign'))],[2,7])
animation_group('Build_Dome',[o for o in meshes if o.name.startswith(('V3 dome','V4 dome'))],[5,9]);animation_group('Build_Shade',[o for o in meshes if o.name.startswith(('V3 all pedestrian','V4 promenade','V3 parking shade'))],[8,12]);animation_group('Build_Boomerang',[coaster],[6,11])
stages.update({o.name:wheel_manifest['clips']['Wheel_Construction']['stages'][k]for k,o in wheel_parts.items()})
for name,(a,b)in stages.items():
 ob=bpy.data.objects[name]
 for sec,scale in [(0,.001),(a,.001),(b,1),(15,1)]:ob.scale=(scale,)*3 if name.startswith('wheel-') else (1,1,scale);ob.keyframe_insert(data_path='scale',frame=1+sec*24)
 if ob.animation_data and ob.animation_data.action:ob.animation_data.action.name='Construction_'+name
for i in range(9):
 angle=i*math.tau/8;wheel_rotor.rotation_euler[1]=angle;wheel_rotor.keyframe_insert('rotation_euler',frame=361+i*180)
 for cab in wheel_cabins:cab.rotation_euler[1]=-angle;cab.keyframe_insert('rotation_euler',frame=361+i*180)
for action in bpy.data.actions:
 for layer in action.layers:
  for strip in layer.strips:
   for cb in strip.channelbags:
    for fc in cb.fcurves:
     for kp in fc.keyframe_points:kp.interpolation='LINEAR'
scene.frame_set(361);bpy.context.view_layer.update()
def export(path,selection):
 bpy.ops.object.select_all(action='DESELECT')
 for ob in selection:ob.select_set(True)
 bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_yup=True,export_animations=False,export_extras=False,export_cameras=False,export_lights=False,export_apply=True)
all_export=[o for o in bpy.data.objects if o.type in ['MESH','EMPTY']and not o.name.startswith('V3 MIST')];export(WORK/'park-v4-static.glb',all_export)
wheel_objects=[wheel_root,*wheel_root.children_recursive];savedloc=wheel_root.location.copy();wheel_root.location=(0,0,0);bpy.context.view_layer.update();export(WORK/'wheel-v4-static.glb',wheel_objects);wheel_root.location=savedloc
scene.camera=CAM['aerial']['object'];scene.render.resolution_x,scene.render.resolution_y=CAM['aerial']['resolution'];bpy.ops.wm.save_as_mainfile(filepath=str(V4/'muscat-park-v4.blend'),compress=True)
pins=[]
for p in coords['pins']:
 q=world_to_camera_view(scene,scene.camera,Vector((*p['local_utm_m'],4)));pins.append({'id':p['id'],'x':round(q.x*100,4),'y':round((1-q.y)*100,4),'world_m':p['local_utm_m']})
route_projected=[]
for p in approach:
 q=world_to_camera_view(scene,scene.camera,Vector((*p,1)));route_projected.append([round(q.x*100,4),round((1-q.y)*100,4)])
(V4/'model-anchors.json').write_text(json.dumps({'revision':'v4','image':'media/v4/model-aerial.webp','size':[1920,1200],'coordinate_unit':'percent','pins':pins,'access_road':route_projected},indent=2))
manifest={'revision':'v4','native_blender':bpy.app.version_string,'units':'metres','source_v3_sha256':hashlib.sha256(BASE.read_bytes()).hexdigest(),'source_geometry':'actual WFC-20A native SketchUp mesh','coaster_source_dimensions_m':list(mx-mn),'coaster_display_decimate_ratio':.55,'coaster_source_triangles':len(coaster.data.polygons),'wheel':wheel_manifest,'park_stages':stages,'road_connection':{'existing_junction_px':[1035,164],'proposed_roundabout_px':[945,383],'aisle_tie_distance_m':tie[0],'aisle_tie_object':tie[2],'survey_approved':False},'parking_bays':1000,'images':[{'name':i.name,'packed':bool(i.packed_file)}for i in bpy.data.images if i.type=='IMAGE'],'cameras':{k:{kk:vv for kk,vv in v.items()if kk!='object'}for k,v in CAM.items()}}
(V4/'scene-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf8');renders=ROOT/'design/visuals/v4';renders.mkdir(parents=True,exist_ok=True)
for key in ['aerial','entrance','promenade','dome','rides','water']:
 cfg=CAM[key];scene.camera=cfg['object'];scene.render.resolution_x,scene.render.resolution_y=cfg['resolution'];scene.render.filepath=str(renders/('model-'+key+'.png'));bpy.ops.render.render(write_still=True);print('V4_RENDER_READY',key,flush=True)
for ob in bpy.data.objects:
 if ob.type=='MESH':ob.hide_render=ob not in wheel_objects
q=wheel_root.location;cam=camera('V4 wheel poster',(q.x+28,q.y-175,64),(q.x,q.y,45),111,(1536,1260));scene.camera=cam['object'];scene.render.resolution_x,scene.render.resolution_y=cam['resolution'];scene.render.film_transparent=True;scene.render.filepath=str(renders/'wheel-poster.png');bpy.ops.render.render(write_still=True)
print('V4_COMPLETE',flush=True)
