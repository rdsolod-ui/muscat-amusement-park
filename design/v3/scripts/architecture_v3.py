# Dream Island is a visual reference only: narrow paired façades, shopfronts, upper arches, pilasters and cornices.
# All geometry here is original, two storeys; no reference photograph is used as a texture.
a=Batch('V3 two-storey promenade facades','V3_CITY_WALK');furn=Batch('V3 cafe verandas and furniture','V3_CITY_WALK');building_program=[]
walk_pixels=[(648,380),(619,425),(596,469),(579,516),(580,576),(580,620)]
walk_world=[xy(*p)for p in walk_pixels]
def point_toward_walk(v):return min(walk_world,key=lambda p:(p-v).length)
def pavilion(pid,p,width,depth,index,program='retail and cafe',facing=None):
    v=xy(*p);face=(Vector(facing)-v).normalized()if facing else(point_toward_walk(v)-v).normalized();yaw=math.atan2(face.y,face.x)+math.pi/2
    def L(x,y,z):return(v.x+x*math.cos(yaw)-y*math.sin(yaw),v.y+x*math.sin(yaw)+y*math.cos(yaw),z)
    def box(x,y,z,w,d,h,ma):a.box(L(x,y,z),(w,d,h),ma,yaw)
    palette=['v3_cream','v3_mint','v3_peach','v3_sage','v3_ivory'];color=palette[index%len(palette)];height=10.6
    box(0,0,height/2+.2,width,depth,height,color)
    for z,ext,h in [(.5,.5,.6),(5.15,.55,.38),(10.4,.9,.55),(10.9,1.1,.22)]:box(0,0,z,width+ext,depth+ext,h,'v3_trim')
    for x in [-width/2+.25,width/2-.25]:box(x,-depth/2-.18,5.35,.6,.55,10.1,'v3_trim')
    bays=max(3,int(width/5.0));pitch=width/bays
    for i in range(bays):
        x=-width/2+pitch*(i+.5);ww=min(3.5,pitch-1.1)
        box(x,-depth/2-.06,2.7,ww,.14,3.55,'v3_glass')
        for dx in [-ww/2,ww/2]:box(x+dx,-depth/2-.17,2.7,.14,.22,3.7,'v3_gold')
        box(x,-depth/2-.17,2.5,ww,.22,.12,'v3_gold')
        # Upper arched window, with an independent molding arch and sill.
        pts=[L(x-ww/2,-depth/2-.13,6.25),L(x+ww/2,-depth/2-.13,6.25)]+[L(x+ww/2*math.cos(j*math.pi/20),-depth/2-.13,7.6+ww/2*math.sin(j*math.pi/20))for j in range(21)]
        a.add(pts,[tuple(range(len(pts)))],'v3_glass');a.tube([L(x+ww/2*math.cos(j*math.pi/24),-depth/2-.3,7.6+ww/2*math.sin(j*math.pi/24))for j in range(25)],.14,'v3_trim',6)
        for dx in [-ww/2,ww/2]:box(x+dx,-depth/2-.3,6.95,.26,.3,1.5,'v3_trim')
        box(x,-depth/2-.33,6.12,ww+.55,.6,.24,'v3_trim');box(x,-depth/2-.16,7.4,.12,.16,2.6,'v3_gold')
        # Small upper balcony in the middle bay.
        if i==bays//2:
            box(x,-depth/2-1.1,5.7,ww+1.4,2,.24,'v3_trim')
            for k in range(9):a.cylinder(L(x-ww/2-.5+k*(ww+1)/8,-depth/2-2.0,6.23),.055,1.05,'v3_gold',6)
            a.tube([L(x-ww/2-.5,-depth/2-2,6.75),L(x+ww/2+.5,-depth/2-2,6.75)],.09,'v3_gold',6)
    # Low mansard-like roof with a central stepped gable, kept to two occupied storeys.
    vs=[L(x,y,z)for x,y,z in [(-width/2-.5,-depth/2-.5,11.1),(width/2+.5,-depth/2-.5,11.1),(width/2+.5,depth/2+.5,11.1),(-width/2-.5,depth/2+.5,11.1),(-width/2+2,-depth/2+2,13),(width/2-2,-depth/2+2,13),(width/2-2,depth/2-2,13),(-width/2+2,depth/2-2,13)]]
    a.add(vs,[(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7),(4,5,6,7)],'v3_roof')
    for k in range(3):box(0,-depth/2-.12,11.2+k*.75,6.0-k*1.6,.7,.85,color)
    box(0,-depth/2-.25,13.15,1.8,.95,.35,'v3_trim')
    # Street veranda: visible dining, side posts and a slatted shade roof.
    veranda_d=5.8
    furn.box(L(0,-depth/2-veranda_d/2-.4,.3),(width,veranda_d,.35),'v3_sand',yaw)
    for xx in [-width/2+.4,width/2-.4]:furn.cylinder(L(xx,-depth/2-veranda_d,1.95),.13,3.9,'v3_gold',8)
    for yy in [-depth/2-.2,-depth/2-veranda_d]:furn.box(L(0,yy,3.9),(width+.3,.16,.25),'v3_gold',yaw)
    for k in range(int(width/.6)+1):furn.box(L(-width/2+k*.6,-depth/2-veranda_d/2,4.05),(.18,veranda_d+.6,.18),'v3_wood',yaw)
    for k in range(max(2,int(width/6))):
        xx=-width/2+3+k*6;yy=-depth/2-3
        furn.cylinder(L(xx,yy,1),1.05,.12,'v3_trim',14);furn.cylinder(L(xx,yy,.5),.09,1,'v3_gold',8)
        for dx,dy in [(-1.45,0),(1.45,0),(0,-1.45)]:furn.box(L(xx+dx,yy+dy,.55),(.55,.6,.12),'v3_wood',yaw);furn.box(L(xx+dx,yy+dy+.24,.9),(.55,.08,.7),'v3_wood',yaw)
    building_program.append({'id':pid,'source_px':list(p),'storeys':2,'footprint_m':[width,depth],'footprint_xy_m':[list(L(x,y,0))[:2]for x,y in [(-width/2,-depth/2),(width/2,-depth/2),(width/2,depth/2),(-width/2,depth/2)]],'program':program,'geometry':'authored concept facade','roof_max_m':13.4})
    if 'arcade' in program:
        for k in range(8):
            xx=-width/2+2+k*(width-4)/8;pos=L(xx,-depth/2+.4,1.25);furn.box(pos,(.9,.9,2.2),'v3_blue',yaw);furn.box(L(xx,-depth/2-.08,1.55),(.7,.08,.8),'v3_turquoise',yaw)
    return v,yaw
pavilions=[('P01',(582,420),25,20),('P02',(563,451),28,22),('P03',(646,439),29,23),('P04',(631,470),28,22),('P05',(619,507),27,23),('P06',(619,550),30,23),('P07',(543,505),28,23),('P08',(543,533),28,23),('P09',(543,561),28,23),('F01',(545,593),29,22),('F02',(626,593),29,22)]
for i,(pid,p,ww,dd)in enumerate(pavilions):pavilion(pid,p,ww,dd,i,'family indoor games and retail'if pid in ['P07','P08','P09']else'retail and cafe')
pavilion('ARCADE01',(509,477),32,23,3,'arcade hall',xy(540,471));pavilion('ARCADE02',(446,374),31,21,1,'arcade hall',xy(435,401))
pavilion('WATER_CLUB',(696,587),29,24,4,'beach lounge club and cafe',xy(742,548))
# Functional toilets/changing/entry blocks retained in programme as simple authored service pavilions.
for i,p in enumerate([(570,403),(510,615),(688,441),(724,594),(334,351)]):
    v=xy(*p);a.box((v.x,v.y,2),(13,9,4),'v3_ivory');a.box((v.x,v.y,4.25),(14,10,.5),'v3_blue')
a.finish();furn.finish()
# Hemispherical end-of-promenade family venue with performance forecourt.
d=Batch('V3 dome family venue','V3_DOME');v=xy(580,651);rad=34;d.cylinder((v.x,v.y,.45),rad+3,.9,'v3_cream',72);d.dome((v.x,v.y),rad,.9,'v3_ivory',72,24)
for i in range(24):
    az=i*math.tau/24;d.tube([(v.x+(rad+.15)*math.cos(j*math.pi/2/40)*math.cos(az),v.y+(rad+.15)*math.cos(j*math.pi/2/40)*math.sin(az),.9+(rad+.15)*math.sin(j*math.pi/2/40))for j in range(41)],.17,'v3_gold',6)
# Glazed lower ring and a northern entry portico, leaving the silhouette hemispherical.
for i in range(48):
    az=i*math.tau/48;x=v.x+math.cos(az)*(rad-.2);y=v.y+math.sin(az)*(rad-.2);d.box((x,y,3.1),(4.0,.3,4.6),'v3_glass',az+math.pi/2)
d.box((v.x,v.y+rad-1,3.2),(18,7,6.4),'v3_glass');d.box((v.x,v.y+rad+2.5,6.7),(22,11,.6),'v3_trim')
for xx in [-9,9]:d.box((v.x+xx,v.y+rad+6.5,3.3),(.6,.6,6.6),'v3_gold')
# Concept internal programme volumes and a small external stage are labelled independently from shell.
d.box((v.x-13,v.y,2),(22,26,4),'v3_blue');d.box((v.x+12,v.y,1.4),(20,26,2.8),'v3_wood')
d.finish()
st=Batch('V3 performance forecourt','V3_DOME');sv=xy(579,613);st.box((sv.x,sv.y,.75),(29,16,1.5),'v3_wood');st.box((sv.x,sv.y-6.5,4.1),(27,1,6.7),'v3_blue')
for xx in [-14,14]:st.box((sv.x+xx,sv.y,3.6),(1.4,2,7.2),'v3_dark')
for k in range(4):
    for j in range(12):st.box((sv.x-15+j*2.7,sv.y+13+k*3,.65),(.75,.8,.18),'v3_ivory');st.box((sv.x-15+j*2.7,sv.y+13.4+k*3,1.1),(.75,.12,.75),'v3_ivory')
st.finish()
# Main portal marks the transition from arrival to the shaded family promenade.
e=Batch('V3 arrival arch','V3_ARRIVAL');v=xy(648,381);span=44
for xx in [-span/2,span/2]:e.box((v.x+xx,v.y,6),(3.2,5.5,12),'v3_cream');e.box((v.x+xx,v.y,12.4),(4,6.2,.7),'v3_gold')
for yy in [-2.1,2.1]:e.tube([(v.x+span/2*math.cos(i*math.pi/72),v.y+yy,11+9*math.sin(i*math.pi/72))for i in range(73)],.85,'v3_trim',10)
for i in range(36):
    t=i*math.pi/35;x=v.x+span/2*math.cos(t);z=11+9*math.sin(t);e.beam((x,v.y-2.1,z),(x,v.y+2.1,z),.12,'v3_gold')
e.box((v.x,v.y,16),(24,1.2,1.9),'v3_blue');e.finish();label('V3 park entry lettering','MUSCAT FAMILY PARK',(v.x,v.y-1,15.7),1.35,0,'v3_trim')