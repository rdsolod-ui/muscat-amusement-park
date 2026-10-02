import bpy, math
from mathutils import Vector

M={}
def material(name,color,rough=.6,metal=0):
    m=bpy.data.materials.get(name) or bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=(*color,1)
    bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*color,1);bs.inputs['Roughness'].default_value=rough;bs.inputs['Metallic'].default_value=metal;M[name]=m;return m

def collection(name):
    c=bpy.data.collections.get(name)
    if c is None:c=bpy.data.collections.new(name);bpy.context.scene.collection.children.link(c)
    return c

def remove_object(name):
    ob=bpy.data.objects.get(name)
    if ob is not None:
        data=ob.data;bpy.data.objects.remove(ob,do_unlink=True)
        if data and data.users==0 and isinstance(data,bpy.types.Mesh):bpy.data.meshes.remove(data)

class Batch:
    def __init__(self,name,col):self.name=name;self.col=col;self.v=[];self.f=[];self.mi=[];self.mats=[]
    def add(self,verts,faces,ma):
        k=len(self.v);self.v.extend([tuple(v)for v in verts]);self.f.extend([tuple(k+i for i in f)for f in faces])
        if ma not in self.mats:self.mats.append(ma)
        self.mi.extend([self.mats.index(ma)]*len(faces))
    def box(self,loc,dim,ma,yaw=0):
        x,y,z=loc;a,b,h=[d/2 for d in dim];c=math.cos(yaw);s=math.sin(yaw)
        v=[(x+u*c-v*s,y+u*s+v*c,z+w)for u,v,w in [(-a,-b,-h),(a,-b,-h),(a,b,-h),(-a,b,-h),(-a,-b,h),(a,-b,h),(a,b,h),(-a,b,h)]]
        self.add(v,[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],ma)
    def cylinder(self,loc,r,h,ma,n=16,rt=None):
        x,y,z=loc;rt=r if rt is None else rt
        v=[(x+math.cos(i*math.tau/n)*rr,y+math.sin(i*math.tau/n)*rr,z+w)for w,rr in [(-h/2,r),(h/2,rt)]for i in range(n)]
        f=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n)for i in range(n)];self.add(v,f,ma)
    def tube(self,pts,r,ma,n=8):
        if len(pts)<2:return
        vs=[]
        for i,p in enumerate(pts):
            t=Vector(pts[min(i+1,len(pts)-1)])-Vector(pts[max(0,i-1)]);t.normalize();a=t.cross(Vector((0,0,1)))
            if a.length<.001:a=Vector((1,0,0))
            a.normalize();b=t.cross(a).normalized();vs.extend([tuple(Vector(p)+r*(a*math.cos(j*math.tau/n)+b*math.sin(j*math.tau/n)))for j in range(n)])
        fs=[(i*n+j,i*n+(j+1)%n,(i+1)*n+(j+1)%n,(i+1)*n+j)for i in range(len(pts)-1)for j in range(n)];self.add(vs,fs,ma)
    def beam(self,a,b,w,ma):self.tube([a,b],w,ma,6)
    def plane(self,pts,z,ma):
        vs=[(p[0],p[1],z)for p in pts];f=tuple(range(len(vs)))
        if len(vs)>2 and (Vector(vs[1])-Vector(vs[0])).cross(Vector(vs[2])-Vector(vs[0])).z<0:f=tuple(reversed(f))
        self.add(vs,[f],ma)
    def ellipse(self,c,rx,ry,z,ma,n=64):self.plane([(c[0]+rx*math.cos(i*math.tau/n),c[1]+ry*math.sin(i*math.tau/n))for i in range(n)],z,ma)
    def dome(self,c,r,z,ma,segments=64,rings=20):
        x,y=c;vs=[]
        for j in range(rings+1):
            a=j*math.pi/2/rings
            for i in range(segments):
                b=i*math.tau/segments;vs.append((x+r*math.cos(a)*math.cos(b),y+r*math.cos(a)*math.sin(b),z+r*math.sin(a)))
        fs=[(j*segments+i,j*segments+(i+1)%segments,(j+1)*segments+(i+1)%segments,(j+1)*segments+i)for j in range(rings)for i in range(segments)];self.add(vs,fs,ma)
    def finish(self):
        if not self.v:return None
        me=bpy.data.meshes.new(self.name);me.from_pydata(self.v,[],self.f);me.materials.clear()
        for m in self.mats:me.materials.append(M.get(m) or bpy.data.materials[m])
        for p,i in zip(me.polygons,self.mi):p.material_index=i
        me.update();ob=bpy.data.objects.new(self.name,me);collection(self.col).objects.link(ob);ob['geometry_origin']='authored v4 architectural concept; not engineering';return ob

def label(name,text,loc,size=1.5,yaw=0,ma='v3_cream',col='V3_SIGNAGE'):
    c=bpy.data.curves.new(name,'FONT');c.body=text;c.align_x='CENTER';c.size=size;c.extrude=.018;c.resolution_u=3
    ob=bpy.data.objects.new(name,c);collection(col).objects.link(ob);ob.location=loc;ob.rotation_euler=(math.pi/2,0,yaw);c.materials.append(M[ma]);return ob

def camera(name,pos,target,width,res=(1800,1200),ortho=True):
    ob=bpy.data.objects.get(name)
    if ob is None:ca=bpy.data.cameras.new(name);ob=bpy.data.objects.new(name,ca);collection('V3_CAMERAS').objects.link(ob)
    ob.location=pos;ob.rotation_euler=(Vector(target)-Vector(pos)).to_track_quat('-Z','Y').to_euler();ob.data.type='ORTHO'if ortho else'PERSP';ob.data.ortho_scale=width;ob.data.lens=40;ob.data.clip_start=.5;ob.data.clip_end=10000
    return {'object':ob,'target':list(target),'resolution':list(res),'ortho_width_m':width,'position_blender_m':list(pos),'geometry_status':'proposed concept'}

def smooth_closed(points,sub=24):
    P=[Vector(p)for p in points];out=[]
    for i in range(len(P)):
        p0,p1,p2,p3=[P[k%len(P)]for k in [i-1,i,i+1,i+2]]
        for j in range(sub):
            t=j/sub;out.append(tuple(.5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t)))
    out.append(out[0]);return out