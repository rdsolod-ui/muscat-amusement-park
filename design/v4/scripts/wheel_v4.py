# Authored 90 m concept. The supplied 50 m MAX is not rescaled engineering.
from mathutils import Matrix
wheel_parts={};wheel_cabins=[]
def empty(name,parent=None,loc=(0,0,0)):
 ob=bpy.data.objects.new(name,None);collection('V4_ANIMATION').objects.link(ob);ob.location=loc
 if parent:ob.parent=parent
 return ob
q=xy(270,555);wheel_root=empty('Wheel_90m',loc=(q.x,q.y,0));wheel_root['design_status']='90 m target concept; not certified supplier specification'
for name in ['foundations','supports','rim','spokes','cabins']:
 wheel_parts[name]=empty('wheel-'+name,wheel_root)
wheel_rotor=empty('wheel-rotor',wheel_root,(0,0,46.2))
for name in ['rim','spokes','cabins']:
 wheel_parts[name].parent=wheel_rotor;wheel_parts[name].location=(0,0,0)
b=Batch('wheel-foundation-geometry','V4_WHEEL');b.box((0,0,.25),(64,28,.5),'v3_cream');b.box((0,8,2),(36,12,4),'v3_ivory')
for x in [-19,19]:
 for y in [-10,10]:b.box((x,y,.8),(5,6,1.6),'v3_cream')
o=b.finish();o.parent=wheel_parts['foundations']
b=Batch('wheel-support-geometry','V4_WHEEL')
for y in [-3.1,3.1]:
 for dx in [-18,18]:b.beam((dx,-10 if y<0 else 10,.6),(0,y,46.2),.95,'v3_trim')
 b.beam((-15,-10 if y<0 else 10,8),(15,-10 if y<0 else 10,8),.3,'v3_gold')
b.tube([(0,-6,46.2),(0,6,46.2)],2.1,'v3_gold',20);o=b.finish();o.parent=wheel_parts['supports']
b=Batch('wheel-rim-geometry','V4_WHEEL')
for y in [-3.1,3.1]:
 for r in [42,40.9]:b.tube([(r*math.cos(i*math.tau/216),y,r*math.sin(i*math.tau/216))for i in range(217)],.28,'v3_trim',8)
for i in range(108):
 a=i*math.tau/108;b.beam((42*math.cos(a),-3.1,42*math.sin(a)),(42*math.cos(a+.02),3.1,42*math.sin(a+.02)),.09,'v3_gold')
o=b.finish();o.parent=wheel_parts['rim']
b=Batch('wheel-spoke-geometry','V4_WHEEL')
for y in [-3.1,3.1]:
 for i in range(36):
  a=i*math.tau/36;b.beam((0,y,0),(42*math.cos(a),y,42*math.sin(a)),.12,'v3_trim')
o=b.finish();o.parent=wheel_parts['spokes']
# Linked cabin geometry, individual pivots counter-rotate to remain level.
b=Batch('wheel-cabin-shell','V4_WHEEL')
b.box((0,0,-.6),(3.5,3.8,2.4),'v3_turquoise');b.box((0,0,.2),(3.3,3.81,2.35),'v3_glass');b.box((0,0,1.7),(3.65,3.95,.2),'v3_trim');b.box((0,0,-1.65),(3.65,3.95,.3),'v3_trim')
for dx in [-1.65,1.65]:
 for dy in [-1.82,1.82]:b.box((dx,dy,0),(.12,.12,3.4),'v3_trim')
for y in [-3.1,3.1]:b.beam((0,y,0),(0,1.9 if y>0 else -1.9,0),.13,'v3_gold')
base=b.finish()
for i in range(36):
 a=i*math.tau/36;ob=base if i==0 else bpy.data.objects.new('wheel-cabin-%02d'%i,base.data)
 if i:collection('V4_WHEEL').objects.link(ob)
 ob.name='wheel-cabin-%02d'%i;ob.parent=wheel_parts['cabins'];ob.location=(42*math.cos(a),0,42*math.sin(a));wheel_cabins.append(ob)
wheel_manifest={'height_m':90,'hub_height_m':46.2,'radius_m':42,'cabins':36,'source':'authored90mconcept;50mMAXreferenceonly','groups':{k:v.name for k,v in wheel_parts.items()},'rotor':wheel_rotor.name,'axis_blender':'Y','axis_gltf':'Z','clips':{'Wheel_Construction':{'duration_s':15,'stages':{'foundations':[0,2],'supports':[2,5],'rim':[5,8],'spokes':[8,10.5],'cabins':[10.5,14]},'final_hold':[14,15]},'Wheel_Rotation':{'duration_s':60,'loop':True,'presentation_speed_not_operating_specification':True}}}
