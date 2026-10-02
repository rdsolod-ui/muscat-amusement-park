"use client";

import { Component, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ErrorInfo, type MutableRefObject, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { ACESFilmicToneMapping, AnimationMixer, Box3, LoopOnce, LoopRepeat, MathUtils, PerspectiveCamera, Vector3, type AnimationAction } from "three";
import { asset } from "@/lib/assets";
import styles from "./WheelConstruction.module.css";

export interface WheelConstructionProps {
  active: boolean;
  paused: boolean;
  reduced: boolean;
}

const MODEL = "models/muscat-wheel-v4.glb";
const BACKGROUND = "media/v4/wheel-mountains.webp";
const POSTER = "media/v4/wheel-poster.webp";
const CONSTRUCTION_CLIP = "Wheel_Construction";
const ROTATION_CLIP = "Wheel_Rotation";

// The labels describe a presentation reveal, not an engineering erection method.
const PHASES = [
  { from: 0, ar: "الأساسات", en: "Foundations" },
  { from: 2, ar: "الهيكل الداعم", en: "Support structure" },
  { from: 5, ar: "إطار العجلة", en: "The rim takes shape" },
  { from: 8, ar: "أشعة العجلة", en: "Spokes" },
  { from: 10.5, ar: "الكبائن", en: "Cabins" },
  { from: 15, ar: "إطلالة جديدة على مسقط", en: "A new view of Muscat" },
] as const;
type Playback = { elapsed: number; rotation: number; complete: boolean };
type Simulation = { mixer: AnimationMixer; construction: AnimationAction; rotation: AnimationAction; duration: number };

class WheelBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(_error: Error, _info: ErrorInfo) { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function WheelModel({ running, playback, onReady, onPhase, onFailure }: {
  running: boolean;
  playback: MutableRefObject<Playback>;
  onReady: () => void;
  onPhase: (phase: number) => void;
  onFailure: () => void;
}) {
  const { scene, animations } = useGLTF(asset(MODEL));
  // Only transforms are animated. Share the cached immutable geometry/materials.
  const model = useMemo(() => scene.clone(true), [scene]);
  const { camera, size, gl, invalidate } = useThree();
  const simulation = useRef<Simulation | null>(null);
  const completedBounds = useRef(new Box3());
  const offset = useRef(new Vector3());
  const lastPhase = useRef(-1);
  const ready = useRef(false);
  const callbacks = useRef({ onReady, onPhase, onFailure });
  callbacks.current = { onReady, onPhase, onFailure };
  const [placement, setPlacement] = useState<[number, number, number]>([0, 0, 0]);

  useLayoutEffect(() => {
    const constructionClip = animations.find(clip => clip.name === CONSTRUCTION_CLIP);
    const rotationClip = animations.find(clip => clip.name === ROTATION_CLIP);
    if (!constructionClip || !rotationClip) throw new Error("The Muscat wheel animation clips are missing");
    const mixer = new AnimationMixer(model);
    const construction = mixer.clipAction(constructionClip);
    const rotation = mixer.clipAction(rotationClip);
    construction.setLoop(LoopOnce, 1);
    construction.clampWhenFinished = true;
    rotation.setLoop(LoopRepeat, Infinity);
    construction.play();
    // Fit the complete 90 m assembly, not the near-zero initial construction pose.
    construction.time = constructionClip.duration;
    construction.paused = true;
    mixer.update(0);
    model.updateMatrixWorld(true);
    completedBounds.current.setFromObject(model);
    if (completedBounds.current.isEmpty()) throw new Error("The Muscat wheel has no visible geometry");
    completedBounds.current.getCenter(offset.current).multiplyScalar(-1);
    setPlacement([offset.current.x, offset.current.y, offset.current.z]);
    completedBounds.current.translate(offset.current);
    construction.reset().play();
    construction.time = Math.min(playback.current.elapsed, constructionClip.duration);
    if (playback.current.complete || playback.current.elapsed >= constructionClip.duration) {
      construction.time = constructionClip.duration;
      construction.paused = true;
      playback.current.complete = true;
      rotation.play();
      rotation.time = playback.current.rotation % rotationClip.duration;
    }
    mixer.update(0);
    simulation.current = { mixer, construction, rotation, duration: constructionClip.duration };
    ready.current = false;
    lastPhase.current = -1;
    invalidate();
    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(model);
      simulation.current = null;
    };
  }, [animations, model, playback, invalidate]);

  useLayoutEffect(() => {
    if (!simulation.current || size.width < 1 || size.height < 1) return;
    const cam = camera as PerspectiveCamera;
    const direction = new Vector3(.17, .035, 1).normalize();
    const right = new Vector3().crossVectors(new Vector3(0, 1, 0), direction).normalize();
    const up = new Vector3().crossVectors(direction, right).normalize();
    const tan = Math.tan(MathUtils.degToRad(cam.fov) / 2);
    const aspect = size.width / size.height;
    const bounds = completedBounds.current;
    const corner = new Vector3();
    let distance = 1;
    for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
      corner.set(x, y, z);
      const depth = corner.dot(direction);
      distance = Math.max(distance, depth + Math.abs(corner.dot(right)) / (tan * aspect), depth + Math.abs(corner.dot(up)) / tan);
    }
    distance *= 1.12;
    cam.position.copy(direction.multiplyScalar(distance));
    cam.near = Math.max(.1, distance / 100);
    cam.far = Math.max(1000, distance * 8);
    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
    invalidate();
  }, [camera, size, model, invalidate]);

  useEffect(() => { invalidate(); }, [running, invalidate]);
  useEffect(() => {
    const lost = (event: Event) => { event.preventDefault(); callbacks.current.onFailure(); };
    gl.domElement.addEventListener("webglcontextlost", lost);
    return () => gl.domElement.removeEventListener("webglcontextlost", lost);
  }, [gl]);

  useFrame((_state, delta) => {
    const sim = simulation.current;
    if (!sim) return;
    if (running && !document.hidden) {
      const step = Math.min(delta, .05);
      if (!playback.current.complete) {
        // Clamp this frame at the construction endpoint so operation starts without a jump.
        const advance = Math.min(step, Math.max(0, sim.duration - playback.current.elapsed));
        sim.mixer.update(advance);
        playback.current.elapsed += advance;
        if (playback.current.elapsed >= sim.duration - .0001) {
          playback.current.complete = true;
          playback.current.elapsed = sim.duration;
          sim.construction.time = sim.duration;
          sim.construction.paused = true;
          sim.rotation.reset().play();
          sim.mixer.update(0);
        }
      } else {
        sim.mixer.update(step);
        playback.current.rotation += step;
      }
      invalidate();
    }
    const phase = playback.current.complete ? 5 : Math.min(4, PHASES.reduce((result, item, index) => playback.current.elapsed >= item.from ? index : result, 0));
    if (phase !== lastPhase.current) { lastPhase.current = phase; callbacks.current.onPhase(phase); }
    if (!ready.current) { ready.current = true; callbacks.current.onReady(); }
  });

  return <group position={placement}><primitive object={model} dispose={null} /></group>;
}

/** Actual Blender-authored Muscat wheel; no Salalah sea or substitute geometry. */
export default function WheelConstruction({ active, paused, reduced }: WheelConstructionProps) {
  const frame = useRef<HTMLElement>(null);
  const playback = useRef<Playback>({ elapsed: 0, rotation: 0, complete: false });
  const [activated, setActivated] = useState(false);
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(true);
  const [graphicsOff, setGraphicsOff] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState(0);
  const [posterFailed, setPosterFailed] = useState(false);
  const [backgroundFailed, setBackgroundFailed] = useState(false);
  const markReady = useCallback(() => setReady(true), []);
  const markFailure = useCallback(() => { setFailed(true); setReady(false); }, []);
  useEffect(() => { if (active) setActivated(true); }, [active]);
  useEffect(() => {
    setGraphicsOff(new URLSearchParams(window.location.search).get("graphics") === "off");
    const update = () => setVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: .08 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (reduced) {
      playback.current.complete = true;
      setPhase(5);
      setReady(false);
    }
  }, [reduced]);
  const staticMode = reduced || graphicsOff || failed;
  const running = active && inView && visible && !paused && !staticMode;
  const displayPhase = staticMode ? 5 : phase;
  const showModel = activated && !staticMode;
  const showPoster = staticMode || !ready;
  const label = PHASES[displayPhase];

  return <figure ref={frame} className={"scene scene-rides " + styles.frame}
    data-wheel-mode={staticMode ? "static" : ready ? "animated-model" : "loading"}
    data-wheel-stage={displayPhase} data-wheel-running={running}>
    <div className={styles.stage} aria-hidden="true">
      {!backgroundFailed && <img className={styles.background} src={asset(BACKGROUND)} alt="" loading="lazy" onError={() => setBackgroundFailed(true)} />}
      <div className={styles.atmosphere} />
      {showPoster && <img className={styles.poster} src={asset(posterFailed ? "media/v3/rides.webp" : POSTER)} alt="" loading="lazy"
        style={{ objectFit: posterFailed ? "cover" : "contain" }} onError={() => { if (!posterFailed) setPosterFailed(true); }} />}
      {showModel && <div className={styles.canvas} style={{ opacity: ready ? 1 : 0 }}>
        <WheelBoundary onFailure={markFailure}>
          <Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ fov: 38, position: [20, 5, 150], near: .1, far: 1500 }}
            gl={{ alpha: true, antialias: true, powerPreference: "low-power", toneMapping: ACESFilmicToneMapping }} fallback={null}>
            <ambientLight intensity={1.1} />
            <hemisphereLight args={["#dce9e7", "#af9374", 1.5]} />
            <directionalLight position={[-70, 100, 100]} intensity={3.1} />
            <directionalLight position={[65, 40, -50]} intensity={1.2} />
            <Suspense fallback={null}><WheelModel running={running} playback={playback} onReady={markReady} onPhase={setPhase} onFailure={markFailure} /></Suspense>
          </Canvas>
        </WheelBoundary>
      </div>}
    </div>
    <figcaption className={styles.caption}>
      <div className={styles.phases} aria-hidden="true">{PHASES.map((item, index) => <span key={item.en} data-complete={index <= displayPhase} />)}</div>
      <span className={styles.phaseAr} lang="ar" dir="rtl">{label.ar}</span>
      <span className={styles.phaseEn} lang="en" dir="ltr">{label.en}</span>
      <span className={styles.note} lang="en" dir="ltr">{staticMode || !ready ? "Concept visualization" : "Concept model · illustrative assembly"}</span>
    </figcaption>
  </figure>;
}
