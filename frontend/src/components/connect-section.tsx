import Feather from "@react-native-vector-icons/feather";
import { useEffect, useState } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { LogoMark } from "@/src/components/logo";
import { Reveal, Section } from "@/src/components/reveal";
import { Accent, Body, Eyebrow, Headline } from "@/src/components/ui";
import { tapSelect } from "@/src/haptics";
import { fonts, makeStyles, useTheme } from "@/src/theme";

const AUDIENCES = [
  { k: "builders", icon: "home", t: "Construction companies", s: "Builders", d: "Publish real jobsite challenges and get matched with proven, deployment-ready solutions." },
  { k: "tech", icon: "cpu", t: "Technology providers", s: "Tech", d: "Showcase your track record and reach contractors actively looking for what you build." },
  { k: "startups", icon: "zap", t: "Startups", s: "Startups", d: "Turn event handshakes into pilots with clear KPIs, templates and fast approvals." },
  { k: "investors", icon: "trending-up", t: "Investors", s: "Investors", d: "Track traction, pilot results and emerging ConTech before the market does." },
  { k: "experts", icon: "award", t: "Experts", s: "Experts", d: "Share know-how across borders and get discovered by teams who need it." },
  { k: "universities", icon: "book-open", t: "Universities & institutions", s: "Research", d: "Bridge research and the jobsite with industry partners worldwide." },
];

function PulseRing({ size }: { size: number }) {
  const styles = useStyles();
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.out(Easing.quad) }), -1, false);
  }, [v]);
  const a = useAnimatedStyle(() => ({ opacity: 0.6 * (1 - v.value), transform: [{ scale: 1 + v.value * 1.2 }] }));
  return <Animated.View style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }, a]} />;
}

export function ConnectSection({ onY }: { onY: (y: number) => void }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [sel, setSel] = useState(0);
  const size = Math.min(width - 48, 380);
  const R = size * 0.36;
  const c = size / 2;
  const NODE = 56;
  const active = AUDIENCES[sel];

  return (
    <Section style={styles.wrap} testID="section-connect" onY={onY}>
      <Reveal>
        <Eyebrow>HOW IT CONNECTS</Eyebrow>
        <Headline size={34}>
          Built for the people moving construction <Accent>forward.</Accent>
        </Headline>
        <Body style={styles.lead}>This is where the global ecosystem becomes tangible. Tap a module to explore.</Body>
      </Reveal>

      <Reveal delay={1} style={[styles.orbit, { width: size, height: size }]}>
        <View style={[styles.orbitCircle, { width: R * 2, height: R * 2, borderRadius: R, left: c - R, top: c - R }]} />
        {AUDIENCES.map((a, i) => {
          const ang = (i * 60 - 90) * (Math.PI / 180);
          const x = c + R * Math.cos(ang);
          const y = c + R * Math.sin(ang);
          const on = i === sel;
          return (
            <View key={a.k}>
              <View
                style={[
                  styles.spoke,
                  on && styles.spokeOn,
                  { width: R, left: c, top: c, transform: [{ rotate: `${i * 60 - 90}deg` }], transformOrigin: "left center" },
                ]}
              />
              <Pressable
                testID={`audience-node-${a.k}`}
                onPress={() => {
                  tapSelect();
                  setSel(i);
                }}
                style={[styles.nodeWrap, { left: x - 45, top: y - NODE / 2 }]}
              >
                <View style={[styles.node, on && styles.nodeOn]}>
                  <Feather name={a.icon as any} size={20} color={on ? colors.onBrandPrimary : colors.onSurfaceSecondary} />
                </View>
                <Text style={[styles.nodeLabel, on && styles.nodeLabelOn]} numberOfLines={1}>
                  {a.s}
                </Text>
              </Pressable>
            </View>
          );
        })}
        <View style={[styles.center, { left: c - 40, top: c - 40, pointerEvents: "none" }]}>
          <PulseRing size={80} />
          <View style={styles.centerCore}>
            <LogoMark size={40} />
          </View>
        </View>
      </Reveal>

      <Reveal delay={2}>
        <Animated.View key={active.k} entering={FadeInDown.springify().damping(16)} style={styles.detail} testID="audience-detail-card">
          <Text style={styles.detailKicker}>{`0${sel + 1} / 06`}</Text>
          <Text style={styles.detailT} testID="audience-detail-title">
            {active.t}
          </Text>
          <Text style={styles.detailD}>{active.d}</Text>
        </Animated.View>
      </Reveal>

      <Reveal style={styles.global}>
        <Eyebrow>BUILT FOR A GLOBAL INDUSTRY</Eyebrow>
        <Headline size={30}>
          Construction innovation has <Accent>no borders.</Accent>
        </Headline>
        <Body style={styles.lead}>
          ConTech OS connects ecosystems across markets, disciplines and regions — making local expertise discoverable within a
          global network.
        </Body>
      </Reveal>
      <Reveal delay={1} style={styles.stats}>
        {[
          ["6", "Audiences"],
          ["4", "Modules"],
          ["1", "Global network"],
        ].map(([n, l]) => (
          <View key={l} style={styles.stat}>
            <Text style={styles.statN}>{n}</Text>
            <Text style={styles.statL}>{l}</Text>
          </View>
        ))}
      </Reveal>
    </Section>
  );
}

const useStyles = makeStyles((c) => ({
  wrap: { paddingHorizontal: 24, paddingTop: 120 },
  lead: { marginTop: 14 },
  orbit: { alignSelf: "center", marginTop: 24 },
  orbitCircle: { position: "absolute", borderWidth: 1, borderColor: c.border, borderStyle: "dashed" },
  spoke: { position: "absolute", height: 1, backgroundColor: c.surfaceTertiary },
  spokeOn: { backgroundColor: c.brandPrimary, height: 2 },
  nodeWrap: { position: "absolute", width: 90, alignItems: "center" },
  node: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: c.glassStrong,
    borderWidth: 1,
    borderColor: c.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  nodeOn: { backgroundColor: c.brandPrimary, borderColor: c.brandSecondary },
  nodeLabel: { marginTop: 6, fontFamily: fonts.bodyMedium, fontSize: 11, color: c.onSurfaceTertiary },
  nodeLabelOn: { color: c.onSurface },
  center: { position: "absolute", width: 80, height: 80, alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute", borderWidth: 1.5, borderColor: c.brandPrimary },
  centerCore: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.brandGlowStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  detail: {
    marginTop: 20,
    padding: 20,
    borderRadius: 20,
    backgroundColor: c.glass,
    borderWidth: 1,
    borderColor: c.brandGlowStrong,
  },
  detailKicker: { fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 2, color: c.brandPrimary },
  detailT: { fontFamily: fonts.displayMedium, fontSize: 22, color: c.onSurface, marginTop: 6 },
  detailD: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: c.onSurfaceTertiary, marginTop: 6 },
  global: { marginTop: 96 },
  stats: { flexDirection: "row", marginTop: 24, gap: 12 },
  stat: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: c.glass,
    borderWidth: 1,
    borderColor: c.glassBorder,
  },
  statN: { fontFamily: fonts.displayMedium, fontSize: 32, color: c.brandPrimary },
  statL: { fontFamily: fonts.body, fontSize: 12, color: c.onSurfaceTertiary, marginTop: 2 },
}));
