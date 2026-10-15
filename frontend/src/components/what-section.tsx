import Feather from "@react-native-vector-icons/feather";
import { Text, View } from "react-native";

import { Reveal, Section } from "@/src/components/reveal";
import { Accent, Body, Eyebrow, Headline } from "@/src/components/ui";
import { fonts, makeStyles, useTheme } from "@/src/theme";

const PROBLEMS = [
  { icon: "wifi-off", t: "Lost Momentum", d: "Connections made at trade shows and summits fade into buried email chains." },
  { icon: "clock", t: "Friction in Pilot Execution", d: "Unclear KPIs, slow contract approvals, and informal reviews delay technology adoption." },
];
const SOLUTIONS = [
  { n: "01", t: "Dynamic Need/Offer Cards", d: "Publish active jobsite problems or list available tech assets in real time." },
  { n: "02", t: "Algorithmic Matchmaking", d: "Automatic pairing based on technical taxonomy, TRL level, and deployment readiness." },
  { n: "03", t: "Integrated Pilot Workspace", d: "Manage legal agreements, jobsite logs, and ROI tracking in a single dashboard." },
];

export function WhatSection({ onY }: { onY: (y: number) => void }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Section style={styles.wrap} testID="section-what" onY={onY}>
      <Reveal>
        <Eyebrow>WHAT IT DOES</Eyebrow>
        <Headline size={34}>Bridging the <Accent>Post-Event Void.</Accent></Headline>
        <Body style={styles.lead}>The right connection is often harder to find than the right solution.</Body>
      </Reveal>
      <Reveal style={styles.subheading}><Text testID="industry-problem-heading" style={styles.kicker}>THE INDUSTRY PROBLEM</Text></Reveal>
      {PROBLEMS.map((problem, i) => (
        <Reveal key={problem.t} delay={i} style={styles.problem}>
          <View style={styles.icon}><Feather name={problem.icon as any} size={19} color={colors.onSurfaceTertiary} /></View>
          <View style={styles.flex}><Text testID={`problem-title-${i}`} style={styles.title}>{problem.t}</Text><Text testID={`problem-description-${i}`} style={styles.description}>{problem.d}</Text></View>
        </Reveal>
      ))}
      <Reveal style={styles.subheading}><Text testID="contech-solution-heading" style={[styles.kicker, styles.orange]}>THE CONTECH OS SOLUTION</Text></Reveal>
      {SOLUTIONS.map((solution, i) => (
        <Reveal key={solution.n} delay={i} style={styles.solution}>
          <Text style={styles.number}>{solution.n}</Text>
          <View style={styles.flex}><Text testID={`solution-title-${i}`} style={styles.title}>{solution.t}</Text><Text testID={`solution-description-${i}`} style={styles.description}>{solution.d}</Text></View>
        </Reveal>
      ))}
    </Section>
  );
}

const useStyles = makeStyles((c) => ({
  wrap: { paddingHorizontal: 26, paddingTop: 62 },
  flex: { flex: 1 },
  lead: { marginTop: 16 },
  subheading: { marginTop: 36, marginBottom: 18 },
  kicker: { fontFamily: fonts.bodyMedium, fontSize: 10, letterSpacing: 2.1, color: c.onSurfaceTertiary },
  orange: { color: c.brandPrimary },
  problem: { flexDirection: "row", gap: 16, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: c.border },
  icon: { paddingTop: 2, width: 24 },
  title: { fontFamily: fonts.displayMedium, fontSize: 19, color: c.onSurface, marginBottom: 7 },
  description: { fontFamily: fonts.body, fontSize: 14, lineHeight: 22, color: c.onSurfaceTertiary },
  solution: { flexDirection: "row", gap: 18, padding: 20, borderRadius: 16, backgroundColor: c.glass, borderWidth: 1, borderColor: c.glassBorder, marginBottom: 12 },
  number: { width: 26, fontFamily: fonts.displayLight, fontSize: 25, color: c.brandPrimary },
}));