import sys,json
from pathlib import Path
sys.path.insert(0,sys.argv[1]);from shapely.geometry import Polygon,box,LineString
V4=Path(__file__).resolve().parents[1];ROOT=V4.parents[1];L=json.loads((V4/'layout-reference.json').read_text());M=json.loads((V4/'scene-manifest.json').read_text());V3=json.loads((ROOT/'design/v3/scene-manifest.json').read_text());C=L['image_corners_m']
def xy(px,py):
 u=px/1280;v=py/922;return [C[0][i]*(1-u)*(1-v)+C[1][i]*u*(1-v)+C[2][i]*u*v+C[3][i]*(1-u)*v for i in range(2)]
x,y=xy(422,427);sx,sy,_=M['coaster_source_dimensions_m'];footprint=box(x-sx/2,y-sy/2,x+sx/2,y+sy/2)
rides=next(z for z in L['zones']if z['id']=='rides');poly=Polygon([xy(*p)for p in rides['source_px']]);routes=[]
for r in V3['pergolas']:
 p=LineString([xy(*v)for v in r['path_source_px']]);routes.append({'id':r['id'],'bbox_to_canopy_edge_m':footprint.distance(p)-r['width_m']/2,'bbox_crosses_canopy':footprint.intersects(p.buffer(r['width_m']/2))})
report={'coaster_source_center_px':[422,427],'source_bbox_fits_ride_zone':poly.covers(footprint),'overlap_any_canopy':any(r['bbox_crosses_canopy']for r in routes),'minimum_bbox_to_canopy_edge_m':min(r['bbox_to_canopy_edge_m']for r in routes),'routes':routes,'status':'concept layout check, not supplier operating-envelope or safety clearance'}
(V4/'coaster-fit-validation.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
