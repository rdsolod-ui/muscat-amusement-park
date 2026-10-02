"use client";
import {useEffect,useRef,useState} from "react";
import {gsap} from "gsap";
import {asset} from "@/lib/assets";
import styles from "./PartnershipFinal.module.css";

const FRAMES=[
 {file:"salalah-day.webp",ar:"صلالة · النهار",en:"Salalah · Day"},
 {file:"salalah-sunset.webp",ar:"صلالة · الغروب",en:"Salalah · Sunset"},
 {file:"salalah-night.webp",ar:"صلالة · المساء",en:"Salalah · Evening"},
];
export default function PartnershipFinal({active,paused,reduced}:{active:boolean;paused:boolean;reduced:boolean}){
 const layers=useRef<(HTMLImageElement|null)[]>([]);
 const timeline=useRef<gsap.core.Timeline|null>(null);
 const [activated,setActivated]=useState(false);
 const [available,setAvailable]=useState<boolean[]>([false,false,false]);
 const [current,setCurrent]=useState(0);
 const [visible,setVisible]=useState(true);
 const currentRef=useRef(0);
 useEffect(()=>{if(active)setActivated(true);},[active]);
 useEffect(()=>{const update=()=>setVisible(!document.hidden);update();document.addEventListener("visibilitychange",update);return()=>document.removeEventListener("visibilitychange",update);},[]);
 useEffect(()=>{
  if(!activated)return;
  let disposed=false;
  FRAMES.forEach((frame,index)=>{const image=new Image();image.src=asset("media/v5/"+frame.file);image.decode().then(()=>{if(!disposed)setAvailable(previous=>previous.map((v,i)=>i===index?true:v));}).catch(()=>{});});
  return()=>{disposed=true;};
 },[activated]);
 const allReady=available.every(Boolean);
 useEffect(()=>{
  if(!allReady||reduced)return;
  const proxy={position:0};
  const paint=()=>{
   const position=proxy.position%3;
   const start=Math.floor(position),blend=position-start;
   // Incoming frame overlays a fully opaque outgoing frame: no dark dip at 50%.
   layers.current.forEach((layer,index)=>{if(layer){const incoming=index===(start+1)%3;layer.style.opacity=String(index===start?1:incoming?blend:0);layer.style.zIndex=incoming?"2":index===start?"1":"0";}});
   const next=blend<.5?start:(start+1)%3;
   if(next!==currentRef.current){currentRef.current=next;setCurrent(next);}
  };
  const tl=gsap.timeline({paused:true,repeat:-1,onUpdate:paint});
  for(let i=0;i<3;i++)tl.to(proxy,{position:i,duration:5,ease:"none"}).to(proxy,{position:i+1,duration:1.5,ease:"power1.inOut"});
  timeline.current=tl;paint();
  return()=>{tl.kill();timeline.current=null;};
 },[allReady,reduced]);
 useEffect(()=>{
  if(reduced||!allReady){const first=available.findIndex(Boolean);if(first>=0){layers.current.forEach((layer,i)=>{if(layer){layer.style.opacity=i===first?"1":"0";layer.style.zIndex=i===first?"1":"0";}});currentRef.current=first;setCurrent(first);}return;}
  if(active&&!paused&&visible)timeline.current?.resume();else timeline.current?.pause();
 },[active,paused,reduced,visible,allReady,available]);
 // A failed variant cannot replace a successfully loaded photograph with a blank frame.
 return <figure className={"scene scene-partnership "+styles.frame} data-photo-cycle={allReady&&!reduced?"ready":"static"} data-photo-frame={current}>
  <div className={styles.stage} aria-hidden="true">{activated&&FRAMES.map((frame,index)=><img key={frame.file} ref={element=>{layers.current[index]=element;}} src={asset("media/v5/"+frame.file)} alt="" className={styles.photo}/>)}</div>
  <figcaption className={styles.caption}>
   <span className={styles.photoTime} lang="en" dir="ltr">{FRAMES[current].en}</span>
   <strong className={styles.group} lang="en" dir="ltr">MG Group</strong>
   <span lang="ar" dir="rtl">خبرة في ٨ منتزهات حول العالم</span><span lang="en" dir="ltr">Experience across 8 parks worldwide</span>
   <span className={styles.oman} lang="ar" dir="rtl">عين صلالة · خبرة أنجزناها في عُمان</span><span lang="en" dir="ltr">Salalah Eye · Our experience in Oman</span>
  </figcaption>
 </figure>;
}
