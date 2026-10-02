"""Estimate source-design -> Google mapping; input imagery is unchanged."""
import cv2, json, argparse, numpy as np
from pathlib import Path
ROOT=Path(__file__).resolve().parent
parser=argparse.ArgumentParser()
parser.add_argument('--design-reference', required=True, type=Path)
parser.add_argument('--google-capture', required=True, type=Path)
args=parser.parse_args()
SOURCE=args.design_reference
GOOGLE=args.google_capture
a=cv2.imdecode(np.fromfile(SOURCE,np.uint8),cv2.IMREAD_GRAYSCALE)
b=cv2.imdecode(np.fromfile(GOOGLE,np.uint8),cv2.IMREAD_GRAYSCALE)
mask_a=np.full(a.shape,255,np.uint8)
manifest=json.loads((ROOT/'site-coordinate-manifest.json').read_text('utf-8-sig'))
cv2.fillPoly(mask_a,[np.asarray(manifest['parcel']['source_px'],np.int32)],0)
mask_b=np.full(b.shape,255,np.uint8)
mask_b[:64,:]=0
mask_b[:,:73]=0
mask_b[675:,:]=0
mask_b[605:,73:180]=0
sift=cv2.SIFT_create(nfeatures=8000)
ka,da=sift.detectAndCompute(a,mask_a)
kb,db=sift.detectAndCompute(b,mask_b)
matches=cv2.BFMatcher().knnMatch(da,db,k=2)
good=[m for m,n in matches if m.distance < .71*n.distance]
pa=np.float32([ka[m.queryIdx].pt for m in good])
pb=np.float32([kb[m.trainIdx].pt for m in good])
H,inlier=cv2.findHomography(pa,pb,cv2.RANSAC,3)
pick=inlier.ravel().astype(bool)
pred=cv2.perspectiveTransform(pa[:,None,:],H)[:,0,:]
errors=np.linalg.norm(pred-pb,axis=1)
result={'source_size':[a.shape[1],a.shape[0]],'target_size':[b.shape[1],b.shape[0]],'mapping':'original design pixels to unmodified Google screenshot pixels','method':'SIFT descriptor matches, 0.71 ratio test, homography RANSAC 3 px','candidate_matches':len(good),'inliers':int(pick.sum()),'inlier_rmse_px':float(np.sqrt(np.mean(errors[pick]**2))),'homography':H.tolist(),'inlier_pairs':[{'source_px':p.tolist(),'google_px':q.tolist(),'residual_px':float(e)} for p,q,e,ok in zip(pa,pb,errors,pick) if ok],'status':'image alignment only; not surveyed or cadastral accuracy'}
(ROOT/'google-registration.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in result.items() if k!='inlier_pairs'},indent=2))
