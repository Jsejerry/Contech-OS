import Feather from "@react-native-vector-icons/feather";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  type SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { Reveal, Section, useScrollInfo, useSectionY } from "@/src/components/reveal";
import { Accent, Body, Eyebrow, Headline } from "@/src/components/ui";
import { tapSelect } from "@/src/haptics";
import { colors as C, fonts, makeStyles, useTheme } from "@/src/theme";

const STEPS = [
  { t: "Discover", icon: "search", d: "Find relevant solutions, companies, experts and opportunities." },
  { t: "Connect", icon: "link", d: "Identify and engage with the right people and organizations." },
  { t: "Pilot", icon: "flag", d: "Turn promising connections into real-world projects with playbooks and KPIs." },
  { t: "Intelligence", icon: "bar-chart-2", d: "Understand emerging technologies, market movements and ecosystem activity." },
];

function Step({ i, progress, step }: { i: number; progress: SharedValue<number>; step: (typeof STEPS)[number] }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const at = i / (STEPS.length - 1);
  const dot = useAnimatedStyle(() => {
    const t = interpolate(progress.value, [at - 0.08, at], [0, 1], Extrapolation.CLAMP);
    return {
      backgroundColor: interpolateColor(t, [0, 1], [C.surfaceSecondary, C.brandPrimary]),
      borderColor: interpolateColor(t, [0, 1], [C.borderStrong, C.brandSecondary]),
      transform: [{ scale: 0.9 + 0.1 * t }],
    };
  });
  const text = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [at - 0.15, at], [0.4, 1], Extrapolation.CLAMP),
  }));
  return (
    <View style={styles.step} testID={`works-step-${step.t.toLowerCase()}`}>
      <Animated.View style={[styles.stepDot, dot]}>
        <Feather name={step.icon as any} size={18} color={colors.onSurface} />
      </Animated.View>
      <Animated.View style={[styles.stepBody, text]}>
        <Text style={styles.stepN}>{`MODULE 0${i + 1}`}</Text>
        <Text style={styles.stepT}>{step.t}</Text>
        <Text style={styles.stepD}>{step.d}</Text>
      </Animated.View>
    </View>
  );
}

function Timeline() {
  const styles = useStyles();
  const { scrollY, screenH } = useScrollInfo();
  const sectionY = useSectionY();
  const top = useSharedValue(0);
  const height = useSharedValue(1);
  const progress = useDerivedValue(() => {
    const start = sectionY.value + top.value - screenH * 0.62;
    return interpolate(scrollY.value, [start, start + height.value], [0, 1], Extrapolation.CLAMP);
  });
  const fill = useAnimatedStyle(() => ({ height: `${progress.value * 100}%` }));
  return (
    <View
      style={styles.timeline}
      onLayout={(e) => {
        top.value = e.nativeEvent.layout.y;
        height.value = e.nativeEvent.layout.height;
      }}
      testID="works-timeline"
    >
      <View style={styles.track}>
        <Animated.View style={[styles.trackFill, fill]} />
      </View>
      {STEPS.map((s, i) => (
        <Step key={s.t} i={i} step={s} progress={progress} />
      ))}
    </View>
  );
}

function FlipCard() {
  const styles = useStyles();
  const [side, setSide] = useState<"need" | "offer">("need");
  const rot = useSharedValue(0);
  const flip = (s: "need" | "offer") => {
    tapSelect();
    setSide(s);
    rot.value = withSpring(s === "need" ? 0 : 180, { damping: 14, stiffness: 90 });
  };
  const front = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${rot.value}deg` }],
    opacity: rot.value < 90 ? 1 : 0,
  }));
  const back = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${rot.value - 180}deg` }],
    opacity: rot.value >= 90 ? 1 : 0,
  }));

  return (
    <View>
      <View style={styles.seg}>
        {(["need", "offer"] as const).map((s) => (
          <Pressable key={s} testID={`dual-card-${s}-tab`} onPress={() => flip(s)} style={[styles.segBtn, side === s && styles.segOn]}>
            <Text style={[styles.segText, side === s && styles.segTextOn]}>{s === "need" ? "Need" : "Offer"}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable testID="dual-card" onPress={() => flip(side === "need" ? "offer" : "need")} style={styles.flipBox}>
        <Animated.View style={[styles.face, styles.faceNeed, front]}>
          <Text style={styles.faceTag}>● ACTIVE NEED · LYON, FR</Text>
          <Text style={styles.faceT}>Automated rebar inspection across 3 jobsites</Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>TRL 7+</Text>
            <Text style={styles.meta}>Deploy Q3</Text>
            <Text style={styles.meta}>Pilot · 8 wks</Text>
          </View>
          <Text style={styles.hint}>Tap to flip →</Text>
        </Animated.View>
        <Animated.View style={[styles.face, styles.faceOffer, back]}>
          <Text style={[styles.faceTag, styles.faceTagOffer]}>● MATCHED OFFER · 94% FIT</Text>
          <Text style={styles.faceT}>AI vision QA for rebar, deployed on 40+ sites</Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>TRL 8</Text>
            <Text style={styles.meta}>Ready in 2 wks</Text>
            <Text style={styles.meta}>ROI tracked</Text>
          </View>
          <Text style={styles.hint}>← Tap to flip</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const FEATURES = [
  { icon: "layout", t: "Pilot playbooks & KPI dashboards", d: "Templates for success metrics, master agreements and weekly milestones." },
  { icon: "radio", t: "Live event mode", d: "Instantly turns event networking into active platform projects." },
];

export function WorksSection({ onY }: { onY: (y: number) => void }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Section style={styles.wrap} testID="section-works" onY={onY}>
      <Reveal>
        <Eyebrow>HOW IT WORKS</Eyebrow>
        <Headline size={34}>
          From fragmented information to <Accent>actionable connections.</Accent>
        </Headline>
        <Body style={styles.lead}>Four modules. One standardized, end-to-end workflow.</Body>
      </Reveal>
      <Timeline />
      <Reveal style={styles.block}>
        <Text style={styles.kicker}>DUAL DYNAMIC CARDS</Text>
        <Text style={styles.sub}>One entity, two sides — switch between active Needs and available Offers in real time.</Text>
      </Reveal>
      <Reveal delay={1}>
        <FlipCard />
      </Reveal>
      {FEATURES.map((f, i) => (
        <Reveal key={f.t} delay={i} style={styles.feat}>
          <View style={styles.featIcon}>
            <Feather name={f.icon as any} size={18} color={colors.brandPrimary} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.featT}>{f.t}</Text>
            <Text style={styles.featD}>{f.d}</Text>
          </View>
        </Reveal>
      ))}
    </Section>
  );
}

const useStyles = makeStyles((c) => ({
  wrap: { paddingHorizontal: 24, paddingTop: 120 },
  flex: { flex: 1 },
  lead: { marginTop: 14 },
  timeline: { marginTop: 32, paddingLeft: 0 },
  track: { position: "absolute", left: 21, top: 22, bottom: 40, width: 2, backgroundColor: c.surfaceTertiary, overflow: "hidden" },
  trackFill: { width: 2, backgroundColor: c.brandPrimary },
  step: { flexDirection: "row", gap: 16, marginBottom: 28 },
  stepDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBody: { flex: 1, paddingTop: 2 },
  stepN: { fontFamily: fonts.bodyMedium, fontSize: 10, letterSpacing: 2, color: c.brandSecondary },
  stepT: { fontFamily: fonts.displayMedium, fontSize: 24, color: c.onSurface, marginTop: 2 },
  stepD: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: c.onSurfaceTertiary, marginTop: 4 },
  block: { marginTop: 40, marginBottom: 16 },
  kicker: { fontFamily: fonts.bodySemi, fontSize: 12, letterSpacing: 2.4, color: c.brandPrimary },
  sub: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: c.onSurfaceTertiary, marginTop: 8 },
  seg: {
    flexDirection: "row",
    alignSelf: "flex-start",
    padding: 4,
    borderRadius: 999,
    backgroundColor: c.surfaceSecondary,
    borderWidth: 1,
    borderColor: c.border,
    marginBottom: 16,
  },
  segBtn: { height: 36, paddingHorizontal: 20, borderRadius: 999, justifyContent: "center" },
  segOn: { backgroundColor: c.brandPrimary },
  segText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: c.onSurfaceTertiary },
  segTextOn: { color: c.onBrandPrimary },
  flipBox: { height: 210 },
  face: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    backfaceVisibility: "hidden",
  },
  faceNeed: { backgroundColor: c.surfaceSecondary, borderColor: c.borderStrong },
  faceOffer: { backgroundColor: c.surfaceSecondary, borderColor: c.brandPrimary },
  faceTag: { fontFamily: fonts.bodySemi, fontSize: 11, letterSpacing: 1.6, color: c.onSurfaceTertiary },
  faceTagOffer: { color: c.brandPrimary },
  faceT: { fontFamily: fonts.displayMedium, fontSize: 24, lineHeight: 29, color: c.onSurface, marginTop: 12 },
  metaRow: { flexDirection: "row", gap: 8, marginTop: 16, flexWrap: "wrap" },
  meta: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: c.onSurfaceSecondary,
    backgroundColor: c.surfaceTertiary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
  },
  hint: { position: "absolute", right: 20, bottom: 16, fontFamily: fonts.body, fontSize: 12, color: c.muted },
  feat: {
    flexDirection: "row",
    gap: 14,
    marginTop: 12,
    padding: 16,
    borderRadius: 20,
    backgroundColor: c.glass,
    borderWidth: 1,
    borderColor: c.glassBorder,
  },
  featIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: c.brandGlow,
    alignItems: "center",
    justifyContent: "center",
  },
  featT: { fontFamily: fonts.displayMedium, fontSize: 17, color: c.onSurface },
  featD: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: c.onSurfaceTertiary, marginTop: 4 },
}));
