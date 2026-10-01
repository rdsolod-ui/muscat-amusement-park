"use client";
import {useEffect,useRef,useState} from "react";
import {ExternalLink,X} from "lucide-react";
import {asset} from "@/lib/assets";
import "./ReferenceGallery.css";
type Area={id:string;title_ar?:string;title_en:string;title_ru?:string;brief_ar?:string;brief_en?:string;reference_ids:string[]};
type Reference={id:string;area_ids:string[];title:string;title_ar?:string;title_en?:string;source_name:string;source_url:string;image_url:string;credit:string;why_relevant?:string;why_relevant_ar?:string;why_relevant_en?:string;rights:{status:string;license?:string;license_url?:string|null;redistribution_allowed?:boolean}};
type Catalogue={areas:Area[];references:Reference[]};
export default function ReferenceGallery({open,onClose,initialArea}:{open:boolean;onClose:()=>void;initialArea?:string}){
 const dialog=useRef<HTMLDialogElement>(null);
 const [data,setData]=useState<Catalogue|null>(null),[error,setError]=useState(false),[selected,setSelected]=useState(initialArea||"parking");
 useEffect(()=>{if(open){dialog.current?.showModal();setSelected(initialArea||"parking")}else dialog.current?.close()},[open,initialArea]);
 useEffect(()=>{if(!open||data)return;setError(false);const abort=new AbortController();fetch(asset("data/design-references.json"),{signal:abort.signal}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(result=>{setData(result);setError(false)}).catch(e=>{if(e.name!=="AbortError")setError(true)});return()=>abort.abort()},[open,data]);
 const current=data?.areas.find(a=>a.id===selected)||data?.areas[0];
 const refs=data?.references.filter(r=>current?.reference_ids.includes(r.id)||r.area_ids.includes(current?.id||""))||[];
 return <dialog ref={dialog} className="reference-gallery" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose()}} aria-labelledby="reference-gallery-title">
  <div className="reference-top"><div><h2 id="reference-gallery-title">حلول من أماكن حقيقية</h2><p lang="en" dir="ltr">Real places. Design references.</p></div><button className="icon-button" onClick={onClose} aria-label="إغلاق الصور · Close references"><X/></button></div>
  <p className="reference-intro">صور مرجعية لأماكن قائمة، وليست صوراً للمشروع المقترح.<span lang="en" dir="ltr">Existing places, not photographs of the proposed Muscat park. Images load from their credited sources.</span></p>
  {!data&&!error&&<p role="status">تحميل المراجع · Loading references…</p>}
  {error&&<p role="alert">تعذر تحميل الفهرس · The reference catalogue could not load.</p>}
  {data&&<><nav className="reference-areas" aria-label="مناطق المراجع · Reference zones">{data.areas.map(a=><button key={a.id} className={a.id===current?.id?"selected":""} aria-pressed={a.id===current?.id} onClick={()=>setSelected(a.id)}><span lang="ar">{a.title_ar||a.title_en}</span><span lang="en" dir="ltr">{a.title_en}</span></button>)}</nav>
  <section className="reference-area"><h3>{current?.title_ar||current?.title_en}<span lang="en" dir="ltr">{current?.title_en}</span></h3><p>{current?.brief_ar}<span lang="en" dir="ltr">{current?.brief_en}</span></p>
   <div className="reference-photos">{refs.map(r=><figure key={r.id}><a className="reference-photo-link" href={r.source_url} target="_blank" rel="noreferrer"><img src={r.image_url} alt={r.title_ar||r.title_en||r.title} loading="lazy" referrerPolicy="no-referrer" onError={e=>{e.currentTarget.style.display="none";e.currentTarget.parentElement?.classList.add("photo-unavailable")}}/><span className="photo-link-fallback">شاهد الصورة لدى المصدر · View photograph at source ↗</span></a><figcaption><h4>{r.title_ar||r.title_en||r.title}</h4><p lang="en" dir="ltr">{r.title_en||r.title}</p><p>{r.why_relevant_ar}<span lang="en" dir="ltr">{r.why_relevant_en||r.why_relevant}</span></p><a href={r.source_url} target="_blank" rel="noreferrer"><span>{r.source_name}</span><ExternalLink size={15}/></a><small lang="en" dir="ltr">{r.credit} · {r.rights.license_url?<a href={r.rights.license_url} target="_blank" rel="noreferrer">{r.rights.license}</a>:"Reference only; rights remain with the source."}</small></figcaption></figure>)}</div>
  </section></>}
 </dialog>
}