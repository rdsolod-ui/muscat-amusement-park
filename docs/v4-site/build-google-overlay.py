import json, base64, shutil, hashlib, math, html
from pathlib import Path
import numpy as np
ROOT=Path(__file__).resolve().parent
PUBLIC=ROOT.parent.parent/'public'/'media'/'v4'
PUBLIC.mkdir(parents=True,exist_ok=True)
source=PUBLIC/'google-site-source.jpg'
m=json.loads((ROOT/'site-coordinate-manifest.json').read_text('utf-8-sig'))
r=json.loads((ROOT/'google-registration.json').read_text('utf-8'))
H=np.array(r['homography'])
VB=[210,100,992,620]
def pt(p):
 q=H@np.array([p[0],p[1],1.]);return [round(float(q[0]/q[2]),3),round(float(q[1]/q[2]),3)]
def pointstr(points):return ' '.join(','.join(str(x) for x in pt(p)) for p in points)
def norm(p):return [round((p[0]-VB[0])/VB[2],6),round((p[1]-VB[1])/VB[3],6)]
svg=['<svg xmlns="http://www.w3.org/2000/svg" width="1587.2" height="992" viewBox="210 100 992 620" role="img" aria-labelledby="title desc">', '<title id="title">Muscat Amusement Park — Google satellite concept zoning</title>', '<desc id="desc">Original concept zones registered to a Google Maps satellite screenshot. Existing northeast junction connects by a proposed approach to the proposed internal roundabout and parking. Indicative concept boundaries, not a cadastral survey. Source areas are design labels.</desc>', '<defs><filter id="shadow"><feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000" flood-opacity=".55"/></filter></defs>']
svg.append('<image x="0" y="0" width="1280" height="720" href="data:image/jpeg;base64,'+base64.b64encode(source.read_bytes()).decode()+'"/>')
svg.append('<g stroke="#fdf8e9" stroke-width="1.9" stroke-linejoin="round">')
for z in m['zones']:
 z['google_px']=[pt(p) for p in z['source_px']]
 svg.append(f'<polygon id="zone-{z["id"]}" points="{pointstr(z["source_px"])}" fill="{z["color"]}" fill-opacity=".66"/>')
svg.append('</g>')
svg.append(f'<polygon points="{pointstr(m["parcel"]["source_px"])}" fill="none" stroke="#fa554e" stroke-width="3.6" stroke-linejoin="round"/>')
for road in m['roads']:
 road['google_px']=[pt(p['source_px']) for p in road['points']]
 pts=pointstr([p['source_px'] for p in road['points']])
 svg.append(f'<polyline points="{pts}" fill="none" stroke="#f7f0cc" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>')
 svg.append(f'<polyline points="{pts}" fill="none" stroke="#b98e36" stroke-width="6.2" stroke-linecap="round" stroke-linejoin="round"/>')
ring=[(945+23*math.cos(math.tau*i/72),383+23*math.sin(math.tau*i/72)) for i in range(73)]
svg.append(f'<polyline points="{pointstr(ring)}" fill="none" stroke="#f7f0cc" stroke-width="10"/>')
svg.append(f'<polyline points="{pointstr(ring)}" fill="none" stroke="#b98e36" stroke-width="6.2"/>')
# Existing imagery road remains visible, with a subtle location ring.
jx,jy=pt([1035,164]);svg.append(f'<circle cx="{jx}" cy="{jy}" r="16" fill="none" stroke="#f9f4dd" stroke-width="2"/>')
svg.append('<g font-family="Arial, sans-serif" text-anchor="middle">')
def label(x,y,ar,en,extra=None,size=24):
 svg.append(f'<text x="{x}" y="{y}" font-size="{size}" font-weight="700" fill="#123435" direction="rtl">{html.escape(ar)}</text>')
 svg.append(f'<text x="{x}" y="{y+21}" font-size="15.5" font-weight="600" fill="#123435">{html.escape(en)}</text>')
 if extra:svg.append(f'<text x="{x}" y="{y+41}" font-size="16" fill="#123435">{html.escape(extra)}</text>')
label(521,356,'حديقة الألعاب','Amusement park','17.5 ha')
label(791,373,'الحديقة المائية','Water park','9 ha')
# Clear callouts avoid overcrowding the narrow promenade, parking and service polygons.
svg.append('<g fill="none" stroke="#f6ead2" stroke-width="1.6"><path d="M659 413 L659 545 L654 553"/><path d="M451 284 L383 281 L353 309"/><path d="M746 263 L745 205"/></g>')
# Translucent type backing is a map annotation, not an image card.
for x,y,w,h in [(576,549,160,74),(271,302,167,75),(648,161,195,70)]:
 svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="7" fill="#f7efda" fill-opacity=".9"/>')
label(656,574,'سيتي ووك','City Walk · 5 ha',None,24)
label(354,327,'الخدمات الفنية','Technical area · 1.5 ha',None,21)
label(746,187,'مواقف السيارات','Parking · 4 ha',None,23)
svg.append(f'<path d="M{jx+19} {jy} L1022 161" fill="none" stroke="#fff7db" stroke-width="1.5"/>')
svg.append('<text x="1086" y="155" font-size="20" fill="#fff7db" font-weight="700" direction="rtl" filter="url(#shadow)">التقاطع القائم</text><text x="1086" y="174" font-size="13" fill="#fff7db" filter="url(#shadow)">Existing junction</text>')
svg.append('<text x="979" y="241" font-size="18" fill="#fff7db" font-weight="700" direction="rtl" filter="url(#shadow)">مدخل مقترح</text><text x="979" y="259" font-size="12" fill="#fff7db" filter="url(#shadow)">Proposed access</text>')
svg.append('</g>')
svg.append('<g font-family="Arial, sans-serif" fill="#fff7df" filter="url(#shadow)"><text x="875" y="635" text-anchor="middle" direction="rtl" font-size="18">حدود تخطيطية أولية — المساحات من المخطط الأصلي</text><text x="1174" y="656" text-anchor="end" font-size="13">Indicative concept boundary · source area labels · access subject to approval</text></g>')
svg.append('</svg>')
(PUBLIC/'google-site.svg').write_text('\n'.join(svg)+'\n',encoding='utf-8')
for p in m['pins']:
 p['google_px']=pt(p['source_px']);p['google_normalized']=norm(p['google_px'])
for f in m['features']:f['google_px']=pt(f['source_px'])
m['status']='Google satellite image alignment and annotated first frame complete; official parcel boundary unverified'
m['google_capture']={'status':'received and registered','public_source':'media/v4/google-site-source.jpg','public_annotated_frame':'media/v4/google-site.svg','sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'captured_date':'2026-10-02','url':'https://www.google.com/maps/@23.6430465,58.1762916,1574m/data=!3m1!1e3','native_size_px':[1280,720],'display_viewbox':VB,'display_aspect':1.6,'attribution_text':'Google Maps; Imagery © Airbus, CNES / Airbus, Maxar Technologies, 2026; Map data © 2026','attribution_policy':'Original source JPEG unchanged. Display crop retains original Google logo and provider credit line; do not fade or mask lower attribution strip.','registration':{'method':r['method'],'inliers':r['inliers'],'inlier_rmse_px':r['inlier_rmse_px'],'homography':r['homography']},'accuracy':'Good image registration is not cadastral or engineering accuracy.'}
m['recommended_framing']['status']='Model framing contract; Google frame has separate display_viewbox'
(ROOT/'site-coordinate-manifest.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
pins={'frame':'media/v4/google-site.svg','aspect_ratio':1.6,'viewbox':VB,'position_units':'normalized [0,1] from top-left of displayed SVG; each point is the pin tip','pins':{p['id']:{'position':p['google_normalized'],'source_px':p['source_px'],'world_xy_m':p['local_utm_m'],'title_ar':p['title_ar'],'title_en':p['title_en']} for p in m['pins']},'road':{'existing_junction':norm(pt([1035,164])),'proposed_arrival_roundabout':norm(pt([945,383]))},'other_frames':'Use the model camera-projected coordinates exported by the Blender agent. Do not reuse Google screen positions on an oblique render.'}
(PUBLIC/'google-site-pins.json').write_text(json.dumps(pins,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(pins,ensure_ascii=True,indent=2))
