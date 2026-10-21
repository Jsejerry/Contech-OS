import Feather from "@react-native-vector-icons/feather";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChapterHeading } from "@/src/components/chapter-heading";
import { Section } from "@/src/components/reveal";
import { useCopy } from "@/src/content";
import { tapSelect } from "@/src/haptics";
import { fonts, makeStyles, useTheme } from "@/src/theme";

export function WhatSection({ onY, onExplore, height }: { onY: (y: number) => void; onExplore: () => void; height: number }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const t = useCopy();
  const insets = useSafeAreaInsets();
  const [problem, setProblem] = useState(0);
  const [solution, setSolution] = useState<number | null>(null);
  return <Section testID="section-what" onY={onY} style={[styles.wrap, { minHeight: height, paddingTop: insets.top + 108 }]}>
    <ChapterHeading index={0} title={t.whatTitle} accent={t.whatAccent} lead={t.whatLead} />
    <View style={styles.problemBlock}>
      <Text testID="industry-problem-heading" style={styles.kicker}>{t.industry}</Text>
      <View style={styles.problemTabs}>
        {t.problems.map((p, i) => <Pressable key={i} testID={`problem-tab-${i}`} accessibilityRole="tab" accessibilityState={{ selected: problem === i }} onPress={() => { tapSelect(); setProblem(i); }} style={[styles.problemTab, problem === i && styles.problemOn]}>
          <Feather name={i === 0 ? "link-2" : "clock"} size={15} color={problem === i ? colors.blue : colors.muted} />
          <Text testID={`problem-title-${i}`} style={[styles.problemLabel, problem === i && styles.problemLabelOn]}>{p.short}</Text>
        </Pressable>)}
      </View>
      <Text testID="problem-description" style={styles.problemBody}>{t.problems[problem].body}</Text>
    </View>
    <View style={styles.solutions}>
      <View style={styles.solutionHeading}><View style={styles.signal} /><Text testID="contech-solution-heading" style={styles.kicker}>{t.solution}</Text></View>
      {t.solutions.map((s, i) => <View key={i} style={styles.solutionRow}>
        <Pressable testID={`solution-toggle-${i}`} accessibilityRole="button" accessibilityState={{ expanded: solution === i }} onPress={() => { tapSelect(); setSolution(solution === i ? null : i); }} style={styles.solutionButton}>
          <Text style={styles.number}>0{i + 1}</Text>
          <Text testID={`solution-title-${i}`} style={styles.solutionTitle}>{s.title}</Text>
          <Feather name={solution === i ? "minus" : "plus"} size={16} color={colors.blue} />
        </Pressable>
        {solution === i && <Text testID={`solution-description-${i}`} style={styles.solutionBody}>{s.body}</Text>}
      </View>)}
    </View>
    <Pressable testID="hero-explore-button" accessibilityRole="button" onPress={onExplore} style={({ pressed }) => [styles.explore, pressed && styles.pressed]}>
      <Text style={styles.exploreText}>{t.explore}</Text><Feather name="arrow-down" size={17} color={colors.blue} />
    </Pressable>
    <View style={[styles.coordinates, { pointerEvents: "none" }]}>
      <Feather name="crosshair" size={13} color={colors.muted} />
      <Text testID="france-coordinates" style={styles.coordinateText}>48°51′ N  /  02°21′ E</Text>
      <View style={styles.coordinateLine} />
      <Text style={styles.coordinateText}>FR → WORLD</Text>
    </View>
  </Section>;
}

const useStyles = makeStyles((c) => ({
  wrap: { paddingHorizontal: 24, paddingBottom: 74 },
  kicker: { fontFamily: fonts.bodyMedium, fontSize: 9, letterSpacing: 1.7, color: c.onSurfaceTertiary },
  problemBlock: { marginTop: 26 },
  problemTabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: c.border, marginTop: 11 },
  problemTab: { flex: 1, minHeight: 49, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 8, borderBottomWidth: 2, borderBottomColor: c.transparent },
  problemOn: { borderBottomColor: c.blue },
  problemLabel: { fontFamily: fonts.bodyMedium, fontSize: 12, color: c.muted, flexShrink: 1 },
  problemLabelOn: { color: c.onSurface },
  problemBody: { fontFamily: fonts.body, fontSize: 13, lineHeight: 21, color: c.onSurfaceTertiary, marginTop: 14, minHeight: 42 },
  solutions: { marginTop: 24, paddingHorizontal: 16, paddingTop: 17, backgroundColor: c.glass, borderWidth: 1, borderColor: c.border, borderRadius: 5 },
  solutionHeading: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  signal: { width: 4, height: 4, backgroundColor: c.brandPrimary },
  solutionRow: { borderTopWidth: 1, borderTopColor: c.divider },
  solutionButton: { minHeight: 48, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  number: { fontFamily: fonts.body, fontSize: 10, color: c.blue },
  solutionTitle: { fontFamily: fonts.displayMedium, fontSize: 16, lineHeight: 20, color: c.onSurface, flex: 1 },
  solutionBody: { fontFamily: fonts.body, fontSize: 12, lineHeight: 20, color: c.onSurfaceTertiary, paddingLeft: 24, paddingRight: 10, paddingBottom: 17 },
  explore: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 12, marginTop: 18 },
  exploreText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: c.blue },
  coordinates: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 34 },
  coordinateText: { fontFamily: fonts.body, fontSize: 8, letterSpacing: 0.8, color: c.muted },
  coordinateLine: { flex: 1, height: 1, backgroundColor: c.border },
  pressed: { opacity: 0.55 },
}));