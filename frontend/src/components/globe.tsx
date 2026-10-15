import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import * as THREE from "three";

import { FRANCE_OUTLINE, LAND_DOTS } from "@/src/globe-data";
import { colors } from "@/src/theme";

const DEG = Math.PI / 180;
const FR = { lat: 46.6, lon: 2.4 };
const PARIS = { lat: 48.86, lon: 2.35 };
const CITIES = [
  [40.71, -74.0], [45.5, -73.57], [-23.55, -46.63], [25.2, 55.27], [1.35, 103.82], [35.68, 139.69],
  [6.52, 3.38], [19.08, 72.88], [-26.2, 28.05], [51.51, -0.13], [52.52, 13.4], [41.9, 12.5],
  [40.42, -3.7], [59.33, 18.07], [30.04, 31.24], [33.57, -7.59], [55.75, 37.62]
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function toVec(lat: number, lon: number, r: number) {
  const la = lat * DEG;
  const lo = lon * DEG;
  return new THREE.Vector3(r * Math.cos(la) * Math.sin(lo), r * Math.sin(la), r * Math.cos(la) * Math.cos(lo));
}

function inFrance(lat: number, lon: number) {
  if (lat < 41 || lat > 51.3 || lon < -5.3 || lon > 8.4) return false;
  const p = FRANCE_OUTLINE;
  const n = p.length / 2;
  let c = false;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const yi = p[2 * i], xi = p[2 * i + 1], yj = p[2 * j], xj = p[2 * j + 1];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

const POINT_VS = `
attribute float aSize; attribute vec3 aColor; attribute float aPulse; attribute float aPhase;
uniform float uTime; uniform float uScale; uniform float uGroupScale;
varying vec3 vColor; varying float vAlpha;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vec3 n = normalize((modelViewMatrix * vec4(normalize(position), 0.0)).xyz);
  float pulse = 1.0 + aPulse * 0.35 * sin(uTime * 2.4 + aPhase);
  vColor = aColor;
  vAlpha = smoothstep(-0.05, 0.35, n.z) * (0.75 + 0.25 * pulse);
  gl_PointSize = aSize * pulse * uScale * uGroupScale * 4.0 / -mv.z;
  gl_Position = projectionMatrix * mv;
}`;
const POINT_FS = `
varying vec3 vColor; varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;
  float a = pow(smoothstep(0.5, 0.0, d), 1.4);
  gl_FragColor = vec4(vColor * a * vAlpha, 1.0);
}`;

function buildScene(w: number, h: number) {
  const C = (hex: string) => new THREE.Color(hex);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
  camera.position.set(0, 0, 4);

  const outer = new THREE.Group();
  const spin = new THREE.Group();
  scene.add(outer);
  outer.add(spin);

  // Soft halo behind the globe
  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 3.6),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uColor: { value: C(colors.brandPrimary) }, uTime: { value: 0 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 uColor; uniform float uTime; varying vec2 vUv;
        void main(){ float d = length(vUv - 0.5) * 2.0;
          float ring = exp(-pow((d - 0.56) * 9.0, 2.0)) * (0.13 + 0.03 * sin(uTime * 1.5));
          float wide = smoothstep(1.0, 0.2, d) * 0.045;
          gl_FragColor = vec4(uColor * (ring + wide), 1.0); }`,
    }),
  );
  halo.position.z = -0.6;
  outer.add(halo);

  // Base globe
  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(1, 64, 64),
    new THREE.ShaderMaterial({
      uniforms: {
        uBase: { value: C(colors.globeBase) },
        uRim: { value: C(colors.brandTertiary) },
        uGlow: { value: C(colors.brandPrimary) },
      },
      vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 uBase; uniform vec3 uRim; uniform vec3 uGlow; varying vec3 vN;
        void main(){ float f = 1.0 - max(vN.z, 0.0);
          vec3 col = uBase + uRim * pow(f, 2.5) * 0.9 + uGlow * pow(f, 5.0) * 0.35;
          gl_FragColor = vec4(col, 1.0); }`,
    }),
  );
  spin.add(globe);

  // Atmosphere rim
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(1.16, 64, 64),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uColor: { value: C(colors.brandPrimary) }, uColor2: { value: C(colors.brandTertiary) } },
      vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 uColor; uniform vec3 uColor2; varying vec3 vN;
        void main(){ float a = pow(clamp(-vN.z / 0.5, 0.0, 1.0), 3.0);
          gl_FragColor = vec4((uColor * 0.32 + uColor2 * 0.7) * a, 1.0); }`,
    }),
  );
  outer.add(atmo);

  // Points (land, France, cities, glow)
  const pos: number[] = [], col: number[] = [], size: number[] = [], pulse: number[] = [], phase: number[] = [];
  const add = (v: any, c: any, s: number, p: number) => {
    pos.push(v.x, v.y, v.z);
    col.push(c.r, c.g, c.b);
    size.push(s);
    pulse.push(p);
    phase.push(Math.random() * Math.PI * 2);
  };
  const land = C(colors.globeLand);
  const amber = C(colors.brandSecondary);
  const orange = C(colors.brandPrimary);
  for (let i = 0; i < LAND_DOTS.length; i += 2) {
    const lat = LAND_DOTS[i], lon = LAND_DOTS[i + 1];
    if (inFrance(lat, lon)) continue;
    const light = Math.random() < 0.09;
    add(toVec(lat, lon, 1.004), light ? amber.clone().multiplyScalar(0.85) : land, light ? 3.4 : 3.0, light ? 1 : 0);
  }
  for (let lat = 41.2; lat <= 51.2; lat += 0.32) {
    for (let lon = -5; lon <= 8.3; lon += 0.42) {
      if (inFrance(lat, lon)) add(toVec(lat, lon, 1.006), orange, 3.0, 1);
    }
  }
  for (let i = 0; i < FRANCE_OUTLINE.length; i += 4) {
    add(toVec(FRANCE_OUTLINE[i], FRANCE_OUTLINE[i + 1], 1.008), orange.clone().multiplyScalar(0.45), 9, 1);
  }
  add(toVec(FR.lat, FR.lon, 1.03), orange.clone().multiplyScalar(0.55), 120, 1);
  add(toVec(PARIS.lat, PARIS.lon, 1.012), C(colors.onSurface), 6, 1);
  CITIES.forEach(([la, lo]) => {
    add(toVec(la, lo, 1.012), amber, 5, 1);
    add(toVec(la, lo, 1.09), amber, 3.2, 1);
  });

  const pointMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uScale: { value: Math.max(1, h / 800) }, uGroupScale: { value: 1 } },
    vertexShader: POINT_VS,
    fragmentShader: POINT_FS,
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("aColor", new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute("aSize", new THREE.Float32BufferAttribute(size, 1));
  g.setAttribute("aPulse", new THREE.Float32BufferAttribute(pulse, 1));
  g.setAttribute("aPhase", new THREE.Float32BufferAttribute(phase, 1));
  spin.add(new THREE.Points(g, pointMat));

  // France outline
  const outline: any[] = [];
  for (let i = 0; i < FRANCE_OUTLINE.length; i += 2) outline.push(toVec(FRANCE_OUTLINE[i], FRANCE_OUTLINE[i + 1], 1.009));
  spin.add(
    new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(outline),
      new THREE.LineBasicMaterial({ color: C(colors.brandSecondary), transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending }),
    ),
  );

  // Arcs + pins
  const arcMat = new THREE.LineBasicMaterial({
    color: C(colors.brandPrimary),
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const paris = toVec(PARIS.lat, PARIS.lon, 1).normalize();
  const arcs: any[][] = [];
  const pins: any[] = [];
  CITIES.forEach(([la, lo]) => {
    const end = toVec(la, lo, 1).normalize();
    const angle = paris.angleTo(end);
    const pts: any[] = [];
    for (let i = 0; i <= 48; i++) {
      const t = i / 48;
      const v = new THREE.Vector3().copy(paris).lerp(end, t).normalize();
      v.multiplyScalar(1.01 + Math.sin(Math.PI * t) * Math.min(angle, 1.6) * 0.12);
      pts.push(v);
    }
    arcs.push(pts);
    spin.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), arcMat));
    pins.push(toVec(la, lo, 1.0), toVec(la, lo, 1.09));
  });
  spin.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pins), arcMat));

  // Travelling pulses
  const pulseGeo = new THREE.BufferGeometry();
  const pulsePos = new Float32Array(arcs.length * 3);
  const pc: number[] = [], ps: number[] = [], pp: number[] = [], pph: number[] = [];
  arcs.forEach(() => {
    pc.push(1, 0.85, 0.6);
    ps.push(5.5);
    pp.push(0);
    pph.push(0);
  });
  pulseGeo.setAttribute("position", new THREE.BufferAttribute(pulsePos, 3));
  pulseGeo.setAttribute("aColor", new THREE.Float32BufferAttribute(pc, 3));
  pulseGeo.setAttribute("aSize", new THREE.Float32BufferAttribute(ps, 1));
  pulseGeo.setAttribute("aPulse", new THREE.Float32BufferAttribute(pp, 1));
  pulseGeo.setAttribute("aPhase", new THREE.Float32BufferAttribute(pph, 1));
  spin.add(new THREE.Points(pulseGeo, pointMat));
  const offsets = arcs.map((_, i) => (i * 0.37) % 1);

  const updatePulses = (t: number) => {
    arcs.forEach((pts, i) => {
      const u = (t * 0.22 + offsets[i]) % 1;
      const f = u * (pts.length - 1);
      const a = pts[Math.floor(f)];
      const b = pts[Math.min(pts.length - 1, Math.floor(f) + 1)];
      const k = f - Math.floor(f);
      pulsePos[i * 3] = a.x + (b.x - a.x) * k;
      pulsePos[i * 3 + 1] = a.y + (b.y - a.y) * k;
      pulsePos[i * 3 + 2] = a.z + (b.z - a.z) * k;
    });
    pulseGeo.attributes.position.needsUpdate = true;
  };

  return { scene, camera, outer, spin, halo, pointMat, updatePulses };
}

type Props = { scrollY: SharedValue<number>; dragYaw: SharedValue<number>; screenH: number };

export function Globe({ scrollY, dragYaw, screenH }: Props) {
  const [failed, setFailed] = useState(false);
  const raf = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
    },
    [],
  );

  const onContextCreate = (gl: ExpoWebGLRenderingContext) => {
    try {
      const webCanvas = Platform.OS === "web" ? (gl as any).canvas : null;
      if (webCanvas) {
        webCanvas.style.width = "100%";
        webCanvas.style.height = "100%";
      }
      const dpr = webCanvas ? Math.min(2, window.devicePixelRatio || 1) : 1;
      const w = webCanvas ? Math.round(webCanvas.clientWidth * dpr) : gl.drawingBufferWidth;
      const h = webCanvas ? Math.round(webCanvas.clientHeight * dpr) : gl.drawingBufferHeight;
      const canvas =
        Platform.OS === "web"
          ? (gl as any).canvas
          : {
              width: w,
              height: h,
              style: {},
              addEventListener: () => {},
              removeEventListener: () => {},
              clientHeight: h,
              getContext: () => gl,
            };
      const renderer = new THREE.WebGLRenderer({ canvas, context: gl, antialias: true, alpha: true });
      renderer.setPixelRatio(1);
      renderer.setSize(w, h, false);
      renderer.setClearColor(new THREE.Color(colors.surface), 1);

      const s = buildScene(w, h);
      const halfH = 4 * Math.tan(22.5 * DEG);
      const halfW = halfH * (w / h);
      const heroScale = Math.min(0.78, halfW * 0.9);
      const endScale = Math.max(1.2, halfW * 1.6);
      const endY = -halfH - endScale * 0.4;
      const t0 = Date.now();

      const render = () => {
        raf.current = requestAnimationFrame(render);
        const t = (Date.now() - t0) / 1000;
        const sy = scrollY.value;
        const e = ease(clamp01(sy / (screenH * 0.75)));
        const extra = Math.max(0, sy - screenH * 0.75) / screenH;
        const intro = ease(clamp01(t / 2.2));

        const scale = lerp(heroScale, endScale, e) * lerp(0.6, 1, intro);
        s.outer.position.y = lerp(0.02, endY, e);
        s.outer.scale.setScalar(scale);
        s.spin.rotation.x = FR.lat * DEG + e * 0.5 + Math.sin(t * 0.35) * 0.03;
        s.spin.rotation.y =
          -FR.lon * DEG + (1 - intro) * 1.4 + Math.sin(t * 0.22) * 0.16 + dragYaw.value + Math.sin(extra * 0.9) * 0.45;
        s.pointMat.uniforms.uTime.value = t;
        s.pointMat.uniforms.uGroupScale.value = scale;
        s.halo.material.uniforms.uTime.value = t;
        s.updatePulses(t);

        renderer.render(s.scene, s.camera);
        gl.endFrameEXP();
      };
      render();
    } catch (err) {
      console.warn("Globe WebGL failed", err);
      setFailed(true);
    }
  };

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]} testID="globe-3d">
      {failed ? (
        <Image
          source="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80"
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          testID="globe-fallback-image"
        />
      ) : (
        <GLView style={StyleSheet.absoluteFill} onContextCreate={onContextCreate} />
      )}
    </View>
  );
}
