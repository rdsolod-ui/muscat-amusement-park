# Open-slat roofs cover the declared pedestrian route network. Gaps preserve diffuse shade.
# Fine-mist pipes/nozzles are physical geometry; water hygiene/flow, supports and wind response remain unengineered.
route_registry=[];shade=Batch('V3 all pedestrian pergolas and mist pipes','V3_PERGOLAS');pathbatch=Batch('V3 connecting pedestrian paths','V3_PERGOLAS')
def pergola_route(pid,points,width=8,height=5.4,make_path=False):
    pts=[Vector(at(p))for p in points];total=0;modules=0
    for aa,bb in zip(pts[:-1],pts[1:]):
        delta=bb-aa;length=delta.length
        if length<.1:continue
        total+=length;fwd=delta.normalized();side=Vector((-fwd.y,fwd.x,0));yaw=math.atan2(fwd.y,fwd.x);num=max(1,math.ceil(length/13.5))
        if make_path:
            vs=[tuple(aa+side*width/2),tuple(aa-side*width/2),tuple(bb-side*width/2),tuple(bb+side*width/2)];pathbatch.plane(vs,.20,'v3_cream')
        for k in range(num):
            c=aa+delta*(k+.5)/num;span=length/num-.28;modules+=1
            for dx in [-span/2,span/2]:
                for dy in [-width/2,width/2]:
                    p=c+fwd*dx+side*dy;shade.box((p.x,p.y,height/2),(.18,.18,height),'v3_gold')
            for dy in [-width/2,width/2]:
                p=c+side*dy;shade.box((p.x,p.y,height),(span+.3,.20,.27),'v3_wood',yaw)
            for i in range(int(span/.68)+1):
                p=c+fwd*(-span/2+i*.68);shade.box((p.x,p.y,height+.18),(.20,width+.6,.20),'v3_wood',yaw)
            for dy in [-width*.32,width*.32]:
                a=c-fwd*span/2+side*dy;b=c+fwd*span/2+side*dy;shade.tube([(a.x,a.y,height-.20),(b.x,b.y,height-.20)],.026,'v3_steel',6)
                for i in range(max(1,int(span/2.1))):
                    p=a+fwd*(.7+i*2.1);shade.cylinder((p.x,p.y,height-.26),.043,.12,'v3_gold',6)
    route_registry.append({'id':pid,'path_source_px':points,'length_m':total,'width_m':width,'clear_height_m':height,'modules':modules,'slat_width_m':.20,'slat_pitch_m':.68,'mist':'fine-mist lines and nozzles concept, not engineered water system'})
pergola_route('CW-main',[(648,395),(619,425),(596,469),(579,516),(580,576),(580,605)],15,5.5)
ride_routes=[[(607,387),(493,380),(378,378),(283,434),(259,529),(308,589),(415,603),(511,562),(560,471),(607,387)],[(295,439),(378,472),(459,472),(518,494)],[(375,380),(378,472),(357,562),(305,590)],[(259,529),(357,562),(451,552),(511,562)]]
for i,ps in enumerate(ride_routes):pergola_route('RIDES-loop-%02d'%i,ps,8 if i==0 else 5.5,5.6)
pergola_route('WATER-arrival',[(667,405),(696,459),(686,511),(690,581),(708,615)],7,5.4)
pergola_route('ARRIVAL-pedestrian',[(444,340),(586,368),(628,384)],4,4.8,True)
pergola_route('WATER-beach-walk',[(686,511),(746,523),(808,540),(866,504),(887,456)],5,4.9,True)
pergola_route('DOME-side-walk',[(558,593),(540,625),(548,656),(580,681),(618,656),(634,625),(610,596)],6,5.2,True)
pergola_route('DOME-event-seating',[(579,606),(579,595)],32,6.8)
shade.finish();pathbatch.finish()
# The1000 existing bay meshes and aisle polygons are untouched. Discrete carport groups float above them.
pc=Batch('V3 parking shade and wayfinding','V3_PARKING');groups={}
for bay in parking['bays']:groups.setdefault(bay['row'],[]).append(bay)
for row,bays in groups.items():
    if row%2:continue
    for k in range(0,len(bays)-7,10):
        group=bays[k:k+9]
        if len(group)<8:continue
        v=Vector(group[0]['xy_m']);last=Vector(group[-1]['xy_m']);center=(v+last)/2;angle=group[0]['angle_rad'];width=(last-v).length+2.7;ca=math.cos(angle);sa=math.sin(angle)
        pc.box((center.x,center.y,3.6),(width,5.4,.18),'v3_ivory',angle)
        for sx in [-width/2+.45,width/2-.45]:
            for sy in [-2.9,2.9]:
                x=center.x+sx*ca-sy*sa;y=center.y+sx*sa+sy*ca;pc.cylinder((x,y,1.8),.10,3.6,'v3_steel',8)
# The existing roundabout and approach corridor receive legible curb/light/wayfinding details.
rv=xy(945,383)
for i in range(18):
    t=i*math.tau/18;pc.cylinder((rv.x+19*math.cos(t),rv.y+19*math.sin(t),.5),.8,1.0,'v3_green',10)
pc.cylinder((rv.x,rv.y,1.0),7,2,'v3_cream',40);pc.cylinder((rv.x,rv.y,5.3),1.1,8.6,'v3_gold',12)
for p in [(972,364),(922,352),(870,344),(813,332),(763,324),(704,314)]:
    u=xy(*p);pc.cylinder((u.x,u.y,4),.11,8,'v3_steel',8);pc.box((u.x,u.y,8.1),(1.4,.6,.18),'v3_ivory')
for p in [(907,376),(957,368)]:
    u=xy(*p);pc.box((u.x,u.y,2),(1.2,.5,4),'v3_blue');pc.box((u.x,u.y,3.6),(9,.45,2),'v3_turquoise')
pc.finish()
# A few render-only fine mist volumes illustrate the seasonal atmosphere. No precipitation sheets.
vm=bpy.data.materials.new('V3 fine mist presentation only');vm.use_nodes=True;nt=vm.node_tree;nt.nodes.clear();out=nt.nodes.new('ShaderNodeOutputMaterial');vol=nt.nodes.new('ShaderNodeVolumePrincipled');vol.inputs['Color'].default_value=(.82,.92,1,1);vol.inputs['Density'].default_value=.007;nt.links.new(vol.outputs['Volume'],out.inputs['Volume'])
for i,p in enumerate([(615,433),(582,504),(580,551),(329,416),(455,554),(694,496)]):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=8,location=at(p,3.7));ob=bpy.context.object;ob.name='V3 MIST presentation %02d'%i;ob.scale=(7,12,1.2);ob.data.materials.append(vm)
    for c in list(ob.users_collection):c.objects.unlink(ob)
    collection('V3_MIST_RENDER_ONLY').objects.link(ob)