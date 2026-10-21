import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Platform, StyleSheet, Text, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import * as THREE from "three";

import { FRANCE_OUTLINE, LAND_DOTS } from "@/src/globe-data";
import { earthMaterial, loadEarthTexture } from "@/src/globe-material";
import { followGlobeScroll, globeScrollPose } from "@/src/globe-motion";
import { colors, fonts, makeStyles, useTheme } from "@/src/theme";
import { useCopy } from "@/src/content";
import WORLD_OUTLINES from "@/src/world-outlines.json";

const DEG = Math.PI / 180;
const FR = { lat: 46.6, lon: 2.4 };
const PARIS = { lat: 48.86, lon: 2.35 };
const CITIES = [
  [40.71, -74.0], [-23.55, -46.63], [25.2, 55.27], [1.35, 103.82],
  [35.68, 139.69], [-26.2, 28.05], [51.51, -0.13], [52.52, 13.4],
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

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
  gl_FragColor = vec4(vColor, a * vAlpha);
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
      uniforms: { uColor: { value: C(colors.atmosphere) }, uTime: { value: 0 }, uScrollEnergy: { value: 0 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 uColor; uniform float uTime; uniform float uScrollEnergy; varying vec2 vUv;
        void main(){ float d = length(vUv - 0.5) * 2.0;
          float ring = exp(-pow((d - 0.56) * 14.0, 2.0)) * (0.10 + 0.01 * sin(uTime * 1.5));
          float wide = smoothstep(1.0, 0.2, d) * 0.018;
          gl_FragColor = vec4(uColor, (ring + wide) * (1.0 + uScrollEnergy * 0.3)); }`,
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
          gl_FragColor = vec4(uColor, a * 0.3); }`,
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
  const amber = C(colors.globeLand);
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
  spin.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(ringPoints), new THREE.LineBasicMaterial({ color: colors.brandPrimary, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })));

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

  const borderMaterial = new THREE.LineBasicMaterial({ color: colors.globeLand, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false });
  const borders: any[] = [];
  WORLD_OUTLINES.forEach((ring) => {
    const points = ring.map(([lon, lat]) => toVec(lat, lon, 1.003));
    for (let i = 1; i < points.length; i++) borders.push(points[i-1], points[i]);
  });
  spin.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(borders), borderMaterial));

  // Survey grid reinforces the architectural character without competing with copy.
  const grid: any[] = [];
  for (let lat = -60; lat <= 60; lat += 30) {
    for (let lon = -180; lon < 180; lon += 4) grid.push(toVec(lat, lon, 1.002), toVec(lat, lon + 4, 1.002));
  }
  for (let lon = -180; lon < 180; lon += 30) {
    for (let lat = -88; lat < 88; lat += 4) grid.push(toVec(lat, lon, 1.002), toVec(lat + 4, lon, 1.002));
  }
  spin.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(grid), new THREE.LineBasicMaterial({ color: colors.globeLand, transparent: true, opacity: 0.12, depthWrite: false })));

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
  const routeGeometries: any[] = [];
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
    const route = new THREE.BufferGeometry().setFromPoints(pts);
    route.setDrawRange(0, 0);
    routeGeometries.push(route);
    spin.add(new THREE.Line(route, arcMat));
    pins.push(toVec(la, lo, 1.01), toVec(la, lo, 1.13));
  });
  spin.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pins), arcMat));

  // Travelling pulses
  const pulseGeo = new THREE.BufferGeometry();
  const pulsePos = new Float32Array(arcs.length * 3);
  const pc: number[] = [], ps: number[] = [], pp: number[] = [], pph: number[] = [];
  arcs.forEach(() => {
    pc.push(orange.r, orange.g, orange.b);
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
  const updatePulses = (progress: number, reduced = false) => {
    arcs.forEach((pts, i) => {
      const draw = reduced ? 1 : Math.min(1, Math.max(0, 0.42 + progress * 0.7 - i * 0.045));
      routeGeometries[i].setDrawRange(0, Math.floor(draw * (pts.length - 1)) + 1);
      const u = reduced ? 0 : draw < 1 ? draw : (progress * 0.32 + i * 0.08) % 1;
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

  return { scene, camera, outer, spin, halo, pointMat, arcMat, updatePulses, earth: globe.material };
}

// expo-gl's native WebGL2 context passes `instanceof WebGLRenderingContext`, which makes
// three.js (r163+) reject it as WebGL 1. Hide that global only while the renderer is created.
function createRenderer(canvas: any, gl: ExpoWebGLRenderingContext) {
  const g = globalThis as any;
  const original = g.WebGLRenderingContext;
  let hide = false;
  if (Platform.OS !== "web" && original !== undefined) {
    try { g.WebGLRenderingContext = undefined; hide = true; } catch { /* read-only global */ }
  }
  try {
    return new THREE.WebGLRenderer({ canvas, context: gl as any, antialias: true, alpha: true });
  } finally {
    if (hide) g.WebGLRenderingContext = original;
  }
}

type Props = { scrollY: SharedValue<number>; screenH: number };

export function Globe({ scrollY, screenH }: Props) {
  const styles = useStyles();
  const { colors: theme, scheme } = useTheme();
  const t = useCopy();
  const [failed, setFailed] = useState(false);
  const [textured, setTextured] = useState(false);
  const raf = useRef<number | null>(null);
  const cleanup = useRef<(() => void) | null>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    let active = true;
    let preferenceChanged = false;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (active && !preferenceChanged) reducedMotion.current = value;
    }).catch(() => {});
    const listener = AccessibilityInfo.addEventListener("reduceMotionChanged", (value) => {
      preferenceChanged = true;
      reducedMotion.current = value;
    });
    return () => { active = false; listener.remove(); };
  }, []);

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
      const renderer = createRenderer(canvas, gl);
      renderer.setPixelRatio(1);
      renderer.setSize(w, h, false);
      renderer.setClearColor(new THREE.Color(colors.surface), 0);

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
      const heroScale = Math.min(halfW * 1.44, halfH * 0.68);
      const t0 = Date.now();
      let previousTime = t0;
      let smoothScroll = Math.max(0, scrollY.value);
      let scrollEnergy = 0;

      const render = () => {
        if (disposed) return;
        raf.current = requestAnimationFrame(render);
        const now = Date.now();
        const dt = Math.min(0.05, Math.max(0.001, (now - previousTime) / 1000));
        previousTime = now;
        const reduced = reducedMotion.current;
        const previousScroll = smoothScroll;
        smoothScroll = reduced ? Math.max(0, scrollY.value) : followGlobeScroll(smoothScroll, scrollY.value, dt);
        const speed = Math.min(1, Math.abs(smoothScroll - previousScroll) / (dt * screenH * 2.5));
        scrollEnergy = reduced ? 0 : lerp(scrollEnergy, speed, 1 - Math.exp(-8 * dt));
        const pose = globeScrollPose(smoothScroll / screenH, reduced);
        const scale = heroScale * pose.zoom;
        const progress = reduced ? 0 : smoothScroll / screenH;
        s.outer.position.set(halfW * pose.side, -halfH + heroScale * pose.bob, 0);
        s.outer.scale.setScalar(scale);
        s.spin.rotation.set(
          -6 * DEG + pose.pitch,
          -2.4 * DEG + pose.yaw,
          pose.roll,
        );
        s.pointMat.uniforms.uTime.value = progress;
        s.pointMat.uniforms.uGroupScale.value = scale;
        s.halo.material.uniforms.uTime.value = progress;
        s.halo.material.uniforms.uScrollEnergy.value = scrollEnergy;
        s.arcMat.opacity = 0.72 + scrollEnergy * 0.1;
        s.updatePulses(progress, reduced);

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
    <View style={[styles.root, { opacity: scheme === "light" ? 0.17 : 0.82 }]} testID="globe-3d" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {failed ? (
        <Text style={styles.error} testID="globe-error">{t.globeError}</Text>
      ) : (
        <View style={StyleSheet.absoluteFill} testID={textured ? "globe-texture-ready" : "globe-texture-loading"}>
          <GLView style={StyleSheet.absoluteFill} onContextCreate={onContextCreate} testID="globe-canvas" />
        </View>
      )}
      <LinearGradient colors={[theme.transparent, theme.surface]} style={styles.fade} />
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none" },
  error: { position: "absolute", top: "70%", alignSelf: "center", color: c.onSurfaceTertiary, fontFamily: fonts.body, fontSize: 12 },
  fade: { position: "absolute", bottom: 0, left: 0, right: 0, height: "12%", pointerEvents: "none" },
}));
