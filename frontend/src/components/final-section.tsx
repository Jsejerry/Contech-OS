import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

import { getWaitlistCount } from "@/src/api";
import { Reveal, Section } from "@/src/components/reveal";
import { Accent, Body, Headline, PrimaryButton } from "@/src/components/ui";
import { fonts, makeStyles } from "@/src/theme";

export function FinalSection({ onJoin, onY }: { onJoin: () => void; onY: (y: number) => void }) {
  const styles = useStyles();
  const { data: count } = useQuery({ queryKey: ["waitlist-count"], queryFn: getWaitlistCount });
  const glow = useSharedValue(0);
  useEffect(() => {
    glow.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [glow]);
  const halo = useAnimatedStyle(() => ({ opacity: 0.35 + glow.value * 0.45, transform: [{ scaleX: 1 + glow.value * 0.04 }, { scaleY: 1 + glow.value * 0.18 }] }));

  return (
    <Section style={styles.wrap} testID="section-join" onY={onY}>
      <Reveal style={styles.card}>
        <Text style={styles.kicker}>PILOT COHORT · LIMITED SPOTS</Text>
        <Headline size={32}>
          Together we can shape the future of the <Accent>built world.</Accent>
        </Headline>
        <Body style={styles.body}>Join the global construction innovation network before launch.</Body>
        <View style={styles.btnWrap}>
          <Animated.View style={[styles.halo, { pointerEvents: "none" }, halo]} />
          <PrimaryButton big testID="final-join-waitlist-button" label="Join Waitlist" onPress={onJoin} />
        </View>
        <Text style={styles.count} testID="waitlist-count-text">
          {typeof count === "number" && count > 0
            ? `${count} ${count === 1 ? "professional has" : "professionals have"} already joined`
            : "Be among the first to join"}
        </Text>
      </Reveal>
      <Reveal style={styles.foot}>
        <Text style={styles.motto}>Structure creates connection.{"\n"}Connection creates growth.</Text>
        <Text style={styles.copy}>© 2026 ConTech OS</Text>
      </Reveal>
    </Section>
  );
}

const useStyles = makeStyles((c) => ({
  wrap: { paddingHorizontal: 24, paddingTop: 120 },
  card: {
    padding: 24,
    borderRadius: 28,
    backgroundColor: c.glassStrong,
    borderWidth: 1,
    borderColor: c.brandGlowStrong,
  },
  kicker: { fontFamily: fonts.bodySemi, fontSize: 11, letterSpacing: 2.4, color: c.brandPrimary, marginBottom: 12 },
  body: { marginTop: 12 },
  btnWrap: { marginTop: 24, justifyContent: "center" },
  halo: {
    position: "absolute",
    left: -6,
    right: -6,
    top: -6,
    bottom: -6,
    borderRadius: 999,
    backgroundColor: c.brandGlowStrong,
  },
  count: { fontFamily: fonts.bodyMedium, fontSize: 13, color: c.onSurfaceTertiary, marginTop: 14, textAlign: "center" },
  foot: { marginTop: 32, alignItems: "center", gap: 8 },
  motto: { fontFamily: fonts.display, fontSize: 16, lineHeight: 22, color: c.onSurfaceSecondary, textAlign: "center" },
  copy: { fontFamily: fonts.body, fontSize: 12, color: c.muted },
}));
