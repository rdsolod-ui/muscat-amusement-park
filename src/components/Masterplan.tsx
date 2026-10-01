"use client";
import {useEffect,useRef,useState,Component,ReactNode} from "react";
import {createPortal} from "react-dom";
import dynamic from "next/dynamic";
import {gsap} from "gsap";
import {Box,MapPin,X} from "lucide-react";
import {asset} from "@/lib/assets";
import styles from "./Masterplan.module.css";
const ParkViewer=dynamic(()=>import("./ParkViewer"),{ssr:false,loading:()=> <div className="viewer-loading">تحميل المجسم · Loading model…</div>});
const labels=[["المخطط الأصلي","Original plan"],["المجسم","Blender model"],["رؤية المكان","The vision"]];
const zones=[
 {id:1,ar:"حديقة الألعاب",en:"Amusement park",area:"17.5",areaAr:"١٧٫٥",copyAr:"ألعاب عائلية وتجارب متنوعة في الجزء الغربي، مع مسارات مظللة ومناطق انتظار واستراحة.",copyEn:"Family rides and varied experiences to the west, connected by shaded paths, queues and places to rest."},
 {id:2,ar:"الحديقة المائية",en:"Water park",area:"9",areaAr:"٩",copyAr:"منطقة مائية مقترحة شرق الموقع، مع خدمات تبديل الملابس والراحة؛ يتطلب تطويرها دراسة المياه والتشغيل.",copyEn:"A proposed water park to the east, with changing and rest facilities; development requires water and operating studies."},
 {id:3,ar:"ممشى العائلة",en:"City Walk",area:"5",areaAr:"٥",copyAr:"محور يربط الألعاب والمياه والمركز العائلي الداخلي، مع المقاهي والمطاعم والمتاجر. المساحة تخص منطقة الممشى في المخطط الأصلي.",copyEn:"The link between rides, water and the indoor family centre, with cafés, dining and shops. The area refers to City Walk in the supplied plan."},
 {id:4,ar:"المواقف والدخول",en:"Parking and arrival",area:"4",areaAr:"٤",copyAr:"الهدف ١٬٠٠٠ موقف سطحي. العدد النهائي رهن التحقق من الأبعاد والمداخل وحركة السيارات والمشاة.",copyEn:"Target: 1,000 surface parking spaces. Final capacity depends on dimensions, access and vehicle and pedestrian circulation."},
 {id:5,ar:"الخدمات الفنية",en:"Technical services",area:"1.5",areaAr:"١٫٥",copyAr:"مساحة للخدمات الفنية والصيانة ودعم التشغيل، مع وصول خدمي مستقل يحتاج إلى تنسيق هندسي.",copyEn:"Space for technical services, maintenance and operating support, with service access to be coordinated in the engineering design."},
] as const;
class ViewBoundary extends Component<{children:ReactNode},{error:boolean}>{state={error:false};static getDerivedStateFromError(){return{error:true}}render(){return this.state.error?<div className="viewer-fallback">يمكنك متابعة العرض بالصور<br/><span lang="en">The concept images remain available on this device.</span></div>:this.props.children}}
export default function Masterplan({active,paused,reduced}:{active:boolean;paused:boolean;reduced:boolean}){
 const root=useRef<HTMLDivElement>(null), model=useRef<HTMLDivElement>(null), vision=useRef<HTMLDivElement>(null);
 const playhead=useRef({value:0}),timeline=useRef<gsap.core.Animation|null>(null),played=useRef(false);
 const [stage,setStage]=useState(0),[viewer,setViewer]=useState(false),[map,setMap]=useState(false);
 const [selectedZone,setSelectedZone]=useState(1);
 const [graphicsOff,setGraphicsOff]=useState(false);
 useEffect(()=>setGraphicsOff(new URLSearchParams(location.search).get("graphics")==="off"),[]);
 const [detailHost,setDetailHost]=useState<HTMLElement|null>(null);
 const zone=zones.find(item=>item.id===selectedZone)!;
 useEffect(()=>{
   const desktop=window.matchMedia("(min-width:901px)");
   const update=()=>setDetailHost(desktop.matches?document.getElementById("masterplan-detail-slot"):null);
   update();desktop.addEventListener("change",update);
   return()=>desktop.removeEventListener("change",update);
 },[active]);
 const paint=(value:number)=>{if(model.current)model.current.style.opacity=String(Math.min(1,value));if(vision.current)vision.current.style.opacity=String(Math.max(0,value-1))};
 const select=(index:number)=>{timeline.current?.kill();setViewer(false);setMap(false);setStage(index);if(reduced||paused){playhead.current.value=index;paint(index)}else timeline.current=gsap.to(playhead.current,{value:index,duration:.65,ease:"power2.inOut",overwrite:true,onUpdate:()=>paint(playhead.current.value)});};
 useEffect(()=>{
   if(!active||paused||reduced||played.current)return;
   played.current=true;
   const tl=gsap.timeline({onComplete:()=>setStage(2)});
   tl.to(playhead.current,{value:1,duration:1.25,delay:.65,ease:"power2.inOut",onStart:()=>setStage(1),onUpdate:()=>paint(playhead.current.value)})
     .to(playhead.current,{value:2,duration:1.45,delay:.65,ease:"power2.inOut",onStart:()=>setStage(2),onUpdate:()=>paint(playhead.current.value)});
   timeline.current=tl;
 },[active,paused,reduced]);
 useEffect(()=>{if(!active||paused||reduced||document.hidden)timeline.current?.pause();else timeline.current?.resume()},[active,paused,reduced]);
 useEffect(()=>{const change=()=>{if(document.hidden)timeline.current?.pause();else if(active&&!paused&&!reduced)timeline.current?.resume()};document.addEventListener("visibilitychange",change);return()=>document.removeEventListener("visibilitychange",change)},[active,paused,reduced]);
 useEffect(()=>()=>{timeline.current?.kill();gsap.killTweensOf(playhead.current)},[]);
 const programme=<div className={styles.detailPanel} data-portaled={Boolean(detailHost)}>
   <div className={styles.programme} data-programme-zones="5">
     <div className={styles.selector} role="group" aria-label="مناطق البرنامج الخمس · Five programme zones">
       {zones.map(item=><button key={item.id} type="button" aria-pressed={selectedZone===item.id} aria-controls="muscat-zone-detail" aria-label={item.id+". "+item.ar+" · "+item.en} title={item.ar+" · "+item.en} onClick={()=>setSelectedZone(item.id)}><span dir="ltr">{String(item.id).padStart(2,"0")}</span></button>)}
     </div>
     <div className={styles.detail} id="muscat-zone-detail" aria-live="polite" aria-atomic="true" data-selected-zone={zone.id}>
       <span className={styles.number} dir="ltr" aria-hidden="true">{String(zone.id).padStart(2,"0")}</span>
       <div className={styles.heading}><h3 lang="ar" dir="rtl">{zone.ar}</h3><span lang="en" dir="ltr">{zone.en}</span></div>
       <div className={styles.area}><span lang="ar" dir="rtl">{zone.areaAr} هكتار</span><span lang="en" dir="ltr">{zone.area} ha · source plan</span></div>
       <div className={styles.description}><p lang="ar" dir="rtl">{zone.copyAr}</p><p lang="en" dir="ltr">{zone.copyEn}</p></div>
     </div>
   </div>
   <p className={styles.areaNote} lang="ar" dir="rtl">٣٧ هكتاراً وفق الرسم؛ الحد التقريبي ٥٠٫٤ هكتار. يلزم مسح رسمي.<span lang="en" dir="ltr">37 ha in source labels; ≈50.4 ha traced outline. Survey required.</span></p>
 </div>;
 return <div className="masterplan" ref={root}>
   <div className="plan-stage">
     <div className="plan-layer original"><img src={asset("media/source-masterplan-diagram.svg")} alt="رسم توضيحي للمخطط الأصلي المقدم — Diagram following the supplied original site plan"/></div>
     <div className="plan-layer" ref={model} style={{opacity:0}}><img src={asset("media/masterplan-oblique.webp")} alt="نموذج Blender للمخطط الأصلي — Blender model following the original diagram" loading="lazy"/></div>
     <div className="plan-layer" ref={vision} style={{opacity:0}}><img src={asset("media/hero-vision.webp")} alt="تصور بصري مولد للمشروع المقترح — Generated concept vision of the proposed park" loading="lazy"/></div>
     {map&&<div className="map-overlay"><img src={asset("media/site-evidence.svg")} alt="مطابقة الموقع والحدود المرسومة — Registered site location and image-traced outline"/></div>}
     {viewer&&<div className="live-viewer"><ViewBoundary><ParkViewer active={active&&!paused} reduced={reduced}/></ViewBoundary><button className="icon-button viewer-close" onClick={()=>setViewer(false)} aria-label="إغلاق المجسم · Close 3D"><X size={18}/></button><span className="viewer-hint">اسحب للاستكشاف · Drag to explore</span></div>}
     <div className="plan-caption"><span className="scene-dot"/><div lang="ar">{map?"مطابقة بصرية للموقع":viewer?"مجسم مفاهيمي قابل للاستكشاف":labels[stage][0]}</div><span lang="en" dir="ltr">{map?"Visual site registration":viewer?"Interactive concept model":labels[stage][1]}</span></div>
   </div>
   {!map&&!viewer&&stage===1&&<p className={styles.renderCredit} lang="en" dir="ltr">Blender render context: Esri, Vantor, Earthstar Geographics, GIS User Community</p>}
   <div className="plan-tools">
     <div className="stage-tabs" role="group" aria-label="مراحل التصور · Concept stages">{labels.map((l,i)=><button key={i} className={!viewer&&!map&&i===stage?"selected":""} aria-pressed={!viewer&&!map&&i===stage} onClick={()=>select(i)}><span lang="ar">{l[0]}</span><span lang="en">{l[1]}</span></button>)}</div>
     <div className="plan-actions"><button aria-label="3D" disabled={graphicsOff} className={viewer?"selected":""} onClick={()=>{timeline.current?.kill();setMap(false);setViewer(!viewer)}} aria-pressed={viewer}><Box size={16}/><span>3D</span></button><button className={map?"selected":""} onClick={()=>{timeline.current?.kill();setViewer(false);setMap(!map)}} aria-pressed={map} aria-label="مطابقة الموقع · Site registration"><MapPin size={17}/></button></div>
   </div>
   {detailHost?createPortal(programme,detailHost):programme}
   <p className="plan-note" lang="ar">الألعاب غرباً · المياه شرقاً · ممشى العائلة في الوسط<span lang="en" dir="ltr">Rides west · Water east · A family walk between</span></p>

 </div>
}
