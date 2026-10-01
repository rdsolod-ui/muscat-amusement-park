"use client";
import {Canvas,useThree,useFrame} from "@react-three/fiber";
import {OrbitControls,useGLTF} from "@react-three/drei";
import {Suspense,useLayoutEffect,useMemo} from "react";
import * as THREE from "three";
import {asset} from "@/lib/assets";
function DepthRange(){const {camera}=useThree();useFrame(()=>{const cam=camera as THREE.PerspectiveCamera,near=Math.max(.1,cam.position.length()/50);if(Math.abs(cam.near-near)>.001){cam.near=near;cam.far=10000;cam.updateProjectionMatrix()}});return null}
function Model(){
 const {scene}=useGLTF(asset("models/muscat-park-v3.glb"));
 const clone=useMemo(()=>scene.clone(true),[scene]);
 const {camera,size,invalidate}=useThree();
 useLayoutEffect(()=>{
   const bounds=new THREE.Box3().setFromObject(clone),sphere=bounds.getBoundingSphere(new THREE.Sphere()),center=sphere.center;
   clone.position.sub(center);
   const cam=camera as THREE.PerspectiveCamera;
   const direction=new THREE.Vector3(.56,.72,.63).normalize();
   const right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),direction).normalize();
   const up=new THREE.Vector3().crossVectors(direction,right).normalize();
   const tan=Math.tan(THREE.MathUtils.degToRad(cam.fov)/2),aspect=size.width/size.height;
   let fit=0;
   clone.updateMatrixWorld(true);
   const vertex=new THREE.Vector3();
   clone.traverse(object=>{const mesh=object as THREE.Mesh;if(!mesh.isMesh)return;const position=mesh.geometry.getAttribute("position");if(!position)return;for(let i=0;i<position.count;i++){
     vertex.fromBufferAttribute(position,i).applyMatrix4(mesh.matrixWorld);const depth=vertex.dot(direction);
     fit=Math.max(fit,depth+Math.abs(vertex.dot(right))/(tan*aspect),depth+Math.abs(vertex.dot(up))/tan);
   }});
   fit*=1.12;
   cam.position.copy(direction.multiplyScalar(fit));cam.near=Math.max(.1,fit/50);cam.far=10000;cam.lookAt(0,0,0);cam.updateProjectionMatrix();invalidate();
 },[clone,camera,size,invalidate]);
 return <primitive object={clone}/>;
}
export default function ParkViewer({active,reduced}:{active:boolean;reduced:boolean}){
 return <Canvas frameloop="demand" dpr={[1,1.5]} camera={{fov:40,position:[700,900,700]}} gl={{antialias:true,alpha:true,powerPreference:"low-power"}} onCreated={({gl})=>{gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1}}>
   <DepthRange/><ambientLight intensity={.85}/><directionalLight position={[600,1100,500]} intensity={2.2}/><hemisphereLight args={["#d5f1f2","#bba07b",.8]}/>
   <Suspense fallback={null}><Model/></Suspense>
   <OrbitControls makeDefault enableDamping={active&&!reduced} dampingFactor={.1} enablePan maxPolarAngle={Math.PI/2.15} minDistance={40} maxDistance={3000} target={[0,0,0]}/>
 </Canvas>
}
