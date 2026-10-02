"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { asset } from "@/lib/assets";

const MODEL = "models/muscat-park-v4.glb";
const CONSTRUCTION = "Park_Construction";
const ROTATION = "Wheel_Rotation";

type PositionAttribute = THREE.BufferAttribute | THREE.InterleavedBufferAttribute;
type CompletedMesh = { position: PositionAttribute; matrix: THREE.Matrix4; context: boolean };
// Retain the complete parcel and existing northeast junction while allowing the
// long external road stubs to extend beyond the presentation frame.
const contextEnvelope = new THREE.Box3(new THREE.Vector3(-690, -100, -480), new THREE.Vector3(630, 160, 395));
type Playback = {
  mixer: THREE.AnimationMixer;
  construction: THREE.AnimationAction;
  rotation: THREE.AnimationAction;
  duration: number;
  elapsed: number;
  complete: boolean;
};

export interface ParkViewerProps {
  active: boolean;
  reduced: boolean;
  paused?: boolean;
  /** Increment to replay construction without reloading the cached geometry. */
  replayKey?: number;
}

function DepthRange() {
  const camera = useThree(state => state.camera) as THREE.PerspectiveCamera;
  useFrame(() => {
    const near = Math.max(.1, Math.min(10, camera.position.length() / 500));
    if (Math.abs(camera.near - near) > .001) {
      camera.near = near;
      camera.far = 30000;
      camera.updateProjectionMatrix();
    }
  });
  return null;
}

function Model({ running, reduced, replayKey, onComplete }: {
  running: boolean;
  reduced: boolean;
  replayKey: number;
  onComplete: (complete: boolean) => void;
}) {
  const { scene, animations } = useGLTF(asset(MODEL));
  // The GLB animates rigid transforms, not skeletons. Keep cached buffers immutable.
  const model = useMemo(() => scene.clone(true), [scene]);
  const { camera, size, invalidate } = useThree();
  const playback = useRef<Playback | null>(null);
  const completedMeshes = useRef<CompletedMesh[]>([]);
  const center = useRef(new THREE.Vector3());
  const [placement, setPlacement] = useState<[number, number, number]>([0, 0, 0]);

  useLayoutEffect(() => {
    const constructionClip = animations.find(clip => clip.name === CONSTRUCTION);
    const rotationClip = animations.find(clip => clip.name === ROTATION);
    if (!constructionClip || !rotationClip) throw new Error("MAP v4 construction clips are missing");
    const mixer = new THREE.AnimationMixer(model);
    const construction = mixer.clipAction(constructionClip);
    const rotation = mixer.clipAction(rotationClip);
    construction.setLoop(THREE.LoopOnce, 1);
    construction.clampWhenFinished = true;
    rotation.setLoop(THREE.LoopRepeat, Infinity);
    construction.play();
    construction.time = constructionClip.duration;
    construction.paused = true;
    mixer.update(0);
    model.updateMatrixWorld(true);

    // Capture completed vertex transforms before resetting the reveal. A fit of
    // the initial near-zero scale pose would crop the finished park and junction.
    const meshes: CompletedMesh[] = [];
    const parentInverse = model.parent ? model.parent.matrixWorld.clone().invert() : new THREE.Matrix4();
    const bounds = new THREE.Box3();
    const vertex = new THREE.Vector3();
    model.traverse(object => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) return;
      const position = mesh.geometry.getAttribute("position");
      if (!position) return;
      const matrix = parentInverse.clone().multiply(mesh.matrixWorld);
      const context = /^V4[_ ](junction[_ ]connection|road[_ ]lane)/.test(mesh.name);
      meshes.push({ position, matrix, context });
      for (let i = 0; i < position.count; i++) {
        vertex.fromBufferAttribute(position, i).applyMatrix4(matrix);
        if (!context || contextEnvelope.containsPoint(vertex)) bounds.expandByPoint(vertex);
      }
    });
    if (bounds.isEmpty()) throw new Error("MAP v4 has no geometry to display");
    bounds.getCenter(center.current);
    completedMeshes.current = meshes;
    setPlacement([-center.current.x, -center.current.y, -center.current.z]);

    construction.reset().play();
    mixer.update(0);
    playback.current = { mixer, construction, rotation, duration: constructionClip.duration, elapsed: 0, complete: false };
    onComplete(false);
    invalidate();
    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(model);
      playback.current = null;
    };
  }, [animations, model, replayKey, onComplete, invalidate]);

  useLayoutEffect(() => {
    if (!completedMeshes.current.length || size.width < 1 || size.height < 1) return;
    const cam = camera as THREE.PerspectiveCamera;
    const direction = new THREE.Vector3(.56, .72, .63).normalize();
    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), direction).normalize();
    const up = new THREE.Vector3().crossVectors(direction, right).normalize();
    const tan = Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2);
    const aspect = size.width / size.height;
    const vertex = new THREE.Vector3();
    let fit = 1;
    // Project real transformed vertices rather than the empty corners of a large
    // rotated AABB. This retains the proven v3 fit on wide and portrait screens.
    for (const { position, matrix, context } of completedMeshes.current) {
      for (let i = 0; i < position.count; i++) {
        vertex.fromBufferAttribute(position, i).applyMatrix4(matrix);
        if (context && !contextEnvelope.containsPoint(vertex)) continue;
        vertex.sub(center.current);
        const depth = vertex.dot(direction);
        fit = Math.max(fit, depth + Math.abs(vertex.dot(right)) / (tan * aspect), depth + Math.abs(vertex.dot(up)) / tan);

      }
    }
    fit *= 1.10;
    cam.position.copy(direction.multiplyScalar(fit));
    cam.near = Math.max(.1, Math.min(10, fit / 500));
    cam.far = 30000;
    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
    invalidate();
  }, [camera, size.width, size.height, model, replayKey, invalidate]);

  useLayoutEffect(() => {
    const sim = playback.current;
    if (!sim || !reduced) return;
    // Reduced motion opens the finished park and never starts automatic orbit.
    sim.construction.time = sim.duration;
    sim.construction.paused = true;
    sim.elapsed = sim.duration;
    sim.complete = true;
    sim.rotation.paused = true;
    sim.mixer.update(0);
    onComplete(true);
    invalidate();
  }, [reduced, model, replayKey, onComplete, invalidate]);

  useEffect(() => { invalidate(); }, [running, invalidate]);
  useFrame((_state, delta) => {
    const sim = playback.current;
    if (!sim || !running || document.hidden) return;
    // No catch-up jump after a paused or backgrounded tab.
    const step = Math.min(delta, .05);
    if (!sim.complete) {
      const advance = Math.min(step, Math.max(0, sim.duration - sim.elapsed));
      sim.mixer.update(advance);
      sim.elapsed += advance;
      if (sim.elapsed >= sim.duration - .0001) {
        sim.elapsed = sim.duration;
        sim.complete = true;
        sim.construction.time = sim.duration;
        sim.construction.paused = true;
        sim.rotation.reset().play();
        sim.mixer.update(0);
        onComplete(true);
      }
    } else {
      if (!sim.rotation.isRunning()) { sim.rotation.paused = false; sim.rotation.play(); }
      sim.mixer.update(step);
    }
  });

  return <group position={placement}><primitive object={model} dispose={null} /></group>;
}

function ParkControls({ active, paused, hidden, running, complete }: { active: boolean; paused: boolean; hidden: boolean; running: boolean; complete: boolean }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const [dragging, setDragging] = useState(false);
  const orbitTime = useRef(0);
  const offset = useMemo(() => new THREE.Vector3(), []);
  const axis = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  // A bounded five-degree sway keeps the whole park readable. Manual rotation
  // remains unrestricted; pause/drag freezes the automatic camera movement.
  useFrame(({ camera }, delta) => {
    if (!controls.current || !running || !complete || dragging) return;
    const previous = Math.sin(orbitTime.current * .065);
    orbitTime.current += Math.min(delta, .05);
    const angle = (Math.sin(orbitTime.current * .065) - previous) * THREE.MathUtils.degToRad(5);
    offset.copy(camera.position).sub(controls.current.target).applyAxisAngle(axis, angle);
    camera.position.copy(controls.current.target).add(offset);
  }, -2);
  return <OrbitControls ref={controls} makeDefault enabled={active && !paused && !hidden} enableDamping={running} dampingFactor={.1} enablePan autoRotate={false} onStart={() => setDragging(true)} onEnd={() => setDragging(false)} maxPolarAngle={Math.PI / 2.15} minDistance={40} maxDistance={15000} target={[0, 0, 0]} />;
}

export default function ParkViewer({ active, reduced, paused = false, replayKey = 0 }: ParkViewerProps) {
  const [hidden, setHidden] = useState(false);
  const [complete, setComplete] = useState(false);
  const onComplete = useCallback((value: boolean) => setComplete(value), []);
  useEffect(() => {
    const update = () => setHidden(document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  const running = active && !paused && !reduced && !hidden;

  return <Canvas frameloop={running ? "always" : "demand"} dpr={[1, 1.5]} camera={{ fov: 40, position: [700, 900, 700], near: 1, far: 30000 }} gl={{ antialias: true, alpha: true, powerPreference: "low-power" }} onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1; }}>
    <DepthRange />
    <ambientLight intensity={.85} />
    <directionalLight position={[600, 1100, 500]} intensity={2.2} />
    <hemisphereLight args={["#d5f1f2", "#bba07b", .8]} />
    <Suspense fallback={null}><Model running={running} reduced={reduced} replayKey={replayKey} onComplete={onComplete} /></Suspense>
    <ParkControls key={replayKey} active={active} paused={paused} hidden={hidden} running={running} complete={complete} />
  </Canvas>;
}
