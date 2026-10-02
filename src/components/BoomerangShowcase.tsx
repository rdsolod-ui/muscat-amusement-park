"use client";
import {Component,Suspense,useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState,type ErrorInfo,type ReactNode} from "react";
import {Canvas,useFrame,useThree} from "@react-three/fiber";
import {OrbitControls,useGLTF} from "@react-three/drei";
import {ACESFilmicToneMapping,Box3,MathUtils,PerspectiveCamera,Vector3} from "three";
import {asset} from "@/lib/assets";
import type {OrbitControls as OrbitControlsImpl} from "three-stdlib";
import styles from "./BoomerangShowcase.module.css";
const MODEL="models/boomerang-v5.glb";
const POSTER="media/v5/boomerang-render.webp";
const VIDEO="media/v5/boomerang-video.webm";
class ModelBoundary extends Component<{children:ReactNode;onFailure:()=>void},{failed:boolean}>{
 state={failed:false};static getDerivedStateFromError(){return{failed:true};}
 componentDidCatch(_error:Error,_info:ErrorInfo){this.props.onFailure();}
 render(){return this.state.failed?null:this.props.children;}
}
function Coaster({onReady,onFailure}:{onReady:()=>void;onFailure:()=>void}){
 const {scene}=useGLTF(asset(MODEL));
 const model=useMemo(()=>scene.clone(true),[scene]);
 const {camera,size,invalidate,gl}=useThree();
 const ready=useRef(false),callbacks=useRef({onReady,onFailure});callbacks.current={onReady,onFailure};
 const bounds=useMemo(()=>{model.updateMatrixWorld(true);return new Box3().setFromObject(model);},[model]);
 const center=useMemo(()=>bounds.getCenter(new Vector3()),[bounds]);
 useLayoutEffect(()=>{
  if(bounds.isEmpty())throw new Error("The supplied Boomerang has no visible geometry");
  const cam=camera as PerspectiveCamera;
  const direction=new Vector3(.707,.454,1).normalize();
  const right=new Vector3().crossVectors(new Vector3(0,1,0),direction).normalize();
  const up=new Vector3().crossVectors(direction,right).normalize();
  const tan=Math.tan(MathUtils.degToRad(cam.fov)/2),aspect=size.width/size.height;
  let distance=1;const point=new Vector3();
  for(const x of[bounds.min.x,bounds.max.x])for(const y of[bounds.min.y,bounds.max.y])for(const z of[bounds.min.z,bounds.max.z]){
   point.set(x,y,z).sub(center);distance=Math.max(distance,point.dot(direction)+Math.abs(point.dot(right))/(tan*aspect),point.dot(direction)+Math.abs(point.dot(up))/tan);
  }
  distance*=1.08;cam.position.copy(direction.multiplyScalar(distance));cam.near=Math.max(.02,distance/1000);cam.far=Math.max(2000,distance*8);cam.lookAt(0,0,0);cam.updateProjectionMatrix();invalidate();
 },[bounds,camera,center,invalidate,size.width,size.height]);
 useEffect(()=>{const lost=(event:Event)=>{event.preventDefault();callbacks.current.onFailure();};gl.domElement.addEventListener("webglcontextlost",lost);return()=>gl.domElement.removeEventListener("webglcontextlost",lost);},[gl]);
 useFrame(()=>{if(!ready.current){ready.current=true;callbacks.current.onReady();}});
 return <group position={[-center.x,-center.y,-center.z]}><primitive object={model} dispose={null}/></group>;
}
function CoasterControls({running,enabled}:{running:boolean;enabled:boolean}){
 const controls=useRef<OrbitControlsImpl>(null),elapsed=useRef(0);
 const [dragging,setDragging]=useState(false);
 const offset=useMemo(()=>new Vector3(),[]),axis=useMemo(()=>new Vector3(0,1,0),[]);
 useFrame(({camera},delta)=>{
  if(!running||dragging||!controls.current)return;
  const before=Math.sin(elapsed.current*.08);elapsed.current+=Math.min(delta,.05);
  const angle=(Math.sin(elapsed.current*.08)-before)*MathUtils.degToRad(5);
  offset.copy(camera.position).sub(controls.current.target).applyAxisAngle(axis,angle);
  camera.position.copy(controls.current.target).add(offset);
 },-2);
 return <OrbitControls ref={controls} makeDefault enabled={enabled} enablePan={false} enableDamping={running} autoRotate={false} onStart={()=>setDragging(true)} onEnd={()=>setDragging(false)} maxPolarAngle={Math.PI*.47} minPolarAngle={Math.PI*.12}/>;
}
export default function BoomerangShowcase({active,paused,reduced}:{active:boolean;paused:boolean;reduced:boolean}){
 const video=useRef<HTMLVideoElement>(null);
 const [activated,setActivated]=useState(false),[visible,setVisible]=useState(true),[graphicsOff,setGraphicsOff]=useState(false);
 const [ready,setReady]=useState(false),[failed,setFailed]=useState(false),[videoFailed,setVideoFailed]=useState(false);
 const [manualPlayback,setManualPlayback]=useState(false);
 const markReady=useCallback(()=>setReady(true),[]),markFailure=useCallback(()=>setFailed(true),[]);
 useEffect(()=>{if(active)setActivated(true);},[active]);
 useEffect(()=>{setGraphicsOff(new URLSearchParams(location.search).get("graphics")==="off");const update=()=>setVisible(!document.hidden);update();document.addEventListener("visibilitychange",update);return()=>document.removeEventListener("visibilitychange",update);},[]);
 const running=active&&visible&&!paused&&!reduced;
 useEffect(()=>{
  const element=video.current;if(!element)return;
  if(running){const play=element.play();play?.catch(()=>setManualPlayback(true));}
  else element.pause();
 },[running,activated]);
 const showModel=activated&&!graphicsOff&&!failed&&!reduced;
 return <figure className={"scene scene-boomerang "+styles.frame} data-boomerang-mode={showModel&&ready?"textured-model":"poster"}>
  <div className={styles.coaster}>
   {(!showModel||!ready)&&<img src={asset(POSTER)} alt="Textured presentation render of the supplied WFC-20A Boomerang looping coaster" loading="lazy" className={styles.poster}/>}
   {showModel&&<div className={styles.canvas} style={{opacity:ready?1:0}}><ModelBoundary onFailure={markFailure}>
    <Canvas frameloop={running?"always":"demand"} dpr={[1,1.5]} camera={{fov:38,position:[80,45,95],near:.05,far:2000}} gl={{alpha:true,antialias:true,powerPreference:"low-power",toneMapping:ACESFilmicToneMapping}}>
     <ambientLight intensity={1.15}/><hemisphereLight args={["#d9eff5","#c6a880",1.25]}/><directionalLight position={[70,90,100]} intensity={2.8}/><directionalLight position={[-50,30,-70]} intensity={1.2}/>
     <Suspense fallback={null}><Coaster onReady={markReady} onFailure={markFailure}/></Suspense>
     <CoasterControls running={running} enabled={active&&!paused&&visible}/>
    </Canvas>
   </ModelBoundary></div>}
  </div>
  <div className={styles.phone} aria-label="iPhone 18 Pro Max presentation mockup showing the supplied Boomerang video">
   <span className={styles.island} aria-hidden="true"/>
   {activated&&!videoFailed?<video ref={video} src={asset(VIDEO)} poster={asset("media/v5/boomerang-video-poster.webp")} muted playsInline loop preload="metadata" controls={manualPlayback||reduced} onError={()=>setVideoFailed(true)} aria-label="Boomerang ride video"/>:<img src={asset("media/v5/boomerang-video-poster.webp")} alt="Boomerang ride video preview" loading="lazy"/>}
  </div>
  <figcaption className={styles.caption}><span lang="ar" dir="rtl">بوميرانغ · حلقة رأسية</span><span lang="en" dir="ltr">Boomerang · The looping coaster</span></figcaption>
 </figure>;
}
