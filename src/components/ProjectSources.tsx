"use client";
import sources from "../../public/data/project-sources-v5.json";
function Bilingual({ar,en}:{ar:string;en:string}){return <span className="pair"><span lang="ar" dir="rtl">{ar}</span><span className="en" lang="en" dir="ltr">{en}</span></span>;}
function Status({value}:{value:string}){const label=sources.statusLabels[value as keyof typeof sources.statusLabels];return label?<span className={"source-status source-status-"+value}><Bilingual ar={label.ar} en={label.en}/></span>:null;}
/** Public evidence only: private paths, meeting transcripts and host details stay outside the site. */
export default function ProjectSources(){return <section className="project-evidence" aria-labelledby="project-evidence-heading">
 <h3 id="project-evidence-heading"><Bilingual ar={sources.heading.ar} en={sources.heading.en}/></h3>
 <Bilingual ar={sources.introduction.ar} en={sources.introduction.en}/>
 <ul className="source-list project-source-list">{sources.sources.map(source=><li key={source.id}>
  <Status value={source.status}/><h4><Bilingual ar={source.title.ar} en={source.title.en}/></h4>
  <Bilingual ar={source.summary.ar} en={source.summary.en}/>
  <div className="source-limit"><Bilingual ar={source.limit.ar} en={source.limit.en}/></div>
  <a href={source.url} target="_blank" rel="noreferrer" lang="en" dir="ltr">{source.publisher}{"publishedAt" in source?" · "+source.publishedAt:""} ↗</a>
 </li>)}</ul>
 <ul className="source-list project-claims">{sources.claims.map(claim=><li key={claim.id}><Status value={claim.status}/><h4><Bilingual ar={claim.title.ar} en={claim.title.en}/></h4><Bilingual ar={claim.summary.ar} en={claim.summary.en}/></li>)}</ul>
 <div className="source-image-provenance"><h4><Bilingual ar={sources.imageProvenance.title.ar} en={sources.imageProvenance.title.en}/></h4><Bilingual ar={sources.imageProvenance.original.ar} en={sources.imageProvenance.original.en}/><Bilingual ar={sources.imageProvenance.interpretations.ar} en={sources.imageProvenance.interpretations.en}/></div>
 <p className="source-check-date" lang="en" dir="ltr">Sources checked: {sources.checkedAt}</p>
 </section>;}
