import Feather from "@react-native-vector-icons/feather";
import { Text, View } from "react-native";

import { Reveal, Section } from "@/src/components/reveal";
import { Accent, Body, Eyebrow, GhostButton, Headline, PrimaryButton } from "@/src/components/ui";
import { fonts, makeStyles, useTheme } from "@/src/theme";

const PILLARS = [
  { k: "PEOPLE", d: "Connect globally" },
  { k: "TECHNOLOGY", d: "Solve jobsite challenges" },
  { k: "OPPORTUNITY", d: "Turn ideas into impact" },
];
const PROBLEMS = [
  { icon: "wifi-off", t: "Lost momentum", d: "Connections made at trade shows and summits fade into buried email chains." },
  { icon: "clock", t: "Friction in pilots", d: "Unclear KPIs, slow approvals and informal reviews delay technology adoption." },
];
const SOLUTIONS = [
  { n: "01", t: "Dynamic Need / Offer cards", d: "Publish active jobsite problems or list available tech assets in real time." },
  { n: "02", t: "Algorithmic matchmaking", d: "Automatic pairing by technical taxonomy, TRL level and deployment readiness." },
  { n: "03", t: "Integrated pilot workspace", d: "Legal agreements, jobsite logs and ROI tracking in a single dashboard." },
];

export function WhatSection({ onJoin, onExplore, onY }: { onJoin: () => void; onExplore: () => void; onY: (y: number) => void }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Section style={styles.wrap} testID="section-what" onY={onY}>
      <Reveal>
        <Eyebrow lines={["A GLOBAL NETWORK", "FOR CONSTRUCTION"]} />
      </Reveal>
      <Reveal delay={1}>
        <Headline size={42}>
          Where the construction <Accent>ecosystem</Accent> connects.
        </Headline>
      </Reveal>
      <Reveal delay={2}>
        <Body style={styles.lead}>
          Discover the people, technologies and opportunities moving the built world forward — all in one connected ecosystem.
        </Body>
      </Reveal>
      <Reveal delay={3} style={styles.ctaRow}>
        <View style={styles.flex}>
          <PrimaryButton testID="hero-join-waitlist-button" label="Join Waitlist" onPress={onJoin} />
        </View>
        <View style={styles.flex}>
          <GhostButton testID="hero-explore-button" label="Explore" onPress={onExplore} />
        </View>
      </Reveal>
      <Reveal delay={4} style={styles.pillars}>
        {PILLARS.map((p) => (
          <View key={p.k} style={styles.pillar}>
            <View style={styles.pillarHead}>
              <View style={styles.dot} />
              <Text style={styles.pillarK}>{p.k}</Text>
            </View>
            <View style={styles.pillarBody}>
              <Text style={styles.pillarD}>{p.d}</Text>
            </View>
          </View>
        ))}
      </Reveal>

      <Reveal style={styles.block}>
        <Eyebrow>WHAT IT DOES</Eyebrow>
        <Headline size={30}>
          The right connection is often harder to find than the <Accent>right solution.</Accent>
        </Headline>
      </Reveal>
      {PROBLEMS.map((p, i) => (
        <Reveal key={p.t} delay={i} style={styles.card}>
          <View style={styles.iconBox}>
            <Feather name={p.icon as any} size={18} color={colors.brandPrimary} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.cardT}>{p.t}</Text>
            <Text style={styles.cardD}>{p.d}</Text>
          </View>
        </Reveal>
      ))}
      <Reveal style={styles.solHead}>
        <Text style={styles.solKicker}>THE CONTECH OS SOLUTION</Text>
      </Reveal>
      {SOLUTIONS.map((s, i) => (
        <Reveal key={s.n} delay={i} style={styles.sol}>
          <Text style={styles.solN}>{s.n}</Text>
          <View style={styles.flex}>
            <Text style={styles.cardT}>{s.t}</Text>
            <Text style={styles.cardD}>{s.d}</Text>
          </View>
        </Reveal>
      ))}
    </Section>
  );
}

const useStyles = makeStyles((c) => ({
  wrap: { paddingHorizontal: 24, paddingTop: 24 },
  flex: { flex: 1 },
  lead: { marginTop: 16, fontSize: 17, lineHeight: 26 },
  ctaRow: { flexDirection: "row", gap: 12, marginTop: 28 },
  pillars: { flexDirection: "row", marginTop: 32, gap: 8 },
  pillar: { flex: 1 },
  pillarHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: c.brandPrimary },
  pillarK: { fontFamily: fonts.bodyMedium, fontSize: 10, letterSpacing: 1.6, color: c.onSurfaceSecondary },
  pillarBody: { marginTop: 8, marginLeft: 2, paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: c.surfaceTertiary },
  pillarD: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17, color: c.muted },
  block: { marginTop: 96, marginBottom: 20 },
  card: {
    flexDirection: "row",
    gap: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: c.glass,
    borderWidth: 1,
    borderColor: c.glassBorder,
    marginBottom: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: c.brandGlow,
    alignItems: "center",
    justifyContent: "center",
  },
  cardT: { fontFamily: fonts.displayMedium, fontSize: 18, color: c.onSurface, marginBottom: 4 },
  cardD: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: c.onSurfaceTertiary },
  solHead: { marginTop: 28, marginBottom: 8 },
  solKicker: { fontFamily: fonts.bodySemi, fontSize: 12, letterSpacing: 2.4, color: c.brandPrimary },
  sol: {
    flexDirection: "row",
    gap: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  solN: { fontFamily: fonts.displayLight, fontSize: 28, color: c.brandSecondary, width: 40 },
}));
