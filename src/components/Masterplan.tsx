"use client";
import {useEffect,useRef,useState,Component,ReactNode} from "react";
import {createPortal} from "react-dom";
import dynamic from "next/dynamic";
import {gsap} from "gsap";
import {Box,MapPin,RotateCcw,X} from "lucide-react";
import {asset} from "@/lib/assets";
import frames from "@/data/masterplan-frames-v5.json";
import styles from "./Masterplan.module.css";
const ParkViewer=dynamic(()=>import("./ParkViewer"),{ssr:false,loading:()=> <div className="viewer-loading">تحميل المجسم · Loading model…</div>});
const zones=[
 {id:1,key:"rides",ar:"حديقة الألعاب",en:"Amusement park",area:"17.5",areaAr:"١٧٫٥",copyAr:"عجلة ٩٠ متراً، وأفعوانية بوميرانغ بحلقة رأسية، ودوّارات وبرج سقوط وصالات ألعاب.",copyEn:"90-metre wheel, Boomerang looping coaster, carousels, drop tower and arcades."},
 {id:2,key:"water",ar:"الحديقة المائية",en:"Water park",area:"9",areaAr:"٩",copyAr:"مسبح أمواج، ومنزلقات، ونادٍ شاطئي بكراسي استرخاء ومظلات.",copyEn:"Wave pool, slides and a beach lounge with loungers and umbrellas."},
 {id:3,key:"city",ar:"ممشى العائلة",en:"City Walk",area:"5",areaAr:"٥",copyAr:"واجهات من طابقين وشرفات مقاهٍ؛ مظلات رذاذ على الممشى وقبة في نهايته.",copyEn:"Two-storey façades, café terraces and mist pergolas. A family dome at the end."},
 {id:4,key:"parking",ar:"المواقف والدخول",en:"Parking and arrival",area:"1,000",areaAr:"١٬٠٠٠",copyAr:"مدخل واضح من التقاطع القائم، مع فصل حركة السيارات عن ممشى العائلة.",copyEn:"A clear approach from the existing junction, with cars separated from the family promenade."},
 {id:5,key:"utility",ar:"الخدمات الفنية",en:"Technical services",area:"1.5",areaAr:"١٫٥",copyAr:"صيانة ومعالجة مياه وخدمات، بوصول منفصل يحتاج إلى دراسة.",copyEn:"Maintenance, water treatment and services; separate access requires study."},
] as const;
class ViewBoundary extends Component<{children:ReactNode},{error:boolean}>{state={error:false};static getDerivedStateFromError(){return{error:true}}render(){return this.state.error?<div className="viewer-fallback">يمكنك متابعة العرض بالصور<br/><span lang="en">The concept images remain available on this device.</span></div>:this.props.children}}
export default function Masterplan({active,paused,reduced}:{active:boolean;paused:boolean;reduced:boolean}){
 const layers=useRef<(HTMLDivElement|null)[]>([]),playhead=useRef({value:0}),timeline=useRef<gsap.core.Animation|null>(null),started=useRef(false);
 const [stage,setStage]=useState(0),[viewer,setViewer]=useState(false),[selectedZone,setSelectedZone]=useState(1),[closeup,setCloseup]=useState(false),[replay,setReplay]=useState(0);
 const [assetsReady,setAssetsReady]=useState(false);
 const [graphicsOff,setGraphicsOff]=useState(false),[detailHost,setDetailHost]=useState<HTMLElement|null>(null);
 const zone=zones.find(item=>item.id===selectedZone)!;
 useEffect(()=>setGraphicsOff(new URLSearchParams(location.search).get("graphics")==="off"),[]);
 useEffect(()=>{const desktop=window.matchMedia("(min-width:901px)");const update=()=>setDetailHost(desktop.matches?document.getElementById("masterplan-detail-slot"):null);update();desktop.addEventListener("change",update);return()=>desktop.removeEventListener("change",update)},[active]);
 useEffect(()=>{
  if(!active||assetsReady)return;
  let cancelled=false;
  Promise.all(frames.map(frame=>new Promise<void>((resolve,reject)=>{
   const image=new Image();image.onload=()=>image.decode().then(()=>resolve(),reject);image.onerror=reject;image.src=asset(frame.src);
  }))).then(()=>{if(!cancelled)setAssetsReady(true)}).catch(()=>{});
  return()=>{cancelled=true};
 },[active,assetsReady]);
 const paint=(value:number)=>{layers.current.forEach((layer,index)=>{if(layer)layer.style.opacity=String(Math.max(0,1-Math.abs(index-value)))})};
 const select=(index:number)=>{started.current=true;timeline.current?.kill();setViewer(false);setStage(index);if(reduced||paused){playhead.current.value=index;paint(index)}else timeline.current=gsap.to(playhead.current,{value:index,duration:1.2,ease:"sine.inOut",onUpdate:()=>paint(playhead.current.value)});};
 const chooseZone=(id:number)=>{setSelectedZone(id);setCloseup(true);setViewer(false)};
 useEffect(()=>{
  if(!active||paused||reduced||!assetsReady||started.current)return;started.current=true;
  const tl=gsap.timeline();
  // Five full seconds per view; crossfades are additional viewing time.
  tl.to(playhead.current,{value:1,duration:1.6,delay:5,ease:"sine.inOut",onStart:()=>setStage(1),onUpdate:()=>paint(playhead.current.value)})
    .to(playhead.current,{value:2,duration:1.6,delay:5,ease:"sine.inOut",onStart:()=>setStage(2),onUpdate:()=>paint(playhead.current.value)})
    .to({}, {duration:5});
  timeline.current=tl;
 },[active,paused,reduced,replay,assetsReady]);
 useEffect(()=>{if(!active||paused||reduced||viewer||closeup||document.hidden)timeline.current?.pause();else timeline.current?.resume()},[active,paused,reduced,viewer,closeup,replay]);
 useEffect(()=>{const change=()=>{if(document.hidden)timeline.current?.pause();else if(active&&!paused&&!reduced&&!viewer&&!closeup)timeline.current?.resume()};document.addEventListener("visibilitychange",change);return()=>document.removeEventListener("visibilitychange",change)},[active,paused,reduced,viewer,closeup]);
 useEffect(()=>()=>{timeline.current?.kill();gsap.killTweensOf(playhead.current)},[]);
 const restart=()=>{timeline.current?.kill();started.current=false;playhead.current.value=0;paint(0);setStage(0);setViewer(false);setCloseup(false);setReplay(v=>v+1)};
 const programme=<div className={styles.detailPanel} data-portaled={Boolean(detailHost)}>
  <div className={styles.programme} data-programme-zones="5">
   <div className={styles.selector} role="group" aria-label="مناطق البرنامج الخمس · Five programme zones">
    {zones.map(item=><button key={item.id} type="button" aria-pressed={selectedZone===item.id} aria-controls="muscat-zone-detail" aria-label={item.id+". "+item.ar+" · "+item.en} title={item.ar+" · "+item.en} onClick={()=>chooseZone(item.id)}><span dir="ltr">{String(item.id).padStart(2,"0")}</span></button>)}
   </div>
   <div className={styles.detail} id="muscat-zone-detail" aria-live="polite" aria-atomic="true" data-selected-zone={zone.id}>
    <span className={styles.number} dir="ltr" aria-hidden="true">{String(zone.id).padStart(2,"0")}</span>
    <div className={styles.heading}><h3 lang="ar" dir="rtl">{zone.ar}</h3><span lang="en" dir="ltr">{zone.en}</span></div>
    <div className={styles.area}><span lang="ar" dir="rtl">{zone.areaAr} {zone.id===4?"موقف":"هكتار"}</span><span lang="en" dir="ltr">{zone.area} {zone.id===4?"target spaces":"ha · source plan"}</span></div>
    <div className={styles.description}><p lang="ar" dir="rtl">{zone.copyAr}</p><p lang="en" dir="ltr">{zone.copyEn}</p></div>
   </div>
  </div>
  <p className={styles.areaNote} lang="ar" dir="rtl">توزيع مفاهيمي؛ الحدود والمساحات والوصول رهن المسح والاعتماد.<span lang="en" dir="ltr">Concept layout. Boundaries, areas and access require survey and approval.</span></p>
 </div>;
 return <div className="masterplan masterplan-v4" data-stage={stage} data-hold-seconds="5">
  <div className="plan-stage">
   {frames.map((frame,index)=><div key={frame.src} className={"plan-layer frame-"+index} ref={el=>{layers.current[index]=el}} style={{visibility:viewer?"hidden":"visible",opacity:index===0?1:0,pointerEvents:!viewer&&index===stage?"auto":"none"}} aria-hidden={viewer||index!==stage}>
    <img className="plan-artwork" src={asset(frame.src)} alt={frame.ar+" — "+frame.en} loading={index===0?"eager":"lazy"}/>
    <div className="plan-pins">{zones.map(item=>{const point=frame.pins[item.key];return <button key={item.key} className={"plan-pin "+(selectedZone===item.id?"is-selected":"")} style={{left:point[0]*100+"%",top:point[1]*100+"%"}} tabIndex={index===stage&&!viewer?0:-1} onClick={()=>chooseZone(item.id)} aria-label={item.ar+" · "+item.en} aria-pressed={selectedZone===item.id}><span>{String(item.id).padStart(2,"0")}</span></button>})}</div>
   </div>)}
   {closeup&&!viewer&&<figure className="zone-preview" key={zone.key}>
    <img src={asset("media/"+(zone.key==="city"||zone.key==="parking"?"v5":"v4")+"/zone-"+zone.key+".webp")} alt={zone.ar+" — "+zone.en+" · Generated concept"}/>
    <button className="icon-button zone-preview-close" onClick={()=>setCloseup(false)} aria-label="إغلاق الصورة · Close zone image"><X size={18}/></button>
    <figcaption><span lang="ar" dir="rtl">{zone.ar}</span><span lang="en" dir="ltr">{zone.en} · Concept</span></figcaption>
   </figure>}
   {viewer&&<div className="live-viewer"><ViewBoundary><ParkViewer active={active&&!paused} reduced={reduced}/></ViewBoundary><button className="icon-button viewer-close" onClick={()=>setViewer(false)} aria-label="إغلاق المجسم · Close 3D"><X size={18}/></button><span className="viewer-hint">اسحب للاستكشاف · Drag to explore</span></div>}
  </div>
  <div className="plan-caption"><span className="scene-dot"/><div lang="ar">{viewer?"من المخطط إلى البناء":frames[stage].ar}</div><span lang="en" dir="ltr">{viewer?"From plan to construction":frames[stage].en}</span></div>
  <div className="plan-tools">
   <div className="stage-tabs" role="group" aria-label="مراحل التصور · Concept stages">{frames.map((frame,index)=><button key={frame.en} className={!viewer&&index===stage?"selected":""} aria-pressed={!viewer&&index===stage} onClick={()=>select(index)}><span lang="ar">{frame.ar}</span><span lang="en">{frame.en}</span></button>)}</div>
   <div className="plan-actions"><button aria-label="بناء المجسم · 3D construction" title="3D construction" disabled={graphicsOff} className={viewer?"selected":""} onClick={()=>{setCloseup(false);setViewer(!viewer)}} aria-pressed={viewer}><Box size={16}/><span>3D</span></button><button onClick={restart} aria-label="إعادة التسلسل · Replay sequence"><RotateCcw size={17}/></button><a href="https://www.google.com/maps/search/?api=1&query=23.64305%2C58.17629" target="_blank" rel="noreferrer" aria-label="Google Maps"><MapPin size={17}/></a></div>
  </div>
  {detailHost?createPortal(programme,detailHost):programme}
  <p className="plan-note" lang="ar">الألعاب غرباً · المياه شرقاً · ممشى العائلة في الوسط<span lang="en" dir="ltr">Rides west · Water east · A family walk between</span></p>
 </div>
}
