import Feather from "@react-native-vector-icons/feather";
import { useState } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import { ChapterHeading } from "@/src/components/chapter-heading";
import { LogoMark } from "@/src/components/logo";
import { Reveal, Section } from "@/src/components/reveal";
import { useCopy } from "@/src/content";
import { tapSelect } from "@/src/haptics";
import { fonts, makeStyles, useTheme } from "@/src/theme";

const MODULES = [
  { key: "builders", icon: "home" }, { key: "tech", icon: "cpu" },
  { key: "startups", icon: "zap" }, { key: "investors", icon: "trending-up" },
  { key: "experts", icon: "tool" }, { key: "universities", icon: "book-open" },
] as const;

export function ConnectSection({ onY, height }: { onY: (y: number) => void; height: number }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const t = useCopy();
  const { width } = useWindowDimensions();
  const [selected, setSelected] = useState(0);
  const size = Math.min(width - 48, 430);
  const nodeW = (size - 84) / 2;
  return <Section testID="section-connect" onY={onY} style={[styles.wrap, { minHeight: height }]}>
    <Reveal><ChapterHeading index={1} title={t.whoTitle} accent={t.whoAccent} lead={t.whoLead} /></Reveal>
    <View style={styles.planHeading}><Text testID="ecosystem-plan-label" style={styles.planLabel}>{t.ecosystem}</Text><Text style={styles.planLabel}>06 / 01</Text></View>
    <View testID="audience-architecture" style={[styles.plan, { width: size, height: 352 }]}>
      <View style={[styles.centerAxis, { left: size / 2 }]} />
      <View style={[styles.centerHorizontal, { width: size }]} />
      {[0, 1, 2].map((row) => <View key={row} style={[styles.crossbar, { top: 51 + row * 120, left: nodeW, width: 84 }]} />)}
      {MODULES.map((m, i) => <Pressable key={m.key} testID={`audience-node-${m.key}`} accessibilityRole="button" accessibilityLabel={t.audiences[i].title} accessibilityState={{ selected: selected === i }} onPress={() => { tapSelect(); setSelected(i); }} style={({ pressed }) => [styles.module, { width: nodeW, left: i % 2 ? size - nodeW : 0, top: Math.floor(i / 2) * 120 }, selected === i && styles.moduleOn, pressed && styles.pressed]}>
        <View style={styles.moduleTop}><Feather name={m.icon} size={20} color={selected === i ? colors.blue : colors.onSurfaceTertiary} /><Text style={styles.moduleNumber}>0{i + 1}</Text></View>
        <Text testID={`audience-label-${m.key}`} style={[styles.moduleLabel, selected === i && styles.moduleLabelOn]}>{t.audiences[i].label}</Text>
        <View style={[styles.corner, selected === i && styles.cornerOn]} />
      </Pressable>)}
      <View testID="ecosystem-central-symbol" style={[styles.core, { left: size / 2 - 29, pointerEvents: "none" }]}><LogoMark size={31} /></View>
      <Text style={[styles.osLabel, { left: size / 2 - 32 }]}>CONTECH OS</Text>
    </View>
    <View style={styles.detail} testID="audience-detail-card">
      <Text testID="audience-detail-index" style={styles.detailIndex}>0{selected + 1} — {t.activeModule}</Text>
      <Text testID="audience-detail-title" style={styles.detailTitle}>{t.audiences[selected].title}</Text>
      <Text testID="audience-detail-description" style={styles.detailBody}>{t.audiences[selected].body}</Text>
    </View>
    <View style={styles.bottom}><Feather name="globe" size={15} color={colors.blue} /><Text testID="ecosystem-caption" style={styles.caption}>{t.network}</Text></View>
  </Section>;
}

const useStyles = makeStyles((c) => ({
  wrap: { paddingHorizontal: 24, paddingTop: 48, paddingBottom: 80, borderTopWidth: 1, borderTopColor: c.border },
  planHeading: { flexDirection: "row", justifyContent: "space-between", marginTop: 30, paddingBottom: 16 },
  planLabel: { fontFamily: fonts.bodyMedium, fontSize: 8, letterSpacing: 1.4, color: c.muted },
  plan: { alignSelf: "center", marginTop: 5 },
  centerAxis: { position: "absolute", top: 51, bottom: 61, width: 1, backgroundColor: c.borderStrong },
  centerHorizontal: { position: "absolute", top: 171, height: 1, backgroundColor: c.borderStrong },
  crossbar: { position: "absolute", height: 1, backgroundColor: c.borderStrong },
  module: { position: "absolute", minHeight: 102, padding: 12, backgroundColor: c.glass, borderWidth: 1, borderColor: c.border, borderTopWidth: 2 },
  moduleOn: { borderColor: c.borderStrong, backgroundColor: c.blueTint },
  moduleTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  moduleNumber: { fontFamily: fonts.body, fontSize: 9, color: c.muted },
  moduleLabel: { fontFamily: fonts.bodyMedium, fontSize: 9, lineHeight: 14, color: c.onSurfaceTertiary, letterSpacing: 0.15 },
  moduleLabelOn: { color: c.onSurface },
  corner: { position: "absolute", right: -1, bottom: -1, width: 7, height: 7, borderRightWidth: 1, borderBottomWidth: 1, borderColor: c.borderStrong },
  cornerOn: { borderColor: c.brandPrimary, borderRightWidth: 2, borderBottomWidth: 2 },
  core: { position: "absolute", top: 142, width: 58, height: 58, backgroundColor: c.surfaceSecondary, borderWidth: 1, borderColor: c.borderStrong, alignItems: "center", justifyContent: "center" },
  osLabel: { position: "absolute", top: 210, width: 64, textAlign: "center", fontFamily: fonts.bodyMedium, fontSize: 7, letterSpacing: 0.6, color: c.blue },
  detail: { borderLeftWidth: 2, borderLeftColor: c.blueStrong, padding: 18, backgroundColor: c.glass, minHeight: 170 },
  detailIndex: { fontFamily: fonts.bodyMedium, fontSize: 8, letterSpacing: 1.2, color: c.blue },
  detailTitle: { fontFamily: fonts.displayMedium, fontSize: 23, color: c.onSurface, marginTop: 10 },
  detailBody: { fontFamily: fonts.body, fontSize: 13, lineHeight: 21, color: c.onSurfaceTertiary, marginTop: 10 },
  bottom: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 24 },
  caption: { fontFamily: fonts.body, fontSize: 11, color: c.muted, flexShrink: 1 },
  pressed: { opacity: 0.65 },
}));