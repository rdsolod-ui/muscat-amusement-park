"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  BackSide, DoubleSide, FileLoader, Group, LineBasicMaterial, MathUtils,
  MeshBasicMaterial, Quaternion, RepeatWrapping, ShaderMaterial, SRGBColorSpace,
  TextureLoader, Vector3,
} from "three";
import { assetPath } from "@/lib/asset-path";

export interface RealisticEarthProps {
  motion: MutableRefObject<{ progress: number; intro: number; visible: boolean }>;
  theme: "light" | "dark";
  reducedMotion: boolean;
  embedded?: boolean;
}

const DEG = Math.PI / 180;
const RADIUS = 2.9;
const MUSCAT = { latitude: 23.64305, longitude: 58.17629 };
const smooth = (a: number, b: number, x: number) => {
  const t = MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
// Same seam and orientation as THREE.SphereGeometry: north-up, -180/+180 equirectangular maps.
const geoPoint = (lat: number, lon: number, radius: number) => new Vector3(
  radius * Math.cos(lat * DEG) * Math.cos(lon * DEG),
  radius * Math.sin(lat * DEG),
  -radius * Math.cos(lat * DEG) * Math.sin(lon * DEG),
);
const vertexShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;
void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldPosition = world.xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;
const surfaceFragment = /* glsl */ `
uniform sampler2D uDay;
uniform sampler2D uNight;
uniform sampler2D uClouds;
uniform sampler2D uLand;
uniform vec3 uSun;
uniform float uOpacity;
uniform float uCloudOffset;
varying vec2 vUv;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;
void main() {
  vec3 n = normalize(vWorldNormal);
  vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
  float sunlight = dot(n, uSun);
  float daylight = smoothstep(-0.065, 0.20, sunlight);
  float land = texture2D(uLand, vUv).r;
  vec3 base = texture2D(uDay, vUv).rgb;
  // Blue Marble albedo plus atmospheric in-scatter above very dark open ocean.
  base += vec3(0.0012, 0.0065, 0.022) * (1.0 - land);
  float cloudShadow = smoothstep(0.14, 0.90,
    texture2D(uClouds, vec2(vUv.x + uCloudOffset + 0.0015, vUv.y - 0.0008)).r);
  float diffuse = max(sunlight, 0.0);
  vec3 color = base * (0.013 + diffuse * 1.38) * (1.0 - cloudShadow * 0.31 * daylight);
  // Water-only glint. Land is matte, rather than a metallic globe.
  vec3 halfVector = normalize(uSun + viewDirection);
  float fresnel = 0.02 + 0.98 * pow(1.0 - max(dot(n, viewDirection), 0.0), 5.0);
  float oceanGlint = pow(max(dot(n, halfVector), 0.0), 90.0);
  color += vec3(1.0, 0.94, 0.82) * oceanGlint * (0.16 + fresnel * 0.5)
    * (1.0 - land) * daylight * (1.0 - cloudShadow * 0.8);
  // Historical VIIRS 2016 composite, not live city lighting.
  float cities = texture2D(uNight, vUv).r;
  float night = 1.0 - smoothstep(-0.20, 0.045, sunlight);
  color += vec3(1.0, 0.54, 0.20) * pow(cities, 1.65) * night * 1.3;
  float rim = pow(1.0 - max(dot(n, viewDirection), 0.0), 3.8);
  float airlight = smoothstep(-0.18, 0.48, sunlight);
  color += vec3(0.018, 0.13, 0.37) * rim * airlight * 0.7;
  gl_FragColor = vec4(color, uOpacity);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
const cloudsFragment = /* glsl */ `
uniform sampler2D uClouds;
uniform vec3 uSun;
uniform float uOpacity;
uniform float uCloudOffset;
varying vec2 vUv;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;
void main() {
  vec2 coord = vec2(vUv.x + uCloudOffset, vUv.y);
  float density = texture2D(uClouds, coord).r;
  float opacity = smoothstep(0.10, 0.94, density);
  float sunlight = dot(normalize(vWorldNormal), uSun);
  float day = smoothstep(-0.07, 0.20, sunlight);
  float body = max(sunlight, 0.0);
  vec3 lit = mix(vec3(0.007, 0.011, 0.022), vec3(1.0, 0.98, 0.95) * (0.13 + body * 1.15), day);
  lit += vec3(0.23, 0.055, 0.012) * exp(-abs(sunlight) * 23.0) * opacity;
  gl_FragColor = vec4(lit, opacity * uOpacity * 0.94);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
const atmosphereFragment = /* glsl */ `
uniform vec3 uSun;
uniform float uOpacity;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;
void main() {
  vec3 n = normalize(vWorldNormal);
  vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
  float tangent = abs(dot(n, viewDirection));
  float light = smoothstep(-0.32, 0.55, dot(n, uSun));
  float density = smoothstep(0.0, 0.24, tangent);
  vec3 blue = mix(vec3(0.024, 0.085, 0.23), vec3(0.11, 0.39, 0.88), light);
  gl_FragColor = vec4(blue, density * uOpacity * (0.12 + light * 0.88));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/**
 * Bounded intro orbit, accurate Muscat site marker, separate cloud shell and daylight shading.
 * NASA imagery is historical composited data, not a live weather product.
 * Parent Director controls demand frames; this component never starts a perpetual render loop.
 */
export default function RealisticEarth({ motion, theme, reducedMotion, embedded = false }: RealisticEarthProps) {
  const { size, gl, invalidate } = useThree();
  // Pick once: do not replace a resolved Suspense tree during window resizing.
  const [smallTexture] = useState(() => size.width < 760 || gl.capabilities.maxTextureSize < 4096);
  const [day, night, clouds, land] = useLoader(TextureLoader, [
    assetPath("/textures/earth-v2/" + (smallTexture ? "day-2048.webp" : "day-4096.webp")),
    assetPath("/textures/earth-v2/night-2048.webp"),
    assetPath("/textures/earth-v2/clouds-2048.webp"),
    assetPath("/textures/earth-v2/land-mask-2048.png"),
  ]);
  const countrySource = useLoader(FileLoader, assetPath("/data/oman.geojson"));
  const countryPositions = useMemo(() => {
    const document = JSON.parse(String(countrySource)) as {
      features: { geometry: { type: string; coordinates: number[][][] | number[][][][] } }[];
    };
    const points: number[] = [];
    for (const feature of document.features) {
      const polygons = feature.geometry.type === "MultiPolygon"
        ? feature.geometry.coordinates as number[][][][]
        : [feature.geometry.coordinates as number[][][]];
      for (const polygon of polygons) for (const ring of polygon) {
        for (let i = 1; i < ring.length; i++) {
          const a = geoPoint(ring[i - 1][1], ring[i - 1][0], RADIUS * 1.008);
          const b = geoPoint(ring[i][1], ring[i][0], RADIUS * 1.008);
          points.push(a.x, a.y, a.z, b.x, b.y, b.z);
        }
      }
    }
    return new Float32Array(points);
  }, [countrySource]);
  const root = useRef<Group>(null), globe = useRef<Group>(null), pin = useRef<Group>(null);
  const countryLine = useRef<LineBasicMaterial>(null);
  const dot = useRef<MeshBasicMaterial>(null), ring = useRef<MeshBasicMaterial>(null);
  const surface = useRef<ShaderMaterial>(null), cloudMaterial = useRef<ShaderMaterial>(null);
  const atmosphere = useRef<ShaderMaterial>(null);
  const point = useMemo(() => geoPoint(MUSCAT.latitude, MUSCAT.longitude, RADIUS * 1.009), []);
  const pinRotation = useMemo(() =>
    new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), point.clone().normalize()), [point]);
  const sun = useMemo(() => new Vector3(-0.73, 0.42, 0.57).normalize(), []);
  const surfaceUniforms = useMemo(() => ({
    uDay: { value: day }, uNight: { value: night }, uClouds: { value: clouds }, uLand: { value: land },
    uSun: { value: sun }, uOpacity: { value: 1 }, uCloudOffset: { value: 0 },
  }), [day, night, clouds, land, sun]);
  const cloudUniforms = useMemo(() => ({
    uClouds: { value: clouds }, uSun: { value: sun }, uOpacity: { value: 1 }, uCloudOffset: { value: 0 },
  }), [clouds, sun]);
  const atmosphereUniforms = useMemo(() => ({
    uSun: { value: sun }, uOpacity: { value: 0.62 },
  }), [sun]);
  useEffect(() => {
    day.colorSpace = SRGBColorSpace;
    // Remaining textures are data masks; do not apply the sRGB transfer to their values.
    for (const texture of [day, night, clouds, land]) {
      texture.wrapS = RepeatWrapping;
      texture.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy());
      texture.needsUpdate = true;
    }
    invalidate();
  }, [day, night, clouds, land, gl, invalidate]);
  useFrame(() => {
    if (!root.current || !globe.current) return;
    const p = motion.current.progress;
    const alpha = 1 - smooth(0.235, 0.287, p);
    root.current.visible = alpha > 0.001;
    if (!root.current.visible) return;
    const zoom = smooth(0.125, 0.23, p), descent = smooth(.23, .287, p), mobile = size.width < 760;
    root.current.position.set(embedded ? 0 : mobile ? 0 : -2.55 + zoom * 0.8,
      embedded ? 0 : mobile ? -1.65 - zoom * 0.25 : -0.25, embedded ? 0 : -zoom * 0.6);
    root.current.scale.setScalar(MathUtils.lerp(embedded ? 0.82 : mobile ? 0.84 : 1, embedded ? 1.05 : mobile ? 1.02 : 1.55, zoom) * (1 + descent * 1.5));
    const intro = reducedMotion ? 1 : motion.current.intro;
    globe.current.rotation.set(MUSCAT.latitude * DEG,
      -(Math.PI / 2 + MUSCAT.longitude * DEG) + (1 - zoom) * (0.38 - intro * 0.20), 0);
    const offset = intro * 0.0015;
    if (surface.current) {
      surface.current.uniforms.uOpacity.value = alpha;
      surface.current.uniforms.uCloudOffset.value = offset;
    }
    if (cloudMaterial.current) {
      cloudMaterial.current.uniforms.uOpacity.value = alpha;
      cloudMaterial.current.uniforms.uCloudOffset.value = offset;
    }
    if (atmosphere.current) atmosphere.current.uniforms.uOpacity.value = alpha * (theme === "dark" ? 0.60 : 0.34);
    if (countryLine.current) countryLine.current.opacity = alpha * smooth(0.06, 0.18, p) * 0.76;
    if (pin.current) pin.current.scale.setScalar(MathUtils.lerp(0.86, 0.42, zoom));
    if (dot.current) dot.current.opacity = alpha;
    if (ring.current) ring.current.opacity = alpha * 0.65;
  }, -10);

  return <group ref={root} name="NASA_Blue_Marble_Earth">
    <group ref={globe}>
      <mesh renderOrder={0}>
        <sphereGeometry args={[RADIUS, smallTexture ? 80 : 128, smallTexture ? 48 : 80]} />
        <shaderMaterial ref={surface} uniforms={surfaceUniforms} vertexShader={vertexShader}
          fragmentShader={surfaceFragment} transparent depthWrite />
      </mesh>
      <mesh scale={1.0045} renderOrder={1}>
        <sphereGeometry args={[RADIUS, smallTexture ? 64 : 112, smallTexture ? 40 : 64]} />
        <shaderMaterial ref={cloudMaterial} uniforms={cloudUniforms} vertexShader={vertexShader}
          fragmentShader={cloudsFragment} transparent depthWrite={false} />
      </mesh>
      <mesh scale={1.023} renderOrder={2}>
        <sphereGeometry args={[RADIUS, 80, 48]} />
        <shaderMaterial ref={atmosphere} uniforms={atmosphereUniforms} vertexShader={vertexShader}
          fragmentShader={atmosphereFragment} side={BackSide} transparent depthWrite={false} />
      </mesh>
      <lineSegments renderOrder={3}>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[countryPositions, 3]} /></bufferGeometry>
        <lineBasicMaterial ref={countryLine} color="#f0cd89" transparent opacity={0}
          depthWrite={false} toneMapped={false} />
      </lineSegments>
      <group position={point} quaternion={pinRotation} renderOrder={4}><group ref={pin}>
        <mesh position-z={0.025}><sphereGeometry args={[0.027, 16, 12]} />
          <meshBasicMaterial ref={dot} color="#fff0bd" transparent toneMapped={false} /></mesh>
        <mesh><ringGeometry args={[0.071, 0.078, 48]} />
          <meshBasicMaterial ref={ring} color="#e8c58f" transparent side={DoubleSide}
            depthWrite={false} toneMapped={false} /></mesh>
      </group></group>
    </group>
  </group>;
}
