import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import * as THREE from "three";

import { FRANCE_OUTLINE, LAND_DOTS } from "@/src/globe-data";
import { earthMaterial, loadEarthTexture } from "@/src/globe-material";
import { colors, fonts } from "@/src/theme";
import WORLD_OUTLINES from "@/src/world-outlines.json";

const DEG = Math.PI / 180;
const FR = { lat: 46.6, lon: 2.4 };
const PARIS = { lat: 48.86, lon: 2.35 };
const CITIES = [
  [40.71, -74.0], [45.5, -73.57], [-23.55, -46.63], [25.2, 55.27], [1.35, 103.82], [35.68, 139.69],
  [6.52, 3.38], [19.08, 72.88], [-26.2, 28.05], [51.51, -0.13], [52.52, 13.4], [41.9, 12.5],
  [40.42, -3.7], [59.33, 18.07], [30.04, 31.24], [33.57, -7.59], [55.75, 37.62],
  [64.15, -21.94], [60.17, 24.94], [50.1, 14.43], [41.01, 28.97], [24.71, 46.67],
  [-1.29, 36.82], [14.71, -17.47], [-33.92, 18.42], [-15.79, -47.88], [-34.6, -58.38],
  [9.03, 38.75], [35.69, 51.39], [31.23, 121.47], [39.9, 116.4], [37.77, -122.4]
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
  const halfH = 4 * Math.tan(22.5 * DEG);
  const halfW = halfH * (w / h);
  const camera = new THREE.OrthographicCamera(-halfW, halfW, halfH, -halfH, 0.1, 100);
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
      uniforms: { uColor: { value: C(colors.atmosphere) }, uTime: { value: 0 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 uColor; uniform float uTime; varying vec2 vUv;
        void main(){ float d = length(vUv - 0.5) * 2.0;
          float ring = exp(-pow((d - 0.56) * 14.0, 2.0)) * (0.10 + 0.01 * sin(uTime * 1.5));
          float wide = smoothstep(1.0, 0.2, d) * 0.018;
          gl_FragColor = vec4(uColor * (ring + wide), 1.0); }`,
    }),
  );
  halo.position.z = -0.6;
  outer.add(halo);

  // Base globe
  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(1, 96, 64),
    earthMaterial(),
  );
  spin.add(globe);

  // Atmosphere rim
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(1.016, 64, 64),
    new THREE.ShaderMaterial({
      side: THREE.FrontSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uColor: { value: C(colors.atmosphere) } },
      vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 uColor; varying vec3 vN;
        void main(){ float a = pow(1.0-max(vN.z,0.0),4.0);
          gl_FragColor = vec4(uColor * a * 0.3, 1.0); }`,
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
  const amber = C(colors.brandSecondary);
  const orange = C(colors.brandPrimary);
  for (let i = 0; i < LAND_DOTS.length; i += 2) {
    const lat = LAND_DOTS[i], lon = LAND_DOTS[i + 1];
    if (inFrance(lat, lon)) continue;
    const nearCity = CITIES.some(([la, lo]) => Math.abs(lat-la) < 9 && Math.abs(lon-lo) < 10);
    if (nearCity) add(toVec(lat, lon, 1.004), amber.clone().multiplyScalar(0.6), 1.25, 0);
  }
  for (let lat = 41.2; lat <= 51.2; lat += 0.32) {
    for (let lon = -5; lon <= 8.3; lon += 0.42) {
      if (inFrance(lat, lon)) add(toVec(lat, lon, 1.006), orange, 1.05, 0.4);
    }
  }
  for (let i = 0; i < FRANCE_OUTLINE.length; i += 4) {
    add(toVec(FRANCE_OUTLINE[i], FRANCE_OUTLINE[i + 1], 1.008), orange.clone().multiplyScalar(0.45), 4, 0.4);
  }
  add(toVec(FR.lat, FR.lon, 1.03), orange.clone().multiplyScalar(0.4), 42, 0.7);
  add(toVec(PARIS.lat, PARIS.lon, 1.012), C(colors.onSurface), 6, 1);
  const ringPoints: any[] = [];
  CITIES.forEach(([la, lo]) => {
    add(toVec(la, lo, 1.014), orange.clone().multiplyScalar(0.7), 26, 0.5);
    add(toVec(la, lo, 1.014), amber, 6, 0.5);
    add(toVec(la, lo, 1.13), amber, 4.2, 0.5);
    add(toVec(la, lo, 1.13), orange.clone().multiplyScalar(0.45), 14, 0.5);
    [0.015, 0.025].forEach((radius) => {
      const center = toVec(la, lo, 1.009);
      const normal = center.clone().normalize();
      const tangent = new THREE.Vector3(0, 1, 0).cross(normal).normalize();
      const bitangent = normal.clone().cross(tangent);
      for (let i = 0; i < 32; i++) {
        for (const index of [i, i + 1]) {
          const angle = index / 32 * Math.PI * 2;
          ringPoints.push(center.clone().addScaledVector(tangent, Math.cos(angle) * radius).addScaledVector(bitangent, Math.sin(angle) * radius));
        }
      }
    });
  });
  spin.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(ringPoints), new THREE.LineBasicMaterial({ color: colors.brandSecondary, transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending, depthWrite: false })));

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

  const borderMaterial = new THREE.LineBasicMaterial({ color: colors.brandPrimary, transparent: true, opacity: 0.57, blending: THREE.AdditiveBlending, depthWrite: false });
  const borders: any[] = [];
  WORLD_OUTLINES.forEach((ring) => {
    const points = ring.map(([lon, lat]) => toVec(lat, lon, 1.003));
    for (let i = 1; i < points.length; i++) borders.push(points[i-1], points[i]);
  });
  spin.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(borders), borderMaterial));

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
    opacity: 0.36,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const paris = toVec(PARIS.lat, PARIS.lon, 1).normalize();
  const arcs: any[][] = [];
  const arcSegments: any[] = [];
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
    for (let i = 1; i < pts.length; i++) arcSegments.push(pts[i-1], pts[i]);
    pins.push(toVec(la, lo, 1.01), toVec(la, lo, 1.13));
  });
  spin.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(arcSegments), arcMat));
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

  return { scene, camera, outer, spin, halo, pointMat, updatePulses, earth: globe.material };
}

type Props = { scrollY: SharedValue<number>; dragYaw: SharedValue<number>; screenH: number; contentBottom: SharedValue<number> };

export function Globe({ scrollY, dragYaw, screenH, contentBottom }: Props) {
  const [failed, setFailed] = useState(false);
  const [textured, setTextured] = useState(false);
  const raf = useRef<number | null>(null);
  const cleanup = useRef<(() => void) | null>(null);

  useEffect(
    () => () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
      cleanup.current?.();
    },
    [],
  );

  const onContextCreate = (gl: ExpoWebGLRenderingContext) => {
    try {
      if (raf.current != null) cancelAnimationFrame(raf.current);
      cleanup.current?.();
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
      let disposed = false;
      cleanup.current = () => {
        disposed = true;
        s.scene.traverse((object: any) => { object.geometry?.dispose(); if (object.material) object.material.dispose(); });
        s.earth.uniforms.uMap.value.dispose();
        renderer.dispose();
      };
      loadEarthTexture(s.earth, () => disposed).then(() => { if (!disposed) setTextured(true); }).catch((error) => console.warn("Earth detail unavailable", error));
      const halfH = 4 * Math.tan(22.5 * DEG);
      const halfW = halfH * (w / h);
      const heroScale = halfW * 1.3;
      const endScale = heroScale * 0.86;
      const endY = -halfH - endScale * 0.78;
      const t0 = Date.now();

      const render = () => {
        raf.current = requestAnimationFrame(render);
        const t = (Date.now() - t0) / 1000;
        const sy = scrollY.value;
        const e = ease(clamp01(sy / (screenH * 0.75)));
        const scale = lerp(heroScale, endScale, e);
        const topY = halfH - ((contentBottom.value + 55) / screenH) * 2 * halfH;
        s.outer.position.y = lerp(topY - heroScale * 0.95, endY, e);
        s.outer.scale.setScalar(scale);
        s.spin.rotation.x = -6 * DEG + e * 0.2 + Math.sin(t * 0.12) * 0.012;
        s.spin.rotation.y =
          -8 * DEG + Math.sin(t * 0.1) * 0.045 + dragYaw.value;
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
    <View style={styles.root} testID="globe-3d">
      {failed ? (
        <Text style={styles.error} testID="globe-error">3D Earth is unavailable on this device.</Text>
      ) : (
        <View style={StyleSheet.absoluteFill} testID={textured ? "globe-texture-ready" : "globe-texture-loading"}>
          <GLView style={StyleSheet.absoluteFill} onContextCreate={onContextCreate} testID="globe-canvas" />
        </View>
      )}
      <LinearGradient colors={[colors.transparent, colors.surface]} style={styles.fade} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none" },
  error: { position: "absolute", top: "70%", alignSelf: "center", color: colors.onSurfaceTertiary, fontFamily: fonts.body, fontSize: 12 },
  fade: { position: "absolute", bottom: 0, left: 0, right: 0, height: "21%", pointerEvents: "none" },
});
