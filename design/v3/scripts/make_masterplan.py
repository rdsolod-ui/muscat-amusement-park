from pathlib import Path
import json,math,xml.etree.ElementTree as ET,hashlib
from shapely.geometry import Polygon,MultiPoint,LineString
HERE=Path(__file__).resolve().parent;V3=HERE.parent;ROOT=V3.parents[1]
D=json.loads((V3/'layout-reference.json').read_text(encoding='utf8'));M=json.loads((V3/'scene-manifest.json').read_text(encoding='utf8'));G=json.loads((V3/'plan-geometry.json').read_text(encoding='utf8'));P=json.loads((V3/'parking-reference.json').read_text(encoding='utf8'));C=D['image_corners_m'];zones={z['id']:z for z in D['zones']}
def px(point):
 x,y=point[:2];ax,ay=C[0];bx,by=C[1][0]-ax,C[1][1]-ay;cx,cy=C[3][0]-ax,C[3][1]-ay;dx=C[0][0]-C[1][0]+C[2][0]-C[3][0];dy=C[0][1]-C[1][1]+C[2][1]-C[3][1]
 det=bx*cy-by*cx;u=((x-ax)*cy-(y-ay)*cx)/det;v=(bx*(y-ay)-by*(x-ax))/det
 for _ in range(3):
  rx=ax+bx*u+cx*v+dx*u*v-x;ry=ay+by*u+cy*v+dy*u*v-y;ux,uy=bx+dx*v,by+dy*v;vx,vy=cx+dx*u,cy+dy*u;det=ux*vy-uy*vx;u-=(rx*vy-ry*vx)/det;v-=(ux*ry-uy*rx)/det
 return u*1280,v*922
def world(p):
 u=p[0]/1280;v=p[1]/922;return [C[0][j]*(1-u)*(1-v)+C[1][j]*u*(1-v)+C[2][j]*u*v+C[3][j]*(1-u)*v for j in range(2)]
def pts(vs):return' '.join('%.2f,%.2f'%px(p)for p in vs)
def poly(vs,fill,stroke='none',sw=.8,opacity=1):return f'<polygon points="{pts(vs)}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" opacity="{opacity}"/>'
def pline(vs,color,w):return f'<polyline points="{pts(vs)}" fill="none" stroke="{color}" stroke-width="{w}" stroke-linejoin="round" stroke-linecap="round"/>'
s=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="130 180 960 620" width="1920" height="1240" role="img" aria-labelledby="title desc">','<title id="title">المخطط المحدث للمنتزه | Updated park masterplan v3</title>','<desc id="desc">Model-derived v3 plan, with an authored90metre observation wheel, grand coaster, two-storey promenade, hemispherical family venue, wave pool and covered walking routes.1000 parking coordinates and supplied parcel/zones are unchanged. Concept only; no engineering approval.</desc>','<rect x="130" y="180" width="960" height="620" fill="#f5f1e7"/>','<g font-family="Arial, Tahoma, sans-serif" fill="#163b36">','<text x="1056" y="206" text-anchor="start" direction="rtl" unicode-bidi="embed" font-size="24" font-weight="700">المخطط المحدث للمنتزه</text>','<text x="1056" y="229" text-anchor="end" font-size="13">UPDATED CONCEPT MASTERPLAN · V3</text>','</g>']
colors={'parcel':'#d3cbb8','rides':'#dce7bf','water':'#cee7df','city':'#ead9bd','parking':'#a9b4b1','utility':'#c2cbbb'}
for name in ['parcel','rides','water','city','parking','utility']:s.append(poly(zones[name]['xy_m'],colors[name],'#f5f1e7',1.4))
# Exact1000 bay coordinates and dimensions, retained from the baseline geometry register.
for b in P['bays']:
 x,y=b['xy_m'];ca=math.cos(b['angle_rad']);sa=math.sin(b['angle_rad']);vs=[(x+xx*ca-yy*sa,y+xx*sa+yy*ca)for xx,yy in [(-1.35,-2.75),(1.35,-2.75),(1.35,2.75),(-1.35,2.75)]];s.append(poly(vs,'none','#e7ebde',.33))
# Source-derived centre lines and widths of all covered pedestrian routes.
for route in M['pergolas']:
 line=LineString([world(p)for p in route['path_source_px']]);area=line.buffer(route['width_m']/2,cap_style='flat',join_style='mitre')
 for part in [area]if area.geom_type=='Polygon'else area.geoms:
  rings=[part.exterior]+list(part.interiors);path=' '.join('M'+' L'.join('%.2f,%.2f'%px(p)for p in ring.coords)+' Z'for ring in rings);s.append(f'<path d="{path}" fill="#be9863" stroke="#92724e" stroke-width=".3" fill-rule="evenodd" opacity=".85"/>')
# Actual projected hulls for the wheel, dome and entrance — no invented footprint circles.
for name,color in [('V3 observation wheel90m','#3e767e'),('V3 dome family venue','#f5e8c9'),('V3 arrival arch','#376467')]:
 h=MultiPoint(G[name]['vertices_xy_m']).convex_hull;s.append(poly(list(h.exterior.coords),color,'#366264',1))
# Coaster track uses the exact authored centreline exported from the3D build.
s.append(pline(M['coaster']['centerline_xyz_m'],'#b95136',3.2))
for b in M['new_buildings']:s.append(poly(b['footprint_xy_m'],'#cfaa78','#6d5d48',.9))
# Actual water/beach faces from the scene. Roofs and microscopic furniture are omitted for readability.
water=G['V3 wave pool and beach'];palette={'v3_water':'#49adb5','v3_sand':'#e0c998','v3_ivory':'#f0e9d5'}
for face in water['faces']:
 vs=[water['vertices_xy_m'][i]for i in face['v']];area=Polygon(vs).area
 if face['mat']in palette and area>110:s.append(poly(vs,palette[face['mat']],'#f4f0e5',.6))
# Actual upward platform/canopy faces, exported by the native scene read-back.
for name,g in G.items():
 if 'visitor platform' in name or name=='V3 family carousels':
  for face in g['faces']:
   vs=[g['vertices_xy_m'][i]for i in face['v']]
   if Polygon(vs).area>20:s.append(poly(vs,'#d8a46d','#865d3c',1))
s.append(poly(zones['parcel']['xy_m'],'none','#c55745',3))
def label(x,y,ar,en,w=154,sz=20):
 s.append(f'<g font-family="Arial, Tahoma, sans-serif" text-anchor="middle" fill="#163b36"><rect x="{x-w/2}" y="{y-22}" width="{w}" height="47" rx="5" fill="#f5f1e7" fill-opacity=".92"/><text x="{x}" y="{y}" font-size="{sz}" font-weight="700" direction="rtl" unicode-bidi="embed">{ar}</text><text x="{x}" y="{y+18}" font-size="12">{en}</text></g>')
label(749,345,'١٠٠٠ موقف سيارة','1,000 parking spaces',175,21)
label(334,403,'قطار الملاهي الكبير','Grand coaster',165,22)
label(297,589,'عجلة بارتفاع ٩٠ م','90 m observation wheel',183,21)
label(566,493,'واجهات من طابقين','Two-storey promenade',159,20)
label(794,478,'حوض الأمواج','Wave pool + beach club',167,23)
label(596,718,'قبة العائلة','Laser tag + performance venue',198,20)
label(916,369,'الوصول','Arrival',90,15)
label(258,350,'خدمات','Services',81,15)
s+=['<g font-family="Arial, Tahoma, sans-serif" fill="#45655b" text-anchor="middle">','<path d="M1047 275L1039 299L1047 294L1055 299Z" fill="#173d37"/><path d="M1047 291V331" stroke="#173d37" stroke-width="2"/><text x="1047" y="265" font-size="14">N</text>','<path d="M170 741H1054" stroke="#bdc9ba"/>','<text x="610" y="762" font-size="16" direction="rtl" unicode-bidi="embed">مسارات مظللة ببرجولات ورذاذ دقيق · تصور يحتاج إلى المسح والدراسات الهندسية</text>','<text x="610" y="784" font-size="12">Model-derived concept · Shaded walking routes with fine mist · Survey, hydrology and engineering unverified.</text>','</g></svg>']
svg='\n'.join(s);ET.fromstring(svg);target=ROOT/'public/media/masterplan-v3.svg';target.write_text(svg,encoding='utf8');(V3/'masterplan-v3.svg').write_text(svg,encoding='utf8')
report={'revision':'v3','file':'public/media/masterplan-v3.svg','sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'basis':'scene-manifest.json,plan-geometry.json and locked parking-reference.json','bay_count':len(P['bays']),'geometry_coordinates':'inverse of the same source-pixel to local-metre mapping used by Blender','wheel_height_m':M['wheel']['total_height_m'],'external_images':0,'xml_valid':True};(V3/'masterplan-validation.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))