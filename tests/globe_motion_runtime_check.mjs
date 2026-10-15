import fs from "fs";
import vm from "vm";

const sourcePath = "/app/frontend/src/globe-motion.ts";
const source = fs.readFileSync(sourcePath, "utf8");

const jsSource = source
  .replace(/export\s+function/g, "function")
  .replace(/:\s*number/g, "")
  .replace(/:\s*boolean/g, "");

const context = { Math, Number };
vm.createContext(context);
vm.runInContext(`${jsSource}\nthis.globeScrollPose = globeScrollPose; this.followGlobeScroll = followGlobeScroll;`, context);

const { globeScrollPose, followGlobeScroll } = context;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function near(a, b, tolerance = 1e-9) {
  return Math.abs(a - b) <= tolerance;
}

function run() {
  // pose(0) baseline checks
  const p0 = globeScrollPose(0, false);
  assert(near(p0.zoom, 1), `Expected zoom=1 at pose0, got ${p0.zoom}`);
  assert(near(p0.travel, 0), `Expected travel=0 at pose0, got ${p0.travel}`);
  assert(near(p0.yaw, 0) && near(p0.pitch, 0) && near(p0.roll, 0) && near(p0.side, 0) && near(p0.bob, 0), "Expected zero orientation offsets at pose0");

  // Nonfinite and negative input clamps for pose
  const pNeg = globeScrollPose(-3, false);
  const pNaN = globeScrollPose(Number.NaN, false);
  assert(JSON.stringify(pNeg) === JSON.stringify(p0), "Negative progress should clamp to pose0");
  assert(JSON.stringify(pNaN) === JSON.stringify(p0), "NaN progress should clamp to pose0");

  // Zoom bounds check over wide range
  for (let i = 0; i <= 600; i += 1) {
    const pose = globeScrollPose(i / 100, false);
    assert(pose.zoom >= 0.86 - 1e-9 && pose.zoom <= 1.14 + 1e-9, `Zoom out of bounds at p=${i / 100}: ${pose.zoom}`);
  }

  // Determinism / reversibility by same absolute progress
  const a = globeScrollPose(0.73, false);
  const b = globeScrollPose(0.73, false);
  assert(JSON.stringify(a) === JSON.stringify(b), "Pose should be deterministic for equal progress");

  // Boundary continuity around key transitions
  const eps = 1e-4;
  [0.26, 0.42, 1.1].forEach((point) => {
    const left = globeScrollPose(point - eps, false);
    const right = globeScrollPose(point + eps, false);
    ["zoom", "travel", "yaw", "pitch", "roll", "side", "bob"].forEach((k) => {
      assert(Math.abs(left[k] - right[k]) < 0.01, `Boundary discontinuity at ${point} for ${k}`);
    });
  });

  // Reduced motion disables added orientation/zoom/parallax brightness-driving factors
  const rm = globeScrollPose(1.4, true);
  assert(near(rm.zoom, 1) && near(rm.yaw, 0) && near(rm.pitch, 0) && near(rm.roll, 0) && near(rm.side, 0) && near(rm.bob, 0), "Reduced-motion pose should suppress added motion");
  assert(rm.travel > 0, "Reduced-motion should still allow downward travel transition");

  // followGlobeScroll frame-rate consistency (1 second total)
  const simulate = (dt) => {
    let v = 0;
    const steps = Math.round(1 / dt);
    for (let i = 0; i < steps; i += 1) v = followGlobeScroll(v, 1000, dt);
    return v;
  };
  const f30 = simulate(1 / 30);
  const f60 = simulate(1 / 60);
  const f120 = simulate(1 / 120);
  assert(Math.abs(f30 - f60) < 15 && Math.abs(f60 - f120) < 15, `Frame-rate variance too high: ${f30}, ${f60}, ${f120}`);

  // Delta clamp on resume (large dt should still be limited)
  const resumed = followGlobeScroll(0, 1000, 5);
  assert(resumed < 600 && resumed > 400, `Large-dt clamp not applied as expected: ${resumed}`);

  // Nonfinite target safety
  const safeTarget = followGlobeScroll(120, Number.POSITIVE_INFINITY, 1 / 60);
  assert(safeTarget <= 120, `Nonfinite target should clamp toward 0, got ${safeTarget}`);

  // Invalid frame state cannot poison all subsequent animation frames.
  for (const invalid of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
    assert(Number.isFinite(followGlobeScroll(invalid, 230, 1 / 60)), "Nonfinite current must recover safely");
    assert(followGlobeScroll(120, 230, invalid) === 120, "Invalid delta must preserve the current frame");
  }

  console.log("globe_motion_runtime_check: PASS");
}

run();
