# Landmark wheel: independent authored geometry at exactly90m overall, not a rescaled supplied50m wheel.
w=Batch('V3 observation wheel90m','V3_RIDES');q=xy(270,555);cx,cy=q.x,q.y;hub=46.2;radius=42
w.box((cx,cy,.25),(64,28,.5),'v3_cream');w.box((cx,cy+8,2),(36,12,4),'v3_ivory')
for y in [-3.1,3.1]:
    for r in [radius,radius-1.1]:w.tube([(cx+r*math.cos(i*math.tau/180),cy+y,hub+r*math.sin(i*math.tau/180))for i in range(181)],.28,'v3_trim',8)
    for i in range(36):
        a=i*math.tau/36;w.beam((cx,cy+y,hub),(cx+radius*math.cos(a),cy+y,hub+radius*math.sin(a)),.12,'v3_trim')
    for dx in [-18,18]:w.beam((cx+dx,cy+(-10 if y<0 else 10),.5),(cx,cy+y,hub),1.0,'v3_trim')
w.tube([(cx,cy-6,hub),(cx,cy+6,hub)],2.1,'v3_gold',20)
for i in range(36):
    a=i*math.tau/36;x=cx+radius*math.cos(a);z=hub+radius*math.sin(a)
    w.box((x,cy,z-.6),(3.5,3.8,2.4),'v3_turquoise');w.box((x,cy,z+.2),(3.3,3.81,2.35),'v3_glass')
    w.box((x,cy,z+1.7),(3.65,3.95,.2),'v3_trim');w.box((x,cy,z-1.65),(3.65,3.95,.3),'v3_trim')
    for dx in [-1.65,1.65]:
        for dy in [-1.82,1.82]:w.box((x+dx,cy+dy,z),(.12,.12,3.4),'v3_trim')
    for yy in [-3.1,3.1]:w.beam((x,cy+yy,z),(x,cy+(1.9 if yy>0 else-1.9),z),.13,'v3_gold')
w.finish()
# Grand coaster is a visible concept layout; no dynamic/safety claims and no concealed DWG stand-in.
c=xy(359,451)
control=[(-128,-68,5),(-100,-72,5),(-30,-73,60),(102,-56,7),(143,-5,12),(108,68,43),(20,87,9),(-85,75,33),(-135,27,7),(-119,-15,21)]
coaster_points=smooth_closed([(c.x+x,c.y+y,z)for x,y,z in control],32)
coaster_track_length=sum((Vector(b)-Vector(a)).length for a,b in zip(coaster_points[:-1],coaster_points[1:]))
co=Batch('V3 grand coaster concept','V3_RIDES');rails=[[],[]];spine=[]
for i,p in enumerate(coaster_points):
    v=Vector(p);a=Vector(coaster_points[max(i-1,0)]);b=Vector(coaster_points[min(i+1,len(coaster_points)-1)]);t=(b-a).normalized();side=Vector((-t.y,t.x,0)).normalized()
    for k,sign in enumerate([-1,1]):rails[k].append(tuple(v+side*.8*sign))
    spine.append((v.x,v.y,v.z-.8))
    if i%3==0:co.beam(tuple(v-side*.9),tuple(v+side*.9),.12,'v3_trim');co.beam((v.x,v.y,v.z-.8),tuple(v+side*.8),.09,'v3_trim')
    if i%13==0:
        height=v.z-1
        for sign in [-1,1]:
            foot=v+side*(4+height*.12)*sign;co.beam((foot.x,foot.y,.3),(v.x,v.y,v.z-1),.35,'v3_blue');co.box((foot.x,foot.y,.25),(3,3,.5),'v3_ivory')
for rail in rails:co.tube(rail,.24,'v3_coral',8)
co.tube(spine,.48,'v3_coral',8)
# Station and visible train indicate programme, not a certified operating system.
station=Vector(coaster_points[4]);co.box((station.x,station.y,1.2),(37,15,2.4),'v3_cream');co.box((station.x,station.y,8),(39,17,.5),'v3_blue')
for dx in [-16,16]:
    for dy in [-6,6]:co.box((station.x+dx,station.y+dy,4.5),(.35,.35,7),'v3_trim')
for j in range(8):
    i=42+j*2;v=Vector(coaster_points[i]);t=(Vector(coaster_points[i+1])-v).normalized();ang=math.atan2(t.y,t.x);co.box((v.x,v.y,v.z+.6),(2.9,1.9,1.0),'v3_yellow',ang)
    for sd in [-.52,.52]:co.box((v.x,v.y+sd,v.z+1.4),(1.4,.65,.8),'v3_dark',ang)
co.finish()
# Two additional authored family carousel forms; retained supplied rides remain separate.
cb=Batch('V3 family carousels','V3_RIDES')
for j,p in enumerate([(407,550),(479,377)]):
    v=xy(*p);r=13 if j==0 else 10;cb.cylinder((v.x,v.y,.4),r,.8,'v3_cream',48);cb.cylinder((v.x,v.y,3.5),1.1,7,'v3_gold',16)
    cb.cylinder((v.x,v.y,7),r+1,.4,'v3_trim',48);cb.cylinder((v.x,v.y,9),r+1,3.7,'v3_coral'if j==0 else'v3_turquoise',48,rt=.2)
    for i in range(12):
        a=i*math.tau/12;x=v.x+(r-2.5)*math.cos(a);y=v.y+(r-2.5)*math.sin(a);cb.cylinder((x,y,3.6),.1,6.4,'v3_gold',8);cb.box((x,y,1.5),(1.3,2.0,1),'v3_mint'if i%2 else'v3_ivory',a);cb.box((x,y,2.1),(1.0,.4,.9),'v3_gold',a)
cb.finish()