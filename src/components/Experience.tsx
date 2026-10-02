"use client";
import dynamic from "next/dynamic";
import GeographyJourney from "./GeographyJourney";
import "./geography-slots.css";
import {useCallback,useEffect,useRef,useState} from "react";
import {gsap} from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import {ArrowLeft,ArrowRight,ChevronDown,Compass,ExternalLink,EyeOff,Info,List,Maximize2,Minimize2,Moon,Pause,Play,Sun,X} from "lucide-react";
import content from "@/data/content.json";
import {asset} from "@/lib/assets";
import Masterplan from "./Masterplan";
import WheelConstruction from "./WheelConstruction";
import ReferenceGallery from "./ReferenceGallery";

type Chapter=typeof content.chapters[number];
const source=(id:string)=>content.chapters.find(c=>c.id===id)!;
const places:Chapter={...source("site"),id:"place",kicker_ar:"سلطنة عُمان · مسقط · السيب",kicker_en:"Sultanate of Oman · Muscat · Seeb",title_ar:"من مسقط، تبدأ حكاية جديدة.",title_en:"Muscat. The beginning of a new story.",body_ar:"الموقع المقترح في السيب، جنوب شارع السلام وقرب شارع الفروسية.",body_en:"Seeb, south of A Salam Street, near Al Furusiyyah Street.",points:[],note_ar:"المطابقة بصرية. يلزم تأكيد الحدود الرسمية وحقوق الأرض والمياه والوصول.",note_en:"Visual location match. Official boundaries, land rights, drainage and access need verification."};
const chapters=[source("family"),places,source("site"),source("rides"),source("city-walk"),source("character"),source("water"),source("indoor"),source("comfort"),source("city"),source("land-request")];
const journeyProgress=[0,.23,.39,.53,.62,.70,.76,.81,.835,.86,1];
const ExperienceScene=dynamic(()=>import("./ExperienceScene"),{ssr:false});
const names=[["الرؤية","Vision"],["المكان","Place"],["المخطط العام","Masterplan"],["الألعاب","Landmark"],["ممشى العائلة","City Walk"],["هوية المكان","Character"],["الحديقة المائية","Water park"],["قبة العائلة","Family dome"],["راحة العائلة","Family comfort"],["فرص لمسقط","City value"],["طلب الأرض","Land request"]];
const media:Record<string,string>={city:"v3/city.webp",indoor:"v3/dome.webp",rides:"v3/rides.webp",water:"v3/water.webp","city-walk":"v3/promenade.webp",character:"v3/facades.webp",comfort:"v3/mist.webp"};
const referenceArea:Record<string,string>={family:"entrance",place:"arrival",rides:"rides",site:"parking","city-walk":"citywalk",character:"cafes",water:"water",indoor:"dome",comfort:"comfort",city:"citywalk","land-request":"parking"};
export function Pair({ar,en,className=""}:{ar:string;en:string;className?:string}){return <span className={"pair "+className}><span lang="ar" dir="rtl">{ar}</span><span className="en" lang="en" dir="ltr">{en}</span></span>}
function PhaseColumns(){return <div className="phase-columns">{source("phasing").points.map((p,i)=><article key={i}><span className="phase-number">0{i+1}</span><Pair ar={p.ar} en={p.en}/></article>)}</div>}
function CityValue(){return <div className="value-list">{[["وقت للعائلة","Time together"],["فرص للأعمال المحلية","Local enterprise"],["سبب لزيارة المدينة","A reason to explore"]].map((v,i)=><article key={i}><Pair ar={v[0]} en={v[1]} className="value-title"/></article>)}</div>}
function Scene({chapter,active,paused,reduced}:{chapter:Chapter;active:boolean;paused:boolean;reduced:boolean}){
 if(chapter.id==="site")return <Masterplan active={active} paused={paused} reduced={reduced}/>;
 if(chapter.id==="rides")return <WheelConstruction active={active} paused={paused} reduced={reduced}/>;
 return <figure className={"scene scene-"+chapter.id}><img src={asset("media/"+media[chapter.id])} alt={chapter.title_ar+" — "+chapter.title_en} loading="lazy"/><div className="scene-shade"/><figcaption><span className="scene-dot"/><Pair ar="تصور مولد للمشروع المقترح" en="Generated concept visualization"/></figcaption></figure>;
}
export default function Experience(){
 const root=useRef<HTMLDivElement>(null);
 const [active,setActive]=useState(0);
 const [progress,setProgress]=useState(0);
 const [theme,setTheme]=useState<"dark"|"light">("dark");
 const [paused,setPaused]=useState(false);
 const [reduced,setReduced]=useState(false);
 const [present,setPresent]=useState(false);
 const [menu,setMenu]=useState(false);
 const [sources,setSources]=useState(false);
 const [references,setReferences]=useState(false);
 const [hidden,setHidden]=useState(false);
 const [failed,setFailed]=useState(false);
 const [ready,setReady]=useState(false);
 const [tabHidden,setTabHidden]=useState(false);
 const previousProgress=useRef(0);
 const motionPaused=paused||tabHidden||menu||sources||references;
 const sceneReady=useCallback(()=>setReady(true),[]);
 const sceneFailed=useCallback(()=>setFailed(true),[]);
 const menuRef=useRef<HTMLDialogElement>(null);
 const sourcesRef=useRef<HTMLDialogElement>(null);
 const go=useCallback((i:number)=>{
   const target=Math.max(0,Math.min(chapters.length-1,i));
   setMenu(false);
   if(present){setActive(target);window.scrollTo({top:0,behavior:"instant"});}
   else document.getElementById(chapters[target].id)?.scrollIntoView({behavior:reduced?"instant":"smooth",block:"start"});
 },[present,reduced]);
 useEffect(()=>{
   const mq=matchMedia("(prefers-reduced-motion: reduce)");
   const update=()=>setReduced(mq.matches);
   update();mq.addEventListener("change",update);
   try{const saved=localStorage.getItem("muscat-theme");if(saved==="light"||saved==="dark")setTheme(saved);}catch{}
   if(new URLSearchParams(location.search).get("graphics")==="off")setFailed(true);
   return()=>mq.removeEventListener("change",update);
 },[]);
 useEffect(()=>{document.documentElement.dataset.theme=theme;try{localStorage.setItem("muscat-theme",theme)}catch{}},[theme]);
 useEffect(()=>{
   gsap.registerPlugin(ScrollTrigger);
   if(present)return;
   const update=()=>{const sections=Array.from(root.current?.querySelectorAll<HTMLElement>("main>.chapter")||[]);const y=window.scrollY;let i=0,j=0;for(let n=0;n<sections.length;n++){if(y>=sections[n].offsetTop-window.innerHeight*.28)i=n;if(y>=sections[n].offsetTop)j=n;}setActive(i);const next=Math.min(j+1,chapters.length-1),start=sections[j]?.offsetTop||0,end=sections[next]?.offsetTop||start+1;const ratio=Math.min(1,Math.max(0,(y-start)/(end-start||1)));const v=journeyProgress[j]+(journeyProgress[next]-journeyProgress[j])*ratio;previousProgress.current=v;setProgress(v);};
   const trigger=ScrollTrigger.create({start:0,end:"max",onUpdate:update,onRefresh:update});update();
   const refresh=()=>ScrollTrigger.refresh();window.addEventListener("load",refresh);const timer=setTimeout(refresh,300);
   return()=>{clearTimeout(timer);window.removeEventListener("load",refresh);trigger.kill()};
 },[present]);
 useEffect(()=>{if(!present)return;const target=journeyProgress[active];if(reduced||motionPaused){previousProgress.current=target;setProgress(target);return;}const proxy={v:previousProgress.current};const tween=gsap.to(proxy,{v:target,duration:1.25,ease:"power2.inOut",onUpdate:()=>{previousProgress.current=proxy.v;setProgress(proxy.v)}});return()=>{tween.kill()};},[active,present,reduced,motionPaused]);
 useEffect(()=>{const visibility=()=>setTabHidden(document.hidden);document.addEventListener("visibilitychange",visibility);return()=>document.removeEventListener("visibilitychange",visibility)},[]);
 useEffect(()=>{
   const key=(e:KeyboardEvent)=>{
     if(menu||sources||references||e.altKey||e.ctrlKey||e.metaKey||e.isComposing)return;
     if((e.target as HTMLElement)?.closest('input,textarea,select,[contenteditable=true],[role=tablist],[role=slider]'))return;
     if(e.key==="ArrowRight"||e.key==="PageDown"){e.preventDefault();go(active+1)}
     if(e.key==="ArrowLeft"||e.key==="PageUp"){e.preventDefault();go(active-1)}
     if(e.key==="Escape"){setPresent(false);setHidden(false)}
   };window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key);
 },[active,go,menu,sources,references]);
 useEffect(()=>{if(menu&&!menuRef.current?.open)menuRef.current?.showModal();else if(!menu)menuRef.current?.close()},[menu]);
 useEffect(()=>{if(sources&&!sourcesRef.current?.open)sourcesRef.current?.showModal();else if(!sources)sourcesRef.current?.close()},[sources]);
 useEffect(()=>{
   if(!present||reduced||motionPaused)return;
   const el=document.querySelector(".chapter.is-active .copy");
   if(el){const tween=gsap.fromTo(el,{opacity:0,y:12},{opacity:1,y:0,duration:.55,ease:"power2.out"});return()=>{tween.kill();gsap.set(el,{clearProps:"opacity,transform"})}}
 },[present,active,reduced,motionPaused]);
 const togglePresent=()=>{const next=!present;setPresent(next);if(next)window.scrollTo({top:0});else setTimeout(()=>document.getElementById(chapters[active].id)?.scrollIntoView({behavior:"instant"}),30)};
 return <div ref={root} className={"experience "+(present?"is-present ":"")+(paused||reduced?"motion-paused":"")} data-version="4.0.0" data-scene-ready={ready} data-graphics={failed?"static":"webgl"} data-chapters={chapters.length}>
   <div className="scene-wrap" aria-hidden="true" style={{visibility:active>1?"hidden":"visible"}}>{failed?(active===1?<GeographyJourney active stage={1} staticView/>:active===0?<div className="earth-fallback"><img src={asset("textures/earth-v2/day-4096.webp")} alt=""/><span>OMAN · MUSCAT</span></div>:null):<ExperienceScene progress={progress} theme={theme} reducedMotion={reduced} activeChapter={active} paused={motionPaused} onReady={sceneReady} onFailure={sceneFailed}/>}</div>
   <a className="skip" href="#family">انتقل إلى المحتوى · Skip to content</a>
   {!hidden&&<header className="header" dir="ltr">
     <button className="brand" onClick={()=>go(0)} aria-label="Muscat Amusement Park (MAP) home"><svg viewBox="0 0 70 70" aria-hidden="true"><circle cx="35" cy="30" r="24"/><circle cx="35" cy="30" r="4"/><path d="M35 6v20m0 8v20M11 30h20m8 0h20M18 13l14 14m6 6 14 14M18 47l14-14m6-6 14-14M24 64l11-30 11 30"/></svg><Pair ar="مسقط" en="MAP"/></button>
     <nav aria-label="التنقل الرئيسي · Main navigation">{[0,1,2,7,10].map(i=><button key={i} className={active===i?"active":""} onClick={()=>go(i)}><Pair ar={names[i][0]} en={names[i][1]}/></button>)}</nav>
     <div className="header-tools"><button className="theme-switch" role="switch" aria-checked={theme==="light"} aria-label="الوضع الفاتح · Light theme" onClick={()=>setTheme(theme==="dark"?"light":"dark")}><span className="theme-thumb"/><Sun size={17}/><Moon size={17}/></button><button className="icon-button mobile-menu" aria-label="الفصول · Chapters" onClick={()=>setMenu(true)}><List/></button></div>
   </header>}
   <main tabIndex={-1}>{chapters.map((c,i)=><section id={c.id} key={c.id} aria-labelledby={"title-"+c.id} className={"chapter chapter-"+c.id+" "+(i===active?"is-active ":"")+(i===0?"hero":"")+(i===1?" place":"")} style={present&&i!==active?{display:"none"}:undefined}>
     {i===0&&<div className="country-banner"><img src={asset("brand/oman-flag.jpg")} alt="علم سلطنة عُمان — Oman flag"/><Pair ar="سلطنة عُمان" en="Sultanate of Oman"/></div>}
     {i>1&&i<10&&<div className="visual"><Scene chapter={c} active={i===active} paused={motionPaused} reduced={reduced}/></div>}

     <div className="copy">
       <Pair ar={c.kicker_ar} en={c.kicker_en} className="eyebrow"/>
       {i===0?<h1 id={"title-"+c.id}>{c.title_ar}</h1>:<h2 id={"title-"+c.id}>{c.title_ar}</h2>}
       <p className="title-en" lang="en" dir="ltr">{c.title_en}</p>
       {i===0&&<div id="earth-mobile-slot" aria-hidden="true">{failed&&<div className="mobile-earth-static"><img src={asset("textures/earth-v2/day-4096.webp")} alt=""/></div>}</div>}
       {i===1&&<div id="geography-mobile-slot" aria-hidden="true"/>}
       {c.id!=="site"&&<div className="body-copy tv-lead"><p lang="ar" dir="rtl">{c.body_ar}</p><p className="en" lang="en" dir="ltr">{c.body_en}</p></div>}
       {i>1&&c.id!=="site"&&i!==9&&i!==10&&<ul className="points tv-proof">{c.points.map((p,j)=><li key={j}><Pair ar={p.ar} en={p.en}/></li>)}</ul>}
       {i===9&&!present&&<CityValue/>}{c.id==="site"&&<div id="masterplan-detail-slot"/>}
       {i===0&&<div className="national-note tv-secondary"><Pair ar="رؤية وطنية تُلهم فرصاً محلية للعائلات والسياحة والأعمال." en="A national vision inspiring local opportunities for families, tourism and enterprise."/><a href="https://www.oman2040.om/" target="_blank" rel="noreferrer">رؤية عُمان 2040 · Oman Vision 2040 ↗</a></div>}
       {i===1&&<div className="national-note tv-secondary"><Pair ar="رؤية عُمان 2040" en="Oman Vision 2040"/><Pair ar="جودة الحياة والسياحة وتنويع الاقتصاد." en="Quality of life, tourism and economic diversification."/></div>}
       {!present&&c.note_ar&&i!==10&&c.id!=="site"&&i!==9&&<details className="assumption"><summary><Pair ar="حدود التصور" en="Concept assumptions"/><ChevronDown size={15}/></summary><Pair ar={c.note_ar} en={c.note_en||""}/></details>}
       {i===0&&<button className="primary-button" onClick={()=>go(1)}><Pair ar="اكتشف الرؤية" en="Explore the vision"/><ArrowLeft size={22}/></button>}
       {i===1&&<a className="text-link" href="https://www.google.com/maps/search/?api=1&query=23.64305%2C58.17629" target="_blank" rel="noreferrer"><Pair ar="استكشف الموقع على خرائط جوجل" en="Explore the location on Google Maps"/><ExternalLink size={17}/></a>}
       {c.id==="rides"&&<div className="status-line tv-qualifier"><span/><Pair ar="أهداف مفاهيمية · رهن الجدوى والاعتمادات" en="Concept targets · feasibility and approvals required"/></div>}
       {i>1&&i<10&&<button className="text-link reference-trigger" onClick={()=>setReferences(true)}><Pair ar="حلول من أماكن حقيقية" en="Real-world photo references"/><ExternalLink size={18}/></button>}
       {i===10&&<><div className="decision-points">{c.points.map((p,j)=><Pair key={j} ar={p.ar} en={p.en}/>)}</div><button className="text-link" onClick={()=>setSources(true)}><Pair ar="المراجع وخطوات التحقق" en="Sources and verification steps"/><Info size={18}/></button></>}
     </div>
     {i===0&&<div className="hero-coordinate tv-secondary"><span>23°38′ N &nbsp; 58°10′ E</span><Pair ar="السيب، مسقط" en="Seeb, Muscat"/><small>PROPOSED FAMILY DESTINATION · 2026</small></div>}
     {i===10&&<div className="final-phases"><PhaseColumns/><p className="capital-note tv-qualifier"><Pair ar="رؤية مرحلية؛ الميزانية والتمويل قيد الدراسة." en="Phased concept; budget and funding to be established."/></p></div>}
   </section>)}</main>
   {!hidden?<footer className="dock" dir="ltr">
     <button className="chapter-label" onClick={()=>setMenu(true)} aria-label="اختيار الفصل · Choose chapter"><span className="chapter-count">{String(active+1).padStart(2,"0")}<i>/ {chapters.length}</i></span><Pair ar={names[active][0]} en={names[active][1]}/><ChevronDown size={15}/></button>
     <div className="progress" aria-hidden="true"><span style={{transform:"scaleX("+progress+")"}}/></div>
     <div className="dock-controls">
       <button className="icon-button" onClick={()=>setSources(true)} aria-label="المراجع · Sources"><Info size={18}/></button>
       <button className="icon-button" onClick={()=>setHidden(true)} aria-label="إخفاء أدوات العرض · Hide controls"><EyeOff size={18}/></button>
       <button className="icon-button" onClick={()=>setPaused(!paused)} aria-pressed={paused} aria-label={paused?"تشغيل الحركة · Resume motion":"إيقاف الحركة · Pause motion"}>{paused?<Play size={18}/>:<Pause size={18}/>}</button>
       <span className="dock-divider"/>
       <button className="icon-button" onClick={()=>go(active-1)} disabled={active===0} aria-label="السابق · Previous chapter"><ArrowLeft size={20}/></button>
       <button className="icon-button" onClick={()=>go(active+1)} disabled={active===chapters.length-1} aria-label="التالي · Next chapter"><ArrowRight size={20}/></button>
       <button className={"present-button "+(present?"selected":"")} onClick={togglePresent} aria-label={present?"إنهاء العرض · Exit presentation":"عرض تقديمي · Present"} aria-pressed={present}>{present?<Minimize2 size={17}/>:<Maximize2 size={17}/>}<Pair ar={present?"إنهاء العرض":"عرض تقديمي"} en={present?"Exit presentation":"Present"}/></button>
     </div>
   </footer>:<button className="restore" onClick={()=>setHidden(false)}><Pair ar="إظهار الأدوات" en="Show controls"/></button>}
   <ReferenceGallery open={references} onClose={()=>setReferences(false)} initialArea={referenceArea[chapters[active].id]}/>
   <dialog ref={menuRef} className="dialog chapter-dialog" onCancel={()=>setMenu(false)} onClick={e=>{if(e.target===e.currentTarget)setMenu(false)}}>
     <button className="dialog-close icon-button" onClick={()=>setMenu(false)} aria-label="إغلاق · Close"><X/></button>
     <Pair ar="حكاية المكان" en="The destination story" className="dialog-title"/>
     <div className="chapter-menu">{names.map((n,i)=><button key={i} className={active===i?"selected":""} onClick={()=>go(i)}><span>{String(i+1).padStart(2,"0")}</span><Pair ar={n[0]} en={n[1]}/><ArrowLeft size={18}/></button>)}</div>
   </dialog>
   <dialog ref={sourcesRef} className="dialog sources-dialog" onCancel={()=>setSources(false)} onClick={e=>{if(e.target===e.currentTarget)setSources(false)}}>
     <button className="dialog-close icon-button" onClick={()=>setSources(false)} aria-label="إغلاق · Close"><X/></button>
     <Pair ar="تصور يمكن البناء عليه" en="A concept to develop and verify" className="dialog-title"/>
     <Pair ar="هذه مادة لمناقشة تخصيص الأرض، وليست موافقة على المشروع أو مخططاً هندسياً معتمداً." en="A land allocation discussion concept, not an approved project or an engineering design."/>
     <button className="text-link" onClick={()=>{setSources(false);setReferences(true)}}><Pair ar="افتح صور الحلول حسب المنطقة" en="Open photographs by zone"/><ExternalLink size={18}/></button>
     <ul className="source-list"><li><Pair ar="الرسم الأصلي للمقارنة" en="Original source diagram for comparison"/><a href={asset("media/source-masterplan-diagram.svg")} target="_blank" rel="noreferrer">المخطط الأصلي · Original diagram ↗</a></li><li><Pair ar="البرنامج الموسّع يشمل عجلة ٩٠ متراً وأفعوانية بوميرانغ وقبة. التكلفة والسلامة والسعات لم تُعتمد؛ والتصميم يحتاج إلى عروض ومراجعات هندسية." en="The expanded programme includes a 90-metre wheel, Boomerang looping coaster and dome. Cost, safety and capacities are unapproved; supplier quotations and engineering reviews are required."/></li>
       <li><Pair ar="الموقع: السيب، جنوب شارع السلام قرب شارع الفروسية. المطابقة البصرية لا تثبت الملكية أو الحدود الرسمية." en="Location: Seeb, south of A Salam Street near Al Furusiyyah Street. Visual registration does not establish ownership or official limits."/><a href="https://www.google.com/maps/search/?api=1&query=23.64305%2C58.17629" target="_blank" rel="noreferrer">Google Maps ↗</a></li>
       <li><Pair ar="مجموع مساحات المخطط الأصلي ٣٧ هكتاراً. مساحة الحد المرسوم على الصورة نحو ٥٠٫٤ هكتار؛ يلزم التحقق المساحي والهيدرولوجي والمروري." en="Original zone labels total 37 ha. The image-traced outline is approximately 50.4 ha; survey, hydrology and traffic verification are required."/></li>
       <li><Pair ar="المجسم يستند إلى المخطط الأصلي ونماذج ألعاب مقدمة. الصور التصورية المولدة تشرح الأجواء ولا تثبت المواصفات أو التكلفة." en="The model follows the original diagram and supplied ride models. Generated concept images illustrate atmosphere, not final specifications or cost."/></li>
       <li><Pair ar="موقف ١٬٠٠٠ سيارة هدف للبرنامج. تكلفة المشروع والجدول الزمني والشراكات لم تعتمد." en="1,000 parking spaces is a programme target. Cost, schedule and partnerships are not approved."/></li>
       <li><Pair ar="السياحة وتنويع الاقتصاد: مراجع للسياق، وليست تأييداً لهذا المشروع." en="Tourism and economic diversification: context sources, not endorsement of this proposal."/><a href="https://www.oman2040.om/" target="_blank" rel="noreferrer">Oman Vision 2040 ↗</a><a href="https://mht.gov.om/" target="_blank" rel="noreferrer">Ministry of Heritage and Tourism ↗</a></li>
     </ul>
     <a className="text-link" href={asset("data/geography/credits.html")} target="_blank" rel="noreferrer"><Pair ar="مصادر الخرائط والبيانات" en="Map and data credits"/></a>
     <p className="credits en" dir="ltr">Concept presentation · 2 October 2026. Arabic editorial review pending. Site imagery: Esri, Vantor, Earthstar Geographics, GIS User Community. Earth: NASA. Terrain: Copernicus DEM. Self-hosted open-license fonts.</p>
   </dialog>
 </div>
}
