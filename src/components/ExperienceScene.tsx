"use client";
import { Component, Suspense, useEffect, useRef, useState, type ErrorInfo, type MutableRefObject, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ACESFilmicToneMapping, MathUtils } from "three";
import RealisticEarth from "./RealisticEarth";
import GeographyJourney, { useGeographyJourney } from "./GeographyJourney";
import styles from "./GeographyJourney.module.css";
export interface ExperienceSceneProps {progress:number;theme:"light"|"dark";reducedMotion:boolean;paused?:boolean;activeChapter?:number;masterplanStage?:number;onReady?:()=>void;onFailure?:()=>void}
class Boundary extends Component<{children:ReactNode;onFailure?:()=>void},{failed:boolean}>{
 state={failed:false};static getDerivedStateFromError(){return{failed:true};}
 componentDidCatch(_e:Error,_info:ErrorInfo){this.props.onFailure?.();}
 render(){return this.state.failed?null:this.props.children;}
}
function EarthWorld(props:ExperienceSceneProps & {embedded:boolean;introTime:MutableRefObject<number>}){
 const motion=useRef({progress:props.progress,intro:props.reducedMotion?1:0,visible:true});
 const ready=useRef(false),readyFrame=useRef(0),callbacks=useRef(props);callbacks.current=props;
 useEffect(()=>()=>cancelAnimationFrame(readyFrame.current),[]);
 const {camera,invalidate,size,gl}=useThree();
 useEffect(()=>{invalidate();},[props.progress,props.theme,props.reducedMotion,props.paused,props.embedded,size.width,size.height,invalidate]);
 useEffect(()=>{const visibility=()=>{motion.current.visible=!document.hidden;if(motion.current.visible)invalidate();};const loss=(event:Event)=>{event.preventDefault();callbacks.current.onFailure?.();};document.addEventListener("visibilitychange",visibility);gl.domElement.addEventListener("webglcontextlost",loss);return()=>{document.removeEventListener("visibilitychange",visibility);gl.domElement.removeEventListener("webglcontextlost",loss);};},[gl,invalidate]);
 useFrame((_state,delta)=>{
  if(!motion.current.visible)return;const dt=Math.min(delta,.05),target=MathUtils.clamp(props.progress,0,1);
  const intro=!props.reducedMotion&&!props.paused&&props.introTime.current<4.5&&target<.12;
  if(intro)props.introTime.current+=dt;else if(target>=.12||props.reducedMotion)props.introTime.current=4.5;
  motion.current.intro=MathUtils.smoothstep(props.introTime.current,0,4.5);
  motion.current.progress=props.reducedMotion||props.paused?target:MathUtils.damp(motion.current.progress,target,6.5,dt);
  if(props.embedded){
   // Fit the complete sphere to the smaller viewport dimension; no clipping on narrow phones.
   camera.position.set(0,0,8.2/Math.min(1,size.width/size.height));camera.lookAt(0,0,0);
  }else{camera.position.set(0,0,size.width<760?11.2:10);camera.lookAt(0,size.width<760?.6:0,0);}
  if(intro||Math.abs(motion.current.progress-target)>.0001)invalidate();
  if(!ready.current){ready.current=true;readyFrame.current=requestAnimationFrame(()=>callbacks.current.onReady?.());}
 },-30);
 return <RealisticEarth motion={motion} theme={props.theme} reducedMotion={props.reducedMotion} embedded={props.embedded}/>;
}
export default function ExperienceScene(props:ExperienceSceneProps){
 const placeActive=props.activeChapter===1;
 const journey=useGeographyJourney(placeActive,Boolean(props.paused),props.reducedMotion);
 const introTime=useRef(0);
 const [earthHost,setEarthHost]=useState<HTMLElement|null>(null);
 useEffect(()=>{
  const mobile=window.matchMedia("(max-width: 900px)");
  const update=()=>setEarthHost(mobile.matches&&props.activeChapter!==undefined&&props.activeChapter<2
   ?document.getElementById(props.activeChapter===0?"earth-mobile-slot":"geography-mobile-slot"):null);
  update();mobile.addEventListener("change",update);return()=>mobile.removeEventListener("change",update);
 },[props.activeChapter]);
 const travel=MathUtils.smoothstep(journey,0,.5);
 const earthProgress=placeActive?Math.max(props.progress,.23+travel*.067):props.progress;
 const canvas=<div className={styles.earthScene} data-earth-embedded={Boolean(earthHost)}>
  <Boundary onFailure={props.onFailure}><Canvas frameloop="demand" dpr={[1,1.5]} camera={{position:[0,0,10],fov:40,near:.08,far:100}}
   gl={{alpha:true,antialias:true,powerPreference:"high-performance",toneMapping:ACESFilmicToneMapping}}
   style={{width:"100%",height:"100%",pointerEvents:"none"}}><Suspense fallback={null}><EarthWorld {...props} embedded={Boolean(earthHost)} introTime={introTime} progress={earthProgress}/></Suspense></Canvas></Boundary>
 </div>;
 return <>{earthHost?createPortal(canvas,earthHost):canvas}<GeographyJourney active={placeActive} stage={journey}/></>;
}
