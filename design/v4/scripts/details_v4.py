# Architectural detail over the retained two-storey v3 footprint register.
a=Batch('V4 facade mouldings shopfronts and balconies','V4_CITY');f=Batch('V4 cafe furniture planters and streetlights','V4_CITY')
for i,b in enumerate(V3['new_buildings']):
 c=xy(*b['source_px']);ww,dd=b['footprint_m'];pts=b['footprint_xy_m'];yaw=math.atan2(pts[1][1]-pts[0][1],pts[1][0]-pts[0][0]);co,si=math.cos(yaw),math.sin(yaw)
 def L(x,y,z):return(c.x+x*co-y*si,c.y+x*si+y*co,z)
 def box(x,y,z,w,d,h,mat):a.box(L(x,y,z),(w,d,h),mat,yaw)
 # Recessed portals, capitals, keystones, wall lights and striped shop awnings.
 for k in range(max(3,int(ww/5))):
  x=-ww/2+ww/max(3,int(ww/5))*(k+.5);w=min(3.5,ww/max(3,int(ww/5))-1)
  for dx in [-w/2-.3,w/2+.3]:
   box(x+dx,-dd/2-.38,.65,.42,.42,.8,'v3_trim');box(x+dx,-dd/2-.3,4.45,.5,.5,.35,'v3_trim');box(x+dx,-dd/2-.42,7.2,.28,.35,2.4,'v3_trim')
  box(x,-dd/2-.47,9.25,.4,.65,.55,'v3_gold');box(x,-dd/2-.38,4.72,w+1,.4,.33,'v3_blue')
  for j in range(9):box(x-w/2+(j+.5)*w/9,-dd/2-.95,4.05,w/9,1.9,.15,'v3_cream'if j%2 else'v3_coral')
  # Ground-floor glazing mullions, doors and visible seating behind glass.
  box(x,-dd/2-.30,2.2,.08,.08,3,'v3_gold');box(x-.22,-dd/2-.4,1.8,.05,.05,.4,'v3_gold')
  for dx in [-w/2-.58,w/2+.58]:
   a.beam(L(x+dx,-dd/2-.28,3.25),L(x+dx,-dd/2-.75,3.25),.045,'v3_dark');a.box(L(x+dx,-dd/2-.76,3.45),(.21,.21,.48),'v3_gold',yaw)
 # Side pilasters and roof finials keep the silhouettes richer without adding occupied storeys.
 for side in [-1,1]:
  for k in range(4):box(side*(ww/2+.16),-dd/2+dd*(k+.5)/4,5.1,.32,.5,9.7,'v3_trim')
  a.cylinder(L(side*(ww/2-.1),-dd/2,11.6),.36,1.2,'v3_gold',10)
 # Cafe terrace rails leave central pedestrian access; independent table/chair legs.
 for x in [-ww/2+2,ww/2-2]:
  f.box(L(x,-dd/2-5.7,.6),(3.5,.6,1.2),'v3_cream',yaw)
  for j in range(5):f.cylinder(L(x-1.4+j*.7,-dd/2-5.7,1.3),.34,.75,'v3_green',7)
 for k in range(max(2,int(ww/6))):
  xx=-ww/2+3+k*6;yy=-dd/2-3
  for dx,dy in [(-1.45,0),(1.45,0),(0,-1.45)]:
   for lx in [-.21,.21]:
    for ly in [-.21,.21]:f.cylinder(L(xx+dx+lx,yy+dy+ly,.27),.03,.54,'v3_dark',5)
 # Named signage plaques: geometric letters are authored using the built-in font.
 title='ARCADE'if'arcade'in b['program']else'BEACH CLUB'if'beach'in b['program']else('MAP CAFE'if i%3==0 else'FAMILY & FRIENDS')
 ob=label('V4 sign '+b['id'],title,L(0,-dd/2-.52,4.59),.46,yaw,'v3_trim','V4_SIGNAGE')
a.finish();f.finish()
# More legible arrival architecture: ticket/support pavilions, columned loggia and gates.
e=Batch('V4 entrance loggia ticketing and gates','V4_ENTRANCE');v=xy(648,381)
for sign in [-1,1]:
 x=v.x+sign*39;e.box((x,v.y,2.7),(22,11,5.4),'v3_cream');e.box((x,v.y,5.65),(24,13,.45),'v3_trim')
 for k in [-7,0,7]:
  e.box((x+k,v.y-5.62,2.6),(4.4,.2,3.2),'v3_glass');e.cylinder((x+k,v.y-7,2.5),.26,5,'v3_trim',12);e.box((x+k,v.y-7,5.1),(.9,.9,.4),'v3_gold')
 e.box((x,v.y-6,5.45),(23,4,.4),'v3_ivory')
 for j in range(7):e.box((x-10+j*3.3,v.y-6,5.85),(.55,4,.18),'v3_gold')
 for k in [-8,8]:e.box((x+k,v.y-10,.5),(3,2,1),'v3_cream');e.cylinder((x+k,v.y-10,1.1),.8,1,'v3_green',9)
for k in range(8):
 x=v.x-15+k*4.2;e.box((x,v.y+5,.6),(.35,2,1.2),'v3_steel');e.beam((x,v.y+5,1),(x+1.2,v.y+5,1),.035,'v3_gold')
for k in range(10):e.cylinder((v.x-20+k*4.4,v.y-10,.55),.12,1.1,'v3_gold',8)
e.finish();remove_object('V3 park entry lettering');label('V4 MAP entrance identity','MUSCAT AMUSEMENT PARK',(v.x,v.y-1,15.65),.92,0,'v3_trim','V4_SIGNAGE')
# Panel joints, lanterns and entry doors give the hemisphere a readable architectural scale.
d=Batch('V4 dome panel joints and entry details','V4_DOME');v=xy(580,651);rad=34
for elevation in [5,10,16,22,28]:
 rr=math.sqrt(rad*rad-(elevation-.9)**2)+.1;d.tube([(v.x+rr*math.cos(i*math.tau/96),v.y+rr*math.sin(i*math.tau/96),elevation)for i in range(97)],.09,'v3_gold',5)
for i in range(48):
 az=i*math.tau/48
 for z in [1,5.45]:d.box((v.x+33.8*math.cos(az),v.y+33.8*math.sin(az),z),(4.1,.3,.12),'v3_trim',az+math.pi/2)
for x in [-6,-3,0,3,6]:
 d.box((v.x+x,v.y+37,2.8),(2.5,.2,4.3),'v3_glass');d.box((v.x+x,v.y+37.2,2.6),(.08,.1,4.3),'v3_gold')
for x in [-11,11]:d.cylinder((v.x+x,v.y+40,1),.5,2,'v3_gold',10)
d.finish();label('V4 dome venue identity','MAP DOME',(v.x,v.y+37.35,5.7),.72,math.pi,'v3_trim','V4_SIGNAGE')
# Route-level furniture and fine-mist fixtures supplement the existing open louvres.
a=Batch('V4 promenade ground detail and mist fittings','V4_CITY')
for i in range(17):
 p=(591-i*.6,455+i*8.7);v=xy(*p)
 for side in [-1,1]:
  x=v.x+side*11;a.cylinder((x,v.y,2.6),.075,5.2,'v3_gold',7);a.box((x,v.y,5.25),(.85,.6,.18),'v3_trim')
 if i%3==0:
  a.box((v.x-12,v.y,.6),(3.8,1,.25),'v3_wood');a.box((v.x-12,v.y+.4,1.05),(3.8,.12,.8),'v3_wood')
 for side in [-1,1]:a.cylinder((v.x+side*7,v.y,5.12),.05,.18,'v3_steel',6)
a.finish()
