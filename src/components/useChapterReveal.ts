"use client";
import {useEffect,useLayoutEffect,useRef,type RefObject} from "react";
import {gsap} from "gsap";

/** Animate whole Arabic blocks: character splitting would break joined glyphs. */
export function useChapterReveal(root:RefObject<HTMLDivElement|null>,active:number,present:boolean,paused:boolean,reduced:boolean){
 const timeline=useRef<gsap.core.Timeline|null>(null);
 const pausedRef=useRef(paused);pausedRef.current=paused;
 useLayoutEffect(()=>{
  const copy=root.current?.querySelector<HTMLElement>(".chapter.is-active .copy");
  if(!copy)return;
  const title=copy.querySelector("h1,h2");
  const eyebrow=copy.querySelector(".eyebrow");
  const english=copy.querySelector(".title-en");
  const supporting=Array.from(copy.querySelectorAll(":scope > .body-copy, :scope > .points, :scope > .national-note, :scope > .decision-points, :scope > .primary-button, :scope > .text-link, :scope > .status-line"));
  const targets=[eyebrow,title,english,...supporting].filter(Boolean) as Element[];
  if(reduced||pausedRef.current){gsap.set(targets,{clearProps:"opacity,visibility,transform,clipPath"});return;}
  const context=gsap.context(()=>{
   const tl=gsap.timeline({defaults:{ease:"power3.out"}});
   if(eyebrow)tl.fromTo(eyebrow,{autoAlpha:0,x:14},{autoAlpha:1,x:0,duration:.65},0);
   if(title)tl.fromTo(title,{autoAlpha:0,x:24,clipPath:"inset(0 0 0 100%)"},{autoAlpha:1,x:0,clipPath:"inset(0 0 0 0%)",duration:1.05},.09);
   if(english)tl.fromTo(english,{autoAlpha:0,x:18},{autoAlpha:1,x:0,duration:.85},.32);
   if(supporting.length)tl.fromTo(supporting,{autoAlpha:0,y:14},{autoAlpha:1,y:0,duration:.78,stagger:.075},.45);
   timeline.current=tl;
  },copy);
  return()=>{timeline.current=null;context.revert();};
 },[root,active,present,reduced]);
 // The text remains readable if a viewer pauses during its reveal.
 useEffect(()=>{if(paused)timeline.current?.progress(1).pause();},[paused]);
}
