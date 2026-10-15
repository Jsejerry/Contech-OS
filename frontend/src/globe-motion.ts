const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (start: number, end: number, value: number) => {
  const t = clamp((value - start) / (end - start));
  return t * t * (3 - 2 * t);
};

/** Absolute scroll position drives every pose, so scrolling back retraces the motion. */
export function globeScrollPose(progress: number, reducedMotion = false) {
  const p = Number.isFinite(progress) ? Math.max(0, progress) : 0;
  const reveal = smooth(0, 0.42, p);
  const dock = smooth(0.26, 1.1, p);
  const travel = smooth(0, 1.1, p);
  const later = Math.max(0, p - 1.1);

  return {
    zoom: reducedMotion ? 1 : 1 + 0.14 * reveal - 0.28 * dock,
    travel,
    yaw: reducedMotion ? 0 : 0.8 * reveal + 0.24 * dock + later * 0.3,
    pitch: reducedMotion ? 0 : 0.24 * reveal - 0.12 * dock + Math.sin(later * 0.55) * 0.045,
    roll: reducedMotion ? 0 : Math.sin(p * 1.4) * 0.075 * reveal * (1 - 0.65 * dock),
    side: reducedMotion ? 0 : Math.sin(p * 0.8) * 0.16 * dock,
    bob: reducedMotion ? 0 : Math.sin(later * 0.8) * 0.035,
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