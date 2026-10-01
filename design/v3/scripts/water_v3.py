# Wave pool, beach and deck are presentation geometry, with visible wave crests rather than a fluid/safety simulation.
pool=Batch('V3 wave pool and beach','V3_WATER');v=xy(789,464)
outline=[(-83,-59),(-99,-22),(-88,25),(-51,54),(51,54),(88,25),(99,-22),(83,-59)]
pool.plane([(v.x+x*1.07,v.y+y*1.12)for x,y in outline],.27,'v3_ivory');pool.plane([(v.x+x,v.y+y)for x,y in outline],.38,'v3_water')
# The rear wave-machine wall indicates function, without claiming equipment, water demand or engineering.
pool.box((v.x,v.y+56,2.7),(103,8,5.4),'v3_cream');pool.box((v.x,v.y+56,5.6),(106,10,.6),'v3_roof')
for yy,amp in [(25,1.5),(2,1.1),(-23,.65)]:
    pts=[(v.x+x,v.y+yy+3.5*math.cos(x/78*math.pi/2),.45+amp*math.sin((x+78)/156*math.pi))for x in [-78+k*156/90 for k in range(91)]]
    pool.tube(pts,.23,'v3_foam',8)
# Sandy beach strip and a shallower lounge pool are deliberately distinct from the wave basin.
pool.plane([(v.x-88,v.y-62),(v.x+87,v.y-62),(v.x+67,v.y-104),(v.x-68,v.y-121)],.31,'v3_sand')
l=xy(720,553);pool.ellipse((l.x,l.y),42,27,.3,'v3_ivory');pool.ellipse((l.x,l.y),38,23,.4,'v3_water')
# Children's splash structure and shallow water.
splash=xy(854,433);pool.ellipse((splash.x,splash.y),32,23,.28,'v3_ivory');pool.ellipse((splash.x,splash.y),28,19,.41,'v3_water')
for dx,dy,h in [(-10,0,3),(7,4,4.5),(0,-8,2.5)]:
    pool.box((splash.x+dx,splash.y+dy,h/2),(4,4,h),'v3_coral');pool.cylinder((splash.x+dx,splash.y+dy,h+.6),3,1.2,'v3_yellow',12,rt=.1)
# Full-height slide towers and six original flume paths, independent of supplied ride files.
sl=xy(708,453);tower_h=27;pool.box((sl.x,sl.y,tower_h/2),(14,14,tower_h),'v3_cream');pool.box((sl.x,sl.y,tower_h+.5),(17,17,1),'v3_turquoise')
for xx in [-8,8]:
    for yy in [-8,8]:pool.cylinder((sl.x+xx,sl.y+yy,tower_h/2),.4,tower_h,'v3_trim',10)
for k,col in enumerate(['v3_yellow','v3_coral','v3_turquoise','v3_trim','v3_mint','v3_peach']):
    pts=[]
    for i in range(110):
        t=i/109;xx=sl.x+25*math.sin(t*math.tau*1.3+k*.18)+t*63;yy=sl.y+18*math.cos(t*math.tau*1.3+k*.25)-t*98;zz=tower_h*(1-t)**.84+.55+k*.09;pts.append((xx,yy,zz))
    pool.tube(pts,1.0 if k<4 else 1.35,col,10)
    for i in range(8,len(pts)-8,18):x,y,z=pts[i];pool.cylinder((x,y,z/2),.24,z,'v3_steel',8)
    x,y,z=pts[-1];pool.box((x,y-10,.43),(3.2,24,.25),'v3_water');pool.box((x-1.8,y-10,.42),(.5,24,.5),'v3_ivory');pool.box((x+1.8,y-10,.42),(.5,24,.5),'v3_ivory')
# Loungers and umbrellas; twin chairs under each umbrella, modelled rather than a flat texture.
for row in range(3):
    for col in range(12):
        x=v.x-71+col*12.5;y=v.y-68-row*12.5
        if row==2 and col>9:continue
        pool.cylinder((x,y,1.6),.055,3.2,'v3_gold',8);pool.cylinder((x,y,3.45),2.9,.6,'v3_ivory'if(col+row)%2 else'v3_cream',20,rt=.05)
        for dx in [-2.1,2.1]:pool.box((x+dx,y-2,.43),(1.0,2.3,.18),'v3_trim');pool.box((x+dx,y-1.2,.72),(1.0,.6,.65),'v3_trim');pool.box((x+dx,y-2.05,.56),(.85,1.7,.15),'v3_cream')
# Individual covered cabanas along the quieter club side.
for i,p in enumerate([(689,519),(684,541),(689,563),(736,590),(765,567)]):
    u=xy(*p);pool.box((u.x,u.y,.4),(9,7,.6),'v3_wood');pool.box((u.x,u.y,4.1),(10,8,.35),'v3_ivory')
    for dx in [-4,4]:
        for dy in [-3,3]:pool.cylinder((u.x+dx,u.y+dy,2.1),.13,4.2,'v3_wood',8)
    for dx in [-2.5,2.5]:pool.box((u.x+dx,u.y,.9),(2.1,3.2,.45),'v3_trim')
pool.finish()