"use client";

import { Component, useEffect, useMemo, useRef, useState, type ErrorInfo, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { createPortal } from "react-dom";
import { PlaneGeometry, SRGBColorSpace, Texture, Vector3 } from "three";
import { assetPath } from "@/lib/asset-path";
import styles from "./GeographyJourney.module.css";

export const JOURNEY_DURATION = 12;
const IMAGE = "/data/geography/muscat-satellite.webp";
const ELEVATION = "/data/geography/muscat-terrain.json";
const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (from: number, to: number, value: number) => {
  const t = clamp((value - from) / (to - from));
  return t * t * (3 - 2 * t);
};
type Terrain = { gridSize: number; widthMeters: number; heightMeters: number; heights: number[] };
type Prepared = { terrain: Terrain; image: HTMLImageElement };
let prepared: Promise<Prepared> | null = null;
let preparedState: "idle" | "loading" | "ready" | "failed" = "idle";

/** One same-origin image and height grid, shared between preload and the mounted scene. */
function prepareGeography() {
  if (prepared) return prepared;
  preparedState = "loading";
  prepared = new Promise<Prepared>((resolve, reject) => {
    const abort = new AbortController();
    const timeout = window.setTimeout(() => { abort.abort(); reject(new Error("Satellite preparation timed out")); }, 15000);
    const photo = new Image();
    const imageReady = new Promise<HTMLImageElement>((yes, no) => {
      photo.onload = () => yes(photo);
      photo.onerror = () => no(new Error("Satellite image unavailable"));
      photo.src = assetPath(IMAGE);
    });
    const terrainReady = fetch(assetPath(ELEVATION), { signal: abort.signal })
      .then(response => { if (!response.ok) throw new Error("Terrain unavailable"); return response.json() as Promise<Terrain>; })
      .then(data => {
        if (data.gridSize !== 129 || data.heights.length !== 129 * 129 || data.widthMeters !== 32000 ||
          data.heightMeters !== 32000 || !data.heights.every(Number.isFinite)) throw new Error("Invalid terrain grid");
        return data;
      });
    Promise.all([terrainReady, imageReady]).then(([terrain, image]) => resolve({ terrain, image }), reject)
      .finally(() => window.clearTimeout(timeout));
  }).then(value => { preparedState = "ready"; return value; }, error => { preparedState = "failed"; throw error; });
  return prepared;
}

/** A single automatic trip; pause keeps time, reduced motion settles immediately. */
export function useGeographyJourney(active: boolean, paused: boolean, reduced: boolean) {
  const [stage, setStage] = useState(reduced ? 1 : 0);
  const elapsed = useRef(0);
  const wasActive = useRef(false);
  useEffect(() => {
    if (!active) { wasActive.current = false; return; }
    void prepareGeography().catch(() => {});
    if (!wasActive.current) { elapsed.current = reduced ? JOURNEY_DURATION : 0; wasActive.current = true; }
    if (reduced) { elapsed.current = JOURNEY_DURATION; setStage(1); return; }
    setStage(elapsed.current / JOURNEY_DURATION);
    if (paused || elapsed.current >= JOURNEY_DURATION) return;
    let handle = 0, previous = 0;
    const tick = (time: number) => {
      const delta = previous ? Math.min((time - previous) / 1000, .05) : 0;
      previous = time;
      // Keep the Earth approach while assets prepare. Failure releases the useful static fallback.
      const waiting = preparedState === "loading" && elapsed.current >= 2.2;
      if (!document.hidden && !waiting) elapsed.current = Math.min(JOURNEY_DURATION, elapsed.current + delta);
      setStage(elapsed.current / JOURNEY_DURATION);
      if (elapsed.current < JOURNEY_DURATION) handle = requestAnimationFrame(tick);
    };
    handle = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(handle);
  }, [active, paused, reduced]);
  return stage;
}

class SatelliteBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(_error: Error, _info: ErrorInfo) { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function SatelliteSurface({ data, stage, onReady, onFailure }: { data: Prepared; stage: number; onReady: () => void; onFailure: () => void }) {
  const { camera, gl, invalidate, size } = useThree();
  const ready = useRef(false);
  const callback = useRef({ onReady, onFailure });
  callback.current = { onReady, onFailure };
  const texture = useMemo(() => {
    const value = new Texture(data.image);
    value.colorSpace = SRGBColorSpace;
    value.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    value.needsUpdate = true;
    return value;
  }, [data, gl]);
  const geometry = useMemo(() => {
    const result = new PlaneGeometry(32, 32, data.terrain.gridSize - 1, data.terrain.gridSize - 1);
    const positions = result.attributes.position;
    for (let i = 0; i < positions.count; i++) positions.setZ(i, data.terrain.heights[i] / 1000);
    result.computeVertexNormals();
    return result;
  }, [data]);
  const target = useMemo(() => new Vector3(0, data.terrain.heights[64 * 129 + 64] / 1000, 0), [data]);
  useEffect(() => () => { geometry.dispose(); texture.dispose(); }, [geometry, texture]);
  useEffect(() => { invalidate(); }, [stage, size, invalidate]);
  useEffect(() => {
    const lost = (event: Event) => { event.preventDefault(); callback.current.onFailure(); };
    gl.domElement.addEventListener("webglcontextlost", lost);
    return () => gl.domElement.removeEventListener("webglcontextlost", lost);
  }, [gl]);
  useFrame(() => {
    const zoom = smooth(.23, .94, stage);
    const tilt = smooth(.44, .95, stage);
    const distance = 29 * Math.pow(7.6 / 29, zoom);
    const angle = (3 + tilt * 52) * Math.PI / 180;
    camera.position.set(0, Math.cos(angle) * distance + target.y, Math.sin(angle) * distance);
    camera.lookAt(target);
    camera.updateMatrixWorld();
    if (!ready.current) { ready.current = true; callback.current.onReady(); }
  }, -1);
  return <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
    <meshBasicMaterial map={texture} toneMapped={false} />
  </mesh>;
}

export default function GeographyJourney({ active, stage, staticView = false }: { active: boolean; stage: number; staticView?: boolean }) {
  const [data, setData] = useState<Prepared | null>(null);
  const [failed, setFailed] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [graphicsOff, setGraphicsOff] = useState(false);
  const [embeddedHost, setEmbeddedHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!active) return;
    const mobile = window.matchMedia("(max-width: 900px)");
    const update = () => setEmbeddedHost(mobile.matches ? document.getElementById("geography-mobile-slot") : null);
    update(); mobile.addEventListener("change", update);
    return () => mobile.removeEventListener("change", update);
  }, [active]);
  useEffect(() => {
    if (!active) return;
    setGraphicsOff(new URLSearchParams(window.location.search).get("graphics") === "off");
    let cancelled = false;
    prepareGeography().then(value => { if (!cancelled) setData(value); }, () => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [active]);
  if (!active) return null;
  const use3D = !staticView && !graphicsOff && !failed && data !== null;
  const alpha = smooth(.16, .34, stage);
  const descent = smooth(.23, .94, stage);
  const mode = use3D && ready ? "terrain-3d" : photoFailed ? "map-fallback" : "satellite-static";
  const label = stage < .36 ? "MUSCAT / SEEB" : stage < .72 ? "CITY TO SITE" : "PROPOSED PARK SITE";
  const scene = <div className={styles.journey} style={{ opacity: alpha }} data-geography-embedded={Boolean(embeddedHost)} data-geography-stage={stage.toFixed(3)}
    data-geography-mode={mode} data-geography-tilt={(3 + smooth(.44, .95, stage) * 52).toFixed(1)}>
    <div className={styles.mapFrame}>
      <div className={styles.surface}>
        {!photoFailed ? <img className={styles.satellite} src={assetPath(IMAGE)} alt="Esri World Imagery of Muscat and Seeb, centred on the proposed park site; acquisition dates vary"
          width={3200} height={3200} onError={() => setPhotoFailed(true)} style={{ transform: "scale(" + (1 + descent * 1.9) + ")" }} />
          : <img className={styles.cartographic} src={assetPath("/media/site-evidence.svg")} alt="Registered Muscat site reference; screenshot-traced proposal, not a surveyed boundary" />}
        {use3D && <div className={styles.canvas} style={{ opacity: ready ? 1 : 0 }}>
          <SatelliteBoundary onFailure={() => setFailed(true)}>
            <Canvas frameloop="demand" dpr={[1, 1.5]} flat camera={{ position: [0, 29, .01], fov: 38, near: .01, far: 120 }}
              gl={{ alpha: true, antialias: true, powerPreference: "low-power" }} fallback={null}>
              <SatelliteSurface data={data} stage={stage} onReady={() => setReady(true)} onFailure={() => setFailed(true)} />
            </Canvas>
          </SatelliteBoundary>
        </div>}
        <div className={styles.mapShade} />
        <div className={styles.pin}><i /><span /></div>
        <div className={styles.placeName}>
          <span lang="ar" dir="rtl">الموقع المقترح</span><strong>MUSCAT FAMILY PARK</strong>
          <small dir="ltr" lang="en">23.64305° N · 58.17629° E</small>
        </div>
        <div className={styles.north}><span>N</span><i /></div>
        <div className={styles.sea}>MUSCAT · SULTANATE OF OMAN</div>
      </div>
      <div className={styles.source}>
        <span>{"Source: Esri, Vantor, Earthstar Geographics, GIS User Community"}</span>
        <span>{photoFailed ? "Registered site reference · approximate outline" : "World Imagery composite · Copernicus terrain"}</span>
        <span>Approximate location · no surveyed site boundary</span>
      </div>
    </div>
    <div className={styles.scale}><span>{label}</span><div><i style={{ width: (36 + descent * 52) + "%" }} /></div>
      <small>{stage < .44 ? "SATELLITE OBSERVATION" : mode === "terrain-3d" ? "SITE PERSPECTIVE" : "SITE LOCATION"}</small></div>
  </div>;
  return embeddedHost ? createPortal(scene, embeddedHost) : scene;
}
