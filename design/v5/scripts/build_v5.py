import bpy,sys,math,json,hashlib,random
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent;V5=HERE.parent;ROOT=V5.parents[1];WORK=Path(sys.argv[sys.argv.index('--')+1]);NATIVE=Path(sys.argv[sys.argv.index('--')+2]);sys.path.insert(0,str(ROOT/'design/v4/scripts'))
from scene_utils import *
random.seed(51002);RENDERS=ROOT/'design/visuals/v5';RENDERS.mkdir(parents=True,exist_ok=True)
# Isolated actual source asset, with source material and UV evidence intact.
bpy.ops.wm.read_factory_settings(use_empty=True);scene=bpy.context.scene
bpy.ops.import_scene.gltf(filepath=str(NATIVE/'boomerang-wfc20a.glb'))
ride=next(o for o in bpy.data.objects if o.type=='MESH');ride.name='WFC-20A Boomerang actual source'
vv=[ride.matrix_world@v.co for v in ride.data.vertices];mn=Vector([min(v[i]for v in vv)for i in range(3)]);mx=Vector([max(v[i]for v in vv)for i in range(3)]);dim=mx-mn
ride.location-=Vector(((mn.x+mx.x)/2,(mn.y+mx.y)/2,mn.z));bpy.context.view_layer.update()
ride['source']='WFC-20A.skp; native SketchUp C API geometry';ride['source_sha256']='de22eab1dd6574b41d671921c333a1c56093ecebb7cc0a011c8eb7062883d816'
dec=ride.modifiers.new('Reversible web LOD 70 percent','DECIMATE');dec.ratio=.70;dec.use_collapse_triangulate=True
scene.unit_settings.system='METRIC';scene.unit_settings.scale_length=1
scene.render.engine='CYCLES';scene.cycles.samples=48;scene.cycles.use_denoising=True;scene.cycles.max_bounces=6;scene.render.threads_mode='FIXED';scene.render.threads=8
scene.world=bpy.data.worlds.new('Neutral daylight');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.68,.78,.91,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.48
scene.view_settings.view_transform='AgX';scene.view_settings.exposure=.1
light=bpy.data.lights.new('Soft afternoon sun','SUN');light.energy=3.2;light.angle=.055;light.color=(1,.91,.77);sun=bpy.data.objects.new('Soft afternoon sun',light);scene.collection.objects.link(sun);sun.rotation_euler=(.6,-.45,-.5)
material('v5_studio_ground',(.57,.53,.45),.86);g=Batch('Studio ground render only','RENDER_ONLY');g.box((0,0,-.35),(600,600,.6),'v5_studio_ground');ground=g.finish()
cam=camera('Boomerang hero camera',(123,-174,98),(0,0,19),153,(1920,1200));scene.camera=cam['object'];scene.render.resolution_x,scene.render.resolution_y=cam['resolution'];scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG'
for im in bpy.data.images:
 if im.type=='IMAGE':
  if not im.packed_file:im.pack()
  im.filepath='//textures/'+im.name
bpy.ops.wm.save_as_mainfile(filepath=str(V5/'boomerang.blend'),compress=True)
bpy.ops.object.select_all(action='DESELECT');ride.select_set(True);bpy.context.view_layer.objects.active=ride
bpy.ops.export_scene.gltf(filepath=str(WORK/'boomerang-raw.glb'),export_format='GLB',use_selection=True,export_apply=True,export_animations=False,export_current_frame=True,export_extras=False,export_cameras=False,export_lights=False)
scene.render.use_stamp_filename=False;scene.render.filepath=str(RENDERS/'boomerang-render.png');bpy.ops.render.render(write_still=True);print('BOOMERANG_READY',flush=True)
standalone={'source':'WFC-20A.skp','source_sha256':ride['source_sha256'],'dimensions_m':list(dim),'source_triangles':len(ride.data.polygons),'lod_ratio':.70,'source_materials':len(ride.data.materials),'packed_textures':[{'name':i.name,'packed':bool(i.packed_file),'size':list(i.size)}for i in bpy.data.images if i.type=='IMAGE'],'render':'Cycles48samples, denoised, 1920x1200','kind':'actual supplier source geometry; source dimensions are not independently certified'}
(V5/'boomerang-source.json').write_text(json.dumps(standalone,indent=2))
# Preserve the approved v4 camera, boundaries, road and anchor registration.
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'design/v4/muscat-park-v4.blend'));scene=bpy.context.scene;scene.render.use_stamp_filename=False;scene.frame_set(361);bpy.context.view_layer.update()
for ma in bpy.data.materials:M[ma.name]=ma
layout=json.loads((ROOT/'design/v4/layout-reference.json').read_text());C=[Vector(p)for p in layout['image_corners_m']]
def xy(px,py):
 u=px/1280;v=py/922;return C[0]*(1-u)*(1-v)+C[1]*u*(1-v)+C[2]*u*v+C[3]*(1-u)*v
material('v5_flagpole',(.6,.57,.48),.23,.8);material('v5_palm_trunk',(.24,.12,.045),.92);material('v5_palm_leaf',(.075,.23,.06),.83);material('v5_palm_light',(.20,.32,.09),.82)
flag_mat=material('Oman flag official Foreign Ministry original',(1,1,1),.9)
tex=bpy.data.images.load(str(ROOT/'public/brand/oman-flag.jpg'),check_existing=True);tex.pack();tex.filepath='//textures/oman-flag.jpg'
for packed in tex.packed_files:packed.filepath='//textures/oman-flag.jpg'
nd=flag_mat.node_tree.nodes.new('ShaderNodeTexImage');nd.image=tex;flag_mat.node_tree.links.new(nd.outputs['Color'],flag_mat.node_tree.nodes['Principled BSDF'].inputs['Base Color'])
flag_mat.use_backface_culling=False
for name,col in [('Russia white',(.96,.96,.96)),('Russia blue',(.006,.045,.38)),('Russia red',(.65,.006,.025))]:material(name,col,.92).use_backface_culling=False
flags=[];poles=Batch('V5 flagpoles','V5_FLAGS')
def flag(name,origin,w,h,pole_height,oman=True):
 x,y,z=origin;poles.cylinder((x,y,z+pole_height/2),.18 if w<6 else .28,pole_height,'v5_flagpole',16);poles.cylinder((x,y,z+pole_height+.1),.27 if w<6 else .4,.35,'v3_gold',16)
 nx,ny=36,18
 def points(phase):
  out=[]
  for j in range(ny+1):
   v=j/ny
   for i in range(nx+1):
    u=i/nx;out.append((u*w,.085*w*u**.7*math.sin(2*math.pi*1.35*u+phase)+.025*w*u*math.sin(phase+v*math.pi*2),-v*h-.035*w*u+.025*w*u*math.cos(phase+u*math.pi*2+v)))
  return out
 verts=points(.4);faces=[(j*(nx+1)+i,j*(nx+1)+i+1,(j+1)*(nx+1)+i+1,(j+1)*(nx+1)+i)for j in range(ny)for i in range(nx)]
 me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update();ob=bpy.data.objects.new(name,me);collection('V5_FLAGS').objects.link(ob);ob.location=(x+.22,y,z+pole_height-.45)
 uv=me.uv_layers.new(name='UVMap')
 for p in me.polygons:
  p.use_smooth=True
  for li in p.loop_indices:
   vi=me.loops[li].vertex_index;uv.data[li].uv=((vi%(nx+1))/nx,1-(vi//(nx+1))/ny)
 if oman:me.materials.append(flag_mat)
 else:
  for mat in ['Russia white','Russia blue','Russia red']:me.materials.append(M[mat])
  for poly in me.polygons:poly.material_index=min(2,(poly.index//nx)//6)
 ob.shape_key_add(name='Basis')
 for key,phase in [('WindA',.4+math.tau/3),('WindB',.4+2*math.tau/3)]:
  sk=ob.shape_key_add(name=key)
  for p,co in zip(sk.data,points(phase)):p.co=co
 for frame,a,b in [(1,0,0),(33,1,0),(65,0,1),(97,0,0)]:
  for key,val in [('WindA',a),('WindB',b)]:ob.data.shape_keys.key_blocks[key].value=val;ob.data.shape_keys.key_blocks[key].keyframe_insert('value',frame=frame)
 action=ob.data.shape_keys.animation_data.action
 for layer in action.layers:
  for strip in layer.strips:
   for cb in strip.channelbags:
    for fc in cb.fcurves:
     fc.modifiers.new('CYCLES')
     for kp in fc.keyframe_points:kp.interpolation='BEZIER';kp.handle_left_type='AUTO';kp.handle_right_type='AUTO'
 flags.append({'object':name,'country':'Oman'if oman else'Russia','dimensions_m':[w,h],'pole_height_m':pole_height,'base_m':[x,y,z]});return ob
p=xy(580,651);flag('FLAG_Oman_Dome',(p.x,p.y,34.9),12,12*1143/2000,18,True)
p=xy(648,381)
for side in [-1,1]:
 for i in range(3):flag('FLAG_Entrance_%s_%d'%('West'if side<0 else'East',i),(p.x+side*(26+9*i),p.y+12,.25),4.2,4.2*1143/2000 if i%2==0 else 2.8,10, i%2==0)
poles.finish()
# Authored date-palm concept instances around the park's retained perimeter, no species-performance claims.
palm=Batch('V5 date palm prototype','V5_LANDSCAPE');palm.cylinder((0,0,4),.27,8,'v5_palm_trunk',12,rt=.18)
for k in range(28):palm.cylinder((0,0,.3+k*.27),.28-k*.002,.065,'v5_palm_trunk',12)
for leaf in range(12):
 az=leaf*math.tau/12+.2;pts=[]
 for j in range(13):
  t=j/12;pts.append((math.cos(az)*4.5*t,math.sin(az)*4.5*t,8+1.4*math.sin(t*math.pi)-1.4*t*t))
 palm.tube(pts,.04,'v5_palm_light',5)
 for j in range(1,12):
  t=j/12;c=Vector(pts[j]);length=1.2*math.sin(t*math.pi)**.65
  for side in [-1,1]:
   angle=az+side*1.0;tip=c+Vector((math.cos(angle)*length,math.sin(angle)*length,-.38*length));across=Vector((-math.sin(az),math.cos(az),0))*.105
   palm.add([c-across,c+across,tip+Vector((0,0,.07)),tip-Vector((0,0,.07))],[(0,1,2),(0,2,3)],'v5_palm_leaf'if leaf%2 else'v5_palm_light')
proto=palm.finish();parcel=next(z for z in layout['zones']if z['id']=='parcel');poly=[xy(*p)for p in parcel['source_px']];center=sum(poly,Vector((0,0)))/len(poly);positions=[]
for a,b in zip(poly,poly[1:]+poly[:1]):
 d=b-a;count=max(1,int(d.length/24))
 for i in range(count):
  p=a+d*(i+.5)/count;inward=(center-p).normalized()*10;p+=inward
  if (p-xy(945,383)).length<62:continue
  positions.append(p)
for i,p in enumerate(positions):
 ob=proto if i==0 else bpy.data.objects.new('V5 perimeter palm %03d'%i,proto.data)
 if i:collection('V5_LANDSCAPE').objects.link(ob)
 ob.location=(p.x,p.y,.1);sc=.91+random.random()*.20;ob.scale=(sc,sc,sc);ob.rotation_euler.z=random.random()*math.tau
scene.frame_set(361);bpy.context.view_layer.update();scene.camera=bpy.data.objects['V4 aerial'];scene.render.resolution_x=1920;scene.render.resolution_y=1200;scene.render.resolution_percentage=100
for im in bpy.data.images:
 if im.type=='IMAGE'and not im.packed_file:im.pack()
bpy.ops.wm.save_as_mainfile(filepath=str(V5/'muscat-park-v5.blend'),compress=True)
bpy.ops.object.select_all(action='DESELECT')
for ob in bpy.data.objects:
 if ob.type in ['MESH','EMPTY']and not ob.name.startswith('V3 MIST'):ob.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(WORK/'park-v5-static.glb'),export_format='GLB',use_selection=True,export_apply=True,export_current_frame=True,export_animations=False,export_morph=True,export_extras=False,export_cameras=False,export_lights=False)
for key,cam_name in [('aerial','V4 aerial'),('entrance','V4 entrance'),('dome','V4 dome')]:
 scene.camera=bpy.data.objects[cam_name];scene.render.resolution_x=1920 if key=='aerial'else 1600;scene.render.resolution_y=1200 if key=='aerial'else 1000;scene.render.filepath=str(RENDERS/('model-'+key+'.png'));bpy.ops.render.render(write_still=True);print('V5_PARK_RENDER',key,flush=True)
m={'revision':'v5','source_v4_sha256':hashlib.sha256((ROOT/'design/v4/muscat-park-v4.blend').read_bytes()).hexdigest(),'units':'metres','flags':flags,'flag_source':'https://www.fm.gov.om/en/ministry/media/downloads/','flag_sha256':hashlib.sha256((ROOT/'public/brand/oman-flag.jpg').read_bytes()).hexdigest(),'perimeter_palms':len(positions),'palms':'authored presentation date-palm mesh, instanced; species/irrigation not engineered','camera_and_pins':'unchanged v4 aerial camera and anchor positions','flag_animation':'Flags_Wind,4secondloop with2morph targets perflag','construction_and_wheel_clips':'retainedfromv4','source_v4_unchanged':True}
(V5/'park-additions.json').write_text(json.dumps(m,indent=2));(V5/'model-anchors.json').write_bytes((ROOT/'design/v4/model-anchors.json').read_bytes());print('V5_MODELS_DONE',flush=True)
