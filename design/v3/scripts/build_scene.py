import bpy,sys,json,hashlib,math,random
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent;V3=HERE.parent;ROOT=V3.parents[1];sys.path.insert(0,str(HERE))
from scene_utils import *
random.seed(9037)
BASE=ROOT/'design/muscat-park.blend';OUT=V3/'muscat-park-v3.blend';RENDERS=ROOT/'design/visuals/v3';RENDERS.mkdir(parents=True,exist_ok=True)
source_sha=hashlib.sha256(BASE.read_bytes()).hexdigest();bpy.ops.wm.open_mainfile(filepath=str(BASE));scene=bpy.context.scene
layout=json.loads((V3/'layout-reference.json').read_text(encoding='utf8'));parking=json.loads((V3/'parking-reference.json').read_text(encoding='utf8'));C=[Vector(p)for p in layout['image_corners_m']];zones={z['id']:z for z in layout['zones']}
def xy(px,py):
    u=px/1280;v=py/922;return C[0]*(1-u)*(1-v)+C[1]*u*(1-v)+C[2]*u*v+C[3]*(1-u)*v

def at(p,z=0):q=xy(*p);return(q.x,q.y,z)
def geom_hash(ob):
    if not ob:return None
    return hashlib.sha256(json.dumps({'vertices':[list(v.co)for v in ob.data.vertices],'polygons':[list(p.vertices)for p in ob.data.polygons]},separators=(',',':')).encode()).hexdigest()
LOCK_NAMES=['Original screenshot site perimeter']+['Reference zone '+n for n in ['rides','water','city','parking','utility']]+['Parking bays and cars']+['Parking connected aisle%02d'%i for i in range(16)]
locked={n:geom_hash(bpy.data.objects.get(n))for n in LOCK_NAMES}
original_objects=len(bpy.data.objects)
plant=bpy.data.objects.get('Drought planting bed.008')
if plant:plant.location+=Vector(at((790,560)))-Vector(at((810,575)))
# This revision opens a saved baseline in an isolated process and writes a new file only.
remove_names=['Built pavilion details','Public amenities','Open louver canopy seasonal mist lines','Pool structures and slides','Leisure pool surround','Leisure pool water','Children splash pool deck','Children splash shallow water','FNT01 modest recirculating fountain','FNT01 water','Lazy river dry island','Lazy river outer deck','Lazy river water']
for ob in list(bpy.data.objects):
    if ob.name in remove_names or 'wheel' in ob.name.lower() or ob.name.startswith('Future ride study') or 'Disco Coster' in ob.name or 'Disco Coaster' in ob.name or ob.name.startswith('PRESENTATION_ONLY'):remove_object(ob.name)
# Semantic material palette; opaque water avoids unintended screen-space transparency.
colors={'v3_cream':(.77,.69,.51),'v3_ivory':(.87,.82,.67),'v3_trim':(.92,.87,.74),'v3_mint':(.29,.53,.44),'v3_peach':(.65,.34,.25),'v3_sage':(.46,.53,.35),'v3_blue':(.095,.23,.28),'v3_roof':(.06,.14,.16),'v3_gold':(.68,.39,.12),'v3_glass':(.026,.17,.20),'v3_coral':(.68,.12,.055),'v3_turquoise':(.012,.40,.52),'v3_water':(.009,.37,.48),'v3_foam':(.73,.90,.88),'v3_sand':(.64,.51,.32),'v3_green':(.075,.20,.08),'v3_wood':(.28,.13,.045),'v3_steel':(.18,.23,.22),'v3_dark':(.018,.04,.045),'v3_yellow':(.96,.60,.10)}
for n,c in colors.items():material(n,c,.24 if n in ['v3_water','v3_glass']else .65,.3 if n in ['v3_gold','v3_steel']else 0)
for n in ['sand','paving','path']:
    ma=bpy.data.materials.get(n)
    if ma:
        co={'sand':(.37,.29,.17),'paving':(.53,.46,.33),'path':(.71,.63,.46)}[n];ma.diffuse_color=(*co,1);ma.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(*co,1)
scene.unit_settings.system='METRIC';scene.unit_settings.scale_length=1
scene.render.engine='BLENDER_EEVEE';scene.render.threads_mode='FIXED';scene.render.threads=8
scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False;scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX';scene.view_settings.exposure=-.25
try:scene.view_settings.look='AgX - Medium High Contrast'
except Exception:pass
scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.54,.66,.76,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.36
sun=bpy.data.lights.get('Muscat daylight');sun.energy=2.4;sun.color=(1,.92,.80);sun.angle=.08
# Retain supplied source-derived rides, moving their whole anchors without changing internal dimensions.
ride_moves={'Condor source anchor':(446,580),'Drop Tower source anchor':(489,431),'Typhoon source anchor':(466,524),'Chain Carousel source anchor':(353,576)}
ride_move_report=[]
for name,p in ride_moves.items():
    ob=bpy.data.objects.get(name)
    if ob:
        delta=Vector(at(p,.25))-ob.location;ob.location+=delta;ride_move_report.append({'anchor':name,'source_px':p,'source_geometry_retained':True})
        platform=bpy.data.objects.get(name.replace(' source anchor',' visitor platform'))
        if platform:platform.location+=delta
# Rendering/authoring modules share the same coordinate frame and exact parcel.
ctx=globals()
for module in ['rides_v3.py','architecture_v3.py','water_v3.py','routes_v3.py']:
    exec(compile((HERE/module).read_text(encoding='utf8'),str(HERE/module),'exec'),ctx)
bpy.context.view_layer.update()
# Six original cameras remain as historical views; these nine v3 views are intentionally distinct.
CAM={}
right=(C[1]-C[0]+C[2]-C[3])/2
f=xy(610,485);CAM['masterplan-top']=camera('V3 masterplan top',(f.x,f.y,2000),(f.x,f.y,0),right.length*.75,(1920,1220));CAM['masterplan-top']['object'].rotation_euler=(0,0,math.atan2(right.y,right.x))
f=xy(594,475);CAM['aerial']=camera('V3 aerial',(f.x+730,f.y-1060,1280),(f.x,f.y,8),1510,(2100,1400))
f=xy(382,495);CAM['rides']=camera('V3 rides',(f.x+320,f.y-375,310),(f.x,f.y,24),585,(1800,1200))
f=xy(585,501);CAM['promenade']=camera('V3 promenade',(f.x+92,f.y+155,84),(f.x,f.y-52,7),265,(1800,1200))
f=xy(786,481);CAM['water']=camera('V3 water',(f.x+265,f.y-250,220),(f.x,f.y,4),435,(1800,1200))
f=xy(715,337);CAM['parking']=camera('V3 parking',(f.x+275,f.y+190,270),(f.x,f.y,0),630,(1800,1200))
f=xy(937,371);CAM['approach']=camera('V3 approach',(f.x+185,f.y+205,160),(f.x-90,f.y+10,2),380,(1800,1200))
f=xy(648,380);CAM['entrance']=camera('V3 entrance',(f.x+62,f.y+128,57),(f.x,f.y-28,7),220,(1800,1200))
f=xy(580,642);CAM['dome']=camera('V3 dome',(f.x+108,f.y+155,110),(f.x,f.y,12),255,(1800,1200))
f=xy(585,507);CAM['pergola']=camera('V3 pergola',(f.x+32,f.y+50,27),(f.x-3,f.y-30,3.8),105,(1800,1200))
# Units and portability are preserved; no external references or satellite imagery enter v3.
for im in bpy.data.images:
    if im.type=='IMAGE':
        if not im.packed_file:im.pack()
        im.filepath='//textures/'+im.name+(''if im.name.lower().endswith(('.png','.jpg','.jpeg'))else'.png')
# Convert v3 labels into editable meshes for glTF, with the built-in font no external font dependency.
for ob in list(bpy.data.objects):
    if ob.type=='FONT' and ob.name.startswith('V3'):
        bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob;bpy.ops.object.convert(target='MESH')
# Remove only file-system source metadata from public scene; keep semantic origin notes.
import re
for block in list(bpy.data.objects)+list(bpy.data.materials)+list(bpy.data.scenes):
    for k in list(block.keys()):
        if isinstance(block[k],str) and (re.search(r'[A-Za-z]:[\\/]',block[k]) or 'assets/working/' in block[k].replace('\\','/')):block[k]='source-derived asset; provenance in reference-manifest.json'
for name,h in locked.items():
    assert geom_hash(bpy.data.objects.get(name))==h,'Locked geometry changed: '+name
wheel=bpy.data.objects['V3 observation wheel90m'];zs=[(wheel.matrix_world@v.co).z for v in wheel.data.vertices];wheel_height=max(zs)-min(zs)
assert abs(wheel_height-90)<.001,(min(zs),max(zs),wheel_height)
# Per-vertex footprints provide concept fit evidence only, not engineering clearances.
new_footprints={}
for name in ['V3 observation wheel90m','V3 grand coaster concept','V3 dome family venue','V3 wave pool and beach','V3 arrival arch']:
    ob=bpy.data.objects.get(name)
    if ob:new_footprints[name]=[[float((ob.matrix_world@v.co).x),float((ob.matrix_world@v.co).y)]for v in ob.data.vertices]
(V3/'fit-points.json').write_text(json.dumps(new_footprints,separators=(',',':')),encoding='utf8')
manifest={'revision':'v3','units':'metres','crs':'EPSG:32640','origin_utm_m':layout['origin_utm_m'],'axes':{'blender':'X local easting,Y local northing,Z up','gltf':'X=BlenderX,Y=BlenderZ,Z=-BlenderY'},'source_scene_sha256':source_sha,'source_scene_unchanged':source_sha==hashlib.sha256(BASE.read_bytes()).hexdigest(),'parcel_and_zones_unchanged':True,'parking_geometry_unchanged':True,'parking_count':len(parking['bays']),'parking_geometry_hashes':locked,'wheel':{'total_height_m':wheel_height,'min_z_m':min(zs),'max_z_m':max(zs),'radius_m':42,'cabins':36,'status':'new authored concept, not scaled vendor engineering model'},'coaster':{'status':'authored spatial concept, not imported Molniya DWG and not a certified ride layout','track_length_m':coaster_track_length,'centerline_xyz_m':coaster_points,'max_track_height_m':max(p[2]for p in coaster_points)},'retained_source_rides':ride_move_report,'new_buildings':building_program,'pergolas':route_registry,'water':'authored wave-pool, slides, beach club and lounge concept; not hydraulic engineering','dome':'hemispherical children laser-tag and performance-venue programme concept','phasing':'proposed; no approved budget or low-CAPEX claim','hydrology':'Original zoning retained; survey, drainage constraints, stormwater and buildability remain unverified.','cameras':{k:{kk:vv for kk,vv in v.items()if kk!='object'}for k,v in CAM.items()},'images':[{'name':im.name,'packed':bool(im.packed_file)}for im in bpy.data.images if im.type=='IMAGE'],'mesh_objects':sum(ob.type=='MESH'for ob in bpy.data.objects),'triangles':sum(sum(len(p.vertices)-2 for p in ob.data.polygons)for ob in bpy.data.objects if ob.type=='MESH')}
plan_objects={}
for name in ['V3 observation wheel90m','V3 grand coaster concept','V3 dome family venue','V3 wave pool and beach','V3 arrival arch','V3 two-storey promenade facades','V3 cafe verandas and furniture','V3 parking shade and wayfinding']:
    ob=bpy.data.objects.get(name)
    if ob:
        plan_objects[name]={'vertices_xy_m':[[float((ob.matrix_world@v.co).x),float((ob.matrix_world@v.co).y)]for v in ob.data.vertices],'faces':[{'v':list(p.vertices),'mat':ob.data.materials[p.material_index].name}for p in ob.data.polygons if p.normal.z>.85]}
(V3/'plan-geometry.json').write_text(json.dumps(plan_objects,separators=(',',':')))
(V3/'scene-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8')
scene.camera=CAM['aerial']['object'];scene.render.resolution_x,scene.render.resolution_y=CAM['aerial']['resolution'];bpy.ops.wm.save_as_mainfile(filepath=str(OUT),compress=True)
print('V3_SCENE_READY',OUT.name,OUT.stat().st_size,flush=True)
# Export all actual meshes except render-only atmospheric volumes. Source blend keeps editable collections.
bpy.ops.object.select_all(action='DESELECT')
for ob in bpy.data.objects:
    if ob.type=='MESH'and not ob.name.startswith('V3 MIST'):ob.select_set(True)
raw=Path(sys.argv[sys.argv.index('--')+1])if '--' in sys.argv else V3/'muscat-park-v3-raw.glb'
bpy.ops.export_scene.gltf(filepath=str(raw),export_format='GLB',use_selection=True,export_yup=True,export_animations=False,export_extras=False,export_cameras=False,export_lights=False)
print('V3_RAW_EXPORT_READY',raw.name,flush=True)
# Locked first-generation sources, then unique close-ups.
for key in ['masterplan-top','aerial','promenade','rides','water','parking','approach','entrance','dome','pergola']:
    cfg=CAM[key];scene.camera=cfg['object'];scene.render.resolution_x,scene.render.resolution_y=cfg['resolution'];scene.render.filepath=str(RENDERS/(key+'.png'));bpy.ops.render.render(write_still=True);print('V3_RENDER_READY',key,flush=True)