import Feather from "@react-native-vector-icons/feather";
import { useEffect } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import Animated, { Easing, type SharedValue, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PressScale } from "@/src/components/ui";
import { fonts, makeStyles, useTheme } from "@/src/theme";

const PILLARS = [
  { title: "PEOPLE", text: "Connect globally" },
  { title: "TECHNOLOGY", text: "Solve jobsite challenges" },
  { title: "OPPORTUNITY", text: "Turn ideas into impact" },
];

function ScrollHint({ onPress }: { onPress: () => void }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const bob = useSharedValue(0);
  useEffect(() => { bob.value = withRepeat(withTiming(7, { duration: 1400, easing: Easing.inOut(Easing.quad) }), -1, true); }, [bob]);
  const motion = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value }] }));
  return (
    <Pressable style={styles.hint} onPress={onPress} testID="scroll-hint" accessibilityRole="button" accessibilityLabel="Scroll to explore the platform">
      <View style={styles.mouse}><Animated.View style={[styles.mouseDot, motion]} /></View>
      <Text style={styles.hintText} testID="scroll-hint-label">SCROLL TO EXPLORE</Text>
      <Feather name="chevron-down" size={19} color={colors.onSurfaceSecondary} />
    </Pressable>
  );
}

export function HeroSection({ height, contentBottom, onJoin, onExplore }: { height: number; contentBottom: SharedValue<number>; onJoin: () => void; onExplore: () => void }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scale = Math.min(width / 390, 1.3);
  const top = insets.top + Math.max(96, height * 0.122);
  const headlineSize = Math.min((width - 52) * 0.099, 46);
  return (
    <View style={[styles.hero, { height }]} testID="section-hero">
      <View style={[styles.orbit, { left: width * 0.57 }]} />
      <View style={[styles.orbit, styles.orbitOuter, { left: width * 0.58 }]} />
      <View style={[styles.content, { paddingTop: top }]} onLayout={(event) => { contentBottom.value = event.nativeEvent.layout.height; }}>
        <View style={styles.eyebrow} testID="hero-eyebrow">
          {["A GLOBAL NETWORK", "FOR CONSTRUCTION"].map((line, index) => (
            <View key={line} style={styles.eyebrowLine}><View style={[styles.dash, index === 0 && styles.dashMuted]} /><Text style={[styles.eyebrowText, { fontSize: 9.5 * scale }]}>{line}</Text></View>
          ))}
        </View>
        <Text style={[styles.title, { fontSize: headlineSize, lineHeight: headlineSize * 1.04 }]} testID="hero-headline" accessibilityRole="header">
          {"Where the\nconstruction\n"}<Text style={styles.accent}>ecosystem</Text>{" connects."}
        </Text>
        <Text style={[styles.description, { fontSize: 13.1 * scale, lineHeight: 17.5 * scale }]} testID="hero-description">
          Discover the people, technologies and opportunities moving the built world forward — all in one connected ecosystem.
        </Text>
        <View style={styles.ctas}>
          <View style={styles.primaryColumn}><PressScale testID="hero-join-waitlist-button" onPress={onJoin} style={styles.primary}>
            <Text style={[styles.primaryText, { fontSize: 11.5 * scale }]}>Join the Waitlist</Text><Feather name="arrow-right" size={18} color={colors.onBrandPrimary} />
          </PressScale></View>
          <View style={styles.secondaryColumn}><PressScale testID="hero-explore-button" onPress={onExplore} style={styles.secondary}>
            <Text style={[styles.secondaryText, { fontSize: 10.7 * scale }]}>Explore Platform</Text><View style={styles.play}><Feather name="play" size={9} color={colors.onSurface} /></View>
          </PressScale></View>
        </View>
        <View style={styles.pillars}>
          {PILLARS.map((pillar) => <View key={pillar.title} style={styles.pillar} testID={`hero-pillar-${pillar.title.toLowerCase()}`}>
            <View style={styles.pillarTop}><View style={styles.dot} /><Text style={[styles.pillarTitle, { fontSize: 7.4 * scale }]}>{pillar.title}</Text></View>
            <Text style={[styles.pillarText, { fontSize: 8.5 * scale, lineHeight: 12 * scale }]}>{pillar.text}</Text>
          </View>)}
        </View>
      </View>
      <View style={[styles.hintWrap, { bottom: insets.bottom + 18 }]}><ScrollHint onPress={onExplore} /></View>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  hero: { overflow: "hidden" },
  content: { paddingHorizontal: 26 },
  orbit: { position: "absolute", width: 470, height: 420, borderRadius: 235, borderWidth: 1, borderColor: c.orbit, top: -290, pointerEvents: "none", transform: [{ rotate: "-25deg" }] },
  orbitOuter: { width: 570, height: 560, borderRadius: 285, top: -360 },
  eyebrow: { gap: 4, marginBottom: 18 },
  eyebrowLine: { flexDirection: "row", alignItems: "center", gap: 10 },
  dash: { width: 16, height: 1, backgroundColor: c.brandPrimary, opacity: 0.65 },
  dashMuted: { backgroundColor: c.onSurfaceTertiary },
  eyebrowText: { fontFamily: fonts.body, letterSpacing: 2.1, color: c.onSurfaceTertiary },
  title: { fontFamily: fonts.body, color: c.onSurface, letterSpacing: -1.15 },
  accent: { color: c.brandPrimary },
  description: { marginTop: 15, maxWidth: 325, fontFamily: fonts.body, color: c.onSurfaceTertiary, letterSpacing: 0.05 },
  ctas: { flexDirection: "row", gap: 16, marginTop: 23 },
  primaryColumn: { flex: 1.07, minWidth: 0 },
  secondaryColumn: { flex: 1, minWidth: 0 },
  primary: { minHeight: 44, paddingHorizontal: 14, borderRadius: 99, backgroundColor: c.brandPrimary, flexDirection: "row", alignItems: "center", justifyContent: "space-between", boxShadow: `0px 4px 26px ${c.brandGlow}` },
  primaryText: { color: c.onBrandPrimary, fontFamily: fonts.bodyMedium },
  secondary: { minHeight: 44, paddingHorizontal: 12, borderRadius: 99, borderWidth: 1, borderColor: c.heroOutline, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 5 },
  secondaryText: { color: c.onSurface, fontFamily: fonts.bodyMedium },
  play: { width: 18, height: 18, borderRadius: 9, backgroundColor: c.heroOutline, alignItems: "center", justifyContent: "center" },
  pillars: { flexDirection: "row", gap: 10, marginTop: 28 },
  pillar: { flex: 1 },
  pillarTop: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 3.5, height: 3.5, borderRadius: 2, backgroundColor: c.brandPrimary },
  pillarTitle: { fontFamily: fonts.bodyMedium, color: c.onSurfaceSecondary, letterSpacing: 1.1 },
  pillarText: { marginTop: 5, marginLeft: 1, paddingLeft: 8, borderLeftWidth: 1, borderLeftColor: c.border, fontFamily: fonts.body, color: c.onSurfaceTertiary },
  hintWrap: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  hint: { alignItems: "center", gap: 9, paddingHorizontal: 24, paddingTop: 8 },
  mouse: { height: 34, width: 21, borderWidth: 1, borderRadius: 12, borderColor: c.heroOutline, alignItems: "center", paddingTop: 10 },
  mouseDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: c.brandPrimary },
  hintText: { color: c.onSurfaceTertiary, fontFamily: fonts.body, letterSpacing: 1.8, fontSize: 8.5 },
}));