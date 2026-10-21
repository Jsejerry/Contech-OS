/** A docked hemisphere: every change is a function of scroll, never elapsed time. */
export function globeScrollPose(progress: number, reducedMotion = false) {
  const p = Number.isFinite(progress) ? Math.max(0, progress) : 0;
  return {
    zoom: reducedMotion ? 1 : 1 - 0.08 * Math.sin(p * 0.85),
    travel: 0,
    yaw: reducedMotion ? 0 : p * 0.2,
    pitch: reducedMotion ? 0 : Math.sin(p * 0.7) * 0.12,
    roll: reducedMotion ? 0 : Math.sin(p * 0.65) * 0.035,
    side: reducedMotion ? 0 : Math.sin(p * 0.9) * 0.28,
    bob: reducedMotion ? 0 : Math.sin(p * 1.1) * 0.07,
  };
}

/** Frame-rate-independent following; capped deltas avoid jumps after app suspension. */
export function followGlobeScroll(current: number, target: number, seconds: number) {
  const next = Number.isFinite(target) ? Math.max(0, target) : 0;
  const from = Number.isFinite(current) ? Math.max(0, current) : next;
  const dt = Number.isFinite(seconds) ? Math.min(0.05, Math.max(0, seconds)) : 0;
  const value = from + (next - from) * (1 - Math.exp(-12 * dt));
  return Math.abs(next - value) < 0.05 ? next : value;
}