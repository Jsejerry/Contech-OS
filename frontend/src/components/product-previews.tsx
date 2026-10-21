import Feather from "@react-native-vector-icons/feather";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useCopy } from "@/src/content";
import { fonts, makeStyles, useTheme } from "@/src/theme";

export function DualCards() {
  const [side, setSide] = useState<"need" | "offer">("need");
  const styles = useStyles();
  const { colors } = useTheme();
  const t = useCopy();
  return <View testID="dual-card-preview">
    <View style={styles.tabs}>{(["need", "offer"] as const).map((key) => <Pressable key={key} testID={`dual-card-${key}-tab`} accessibilityRole="tab" accessibilityState={{ selected: side === key }} onPress={() => setSide(key)} style={[styles.tab, side === key && styles.tabOn]}><Text style={[styles.tabText, side === key && styles.tabTextOn]}>{key === "need" ? t.needs : t.offers}</Text><Text style={styles.tabCount}>01</Text></Pressable>)}</View>
    <View testID="dual-card" style={styles.card}>
      <View style={styles.row}><View style={styles.blueDot} /><Text testID="dual-card-status" style={styles.kicker}>{side === "need" ? t.activeNeed : t.availableOffer}</Text><Feather name="more-horizontal" size={17} color={colors.muted} /></View>
      <View style={styles.category}><Feather name="layers" size={26} color={colors.blue} /><View style={styles.categoryLine} /></View>
      <Text testID="dual-card-title" style={styles.title}>{side === "need" ? t.needTitle : t.offerTitle}</Text>
      <Text testID="dual-card-description" style={styles.body}>{side === "need" ? t.needBody : t.offerBody}</Text>
      <View style={styles.tags}>{[t.readiness, t.pilotLength].map((tag, i) => <Text key={i} testID={`dual-card-tag-${i}`} style={styles.tag}>{tag}</Text>)}</View>
      <View style={styles.cardFooter}><Feather name="map-pin" size={12} color={colors.muted} /><Text testID="dual-card-location" style={styles.meta}>{t.location}</Text><Feather name="arrow-up-right" size={15} color={colors.blue} /></View>
    </View>
    <Text testID="dual-card-caption" style={styles.caption}>{t.match}</Text>
  </View>;
}

export function PilotPreview() {
  const [week, setWeek] = useState(0);
  const styles = useStyles();
  const { colors } = useTheme();
  const t = useCopy();
  return <View testID="pilot-preview">
    <Text testID="pilot-title" style={styles.title}>{t.playbook}</Text>
    <View style={styles.pilotMeta}><View style={styles.blueDot} /><Text style={styles.meta}>{t.onTrack}</Text></View>
    <View style={styles.tabs}>{t.weeks.map((w, i) => <Pressable key={i} testID={`pilot-week-${i + 1}`} accessibilityRole="tab" accessibilityState={{ selected: week === i }} onPress={() => setWeek(i)} style={[styles.tab, week === i && styles.tabOn]}><Text style={[styles.tabText, week === i && styles.tabTextOn]}>{w}</Text></Pressable>)}</View>
    <View style={styles.metric}><View><Text style={styles.kicker}>{t.progress}</Text><Text testID="pilot-milestone-value" style={styles.metricValue}>{week === 0 ? "2" : "3"}<Text style={styles.metricUnit}> / 4</Text></Text></View><View style={styles.bars}>{[20, 28, 35, 31, 42, 48, week === 0 ? 38 : 63].map((h, i) => <View key={i} style={[styles.bar, { height: h }, i === 6 && styles.barOn]} />)}</View></View>
    {t.milestones.map((m, i) => <View key={i} style={styles.milestone}><Feather name={i < week + 2 ? "check-circle" : "circle"} size={15} color={i < week + 2 ? colors.blue : colors.muted} /><Text testID={`pilot-milestone-${i}`} style={styles.milestoneText}>{m}</Text></View>)}
    <View style={styles.agreement}><Feather name="file-text" size={18} color={colors.blue} /><Text style={styles.agreementText}>{t.agreement}</Text><Text testID="pilot-agreement-status" style={styles.signed}>{t.signed}</Text></View>
  </View>;
}

export function EventPreview() {
  const [handoff, setHandoff] = useState(false);
  const t = useCopy();
  const styles = useStyles();
  const { colors } = useTheme();
  return <View testID="event-preview">
    <Text testID="event-label" style={styles.kicker}>{t.eventLabel}</Text>
    <View style={styles.eventGraphic}><View style={styles.entity}><Feather name="home" size={29} color={colors.blue} /></View><View style={styles.connection} /><Feather name={handoff ? "check-circle" : "link"} size={20} color={colors.blue} /><View style={styles.connection} /><View style={styles.entity}><Feather name="cpu" size={29} color={colors.blue} /></View></View>
    <Text testID="event-preview-title" style={styles.title}>{handoff ? t.projectReady : t.eventTitle}</Text>
    <Text testID="event-preview-description" style={styles.body}>{handoff ? t.projectBody : t.eventPeople}</Text>
    {handoff && <View testID="event-project-milestone" style={styles.agreement}><Feather name="flag" size={18} color={colors.blue} /><Text style={styles.agreementText}>{t.milestones[0]}</Text></View>}
    <Pressable testID={handoff ? "event-reset-button" : "event-handoff-button"} accessibilityRole="button" onPress={() => setHandoff(!handoff)} style={({ pressed }) => [styles.eventButton, pressed && { opacity: 0.65 }]}><Text style={styles.eventButtonText}>{handoff ? t.reset : t.eventAction}</Text><Feather name={handoff ? "arrow-left" : "arrow-right"} size={16} color={colors.blue} /></Pressable>
  </View>;
}

const useStyles = makeStyles((c) => ({
  tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: c.border, marginBottom: 20 },
  tab: { flex: 1, minHeight: 44, flexDirection: "row", gap: 10, alignItems: "center", justifyContent: "center", borderBottomWidth: 2, borderBottomColor: c.transparent },
  tabOn: { borderBottomColor: c.blue },
  tabText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: c.muted },
  tabTextOn: { color: c.blue },
  tabCount: { fontFamily: fonts.body, fontSize: 9, color: c.muted },
  card: { borderWidth: 1, borderColor: c.borderStrong, borderRadius: 5, padding: 17, backgroundColor: c.surface },
  row: { flexDirection: "row", alignItems: "center", gap: 7 },
  blueDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: c.blue },
  kicker: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 8, letterSpacing: 1.4, color: c.blue },
  category: { flexDirection: "row", alignItems: "center", gap: 15, marginTop: 24 },
  categoryLine: { height: 1, flex: 1, backgroundColor: c.border },
  title: { fontFamily: fonts.displayMedium, fontSize: 25, lineHeight: 29, color: c.onSurface, marginTop: 14, letterSpacing: -0.4 },
  body: { fontFamily: fonts.body, fontSize: 12, lineHeight: 20, color: c.onSurfaceTertiary, marginTop: 12 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 19 },
  tag: { paddingVertical: 6, paddingHorizontal: 8, backgroundColor: c.blueTint, fontFamily: fonts.bodyMedium, fontSize: 10, color: c.blue, borderRadius: 3, overflow: "hidden" },
  cardFooter: { marginTop: 23, borderTopWidth: 1, borderTopColor: c.border, paddingTop: 13, flexDirection: "row", alignItems: "center", gap: 7 },
  meta: { fontFamily: fonts.body, fontSize: 10, color: c.muted, flex: 1 },
  caption: { fontFamily: fonts.body, fontSize: 10, color: c.muted, textAlign: "center", marginTop: 18 },
  pilotMeta: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 10, marginBottom: 14 },
  metric: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", backgroundColor: c.surface, padding: 16, borderWidth: 1, borderColor: c.border, borderRadius: 4, marginBottom: 15 },
  metricValue: { fontFamily: fonts.display, fontSize: 44, color: c.onSurface, marginTop: 10 },
  metricUnit: { fontSize: 19, color: c.muted },
  bars: { flexDirection: "row", alignItems: "flex-end", gap: 5, height: 67 },
  bar: { width: 9, backgroundColor: c.blueTint, borderTopWidth: 1, borderTopColor: c.blueStrong },
  barOn: { backgroundColor: c.blueStrong, borderTopColor: c.blue },
  milestone: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: c.divider },
  milestoneText: { flex: 1, fontFamily: fonts.body, fontSize: 11, color: c.onSurfaceSecondary },
  agreement: { flexDirection: "row", alignItems: "center", gap: 9, padding: 12, backgroundColor: c.blueTint, marginTop: 18, borderRadius: 3 },
  agreementText: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 10, color: c.onSurfaceSecondary },
  signed: { fontFamily: fonts.bodyMedium, fontSize: 9, color: c.blue },
  eventGraphic: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 34, marginBottom: 24, gap: 7 },
  entity: { width: 58, height: 68, borderWidth: 1, borderColor: c.borderStrong, backgroundColor: c.blueTint, alignItems: "center", justifyContent: "center" },
  connection: { height: 1, backgroundColor: c.borderStrong, flex: 1 },
  eventButton: { minHeight: 48, borderWidth: 1, borderColor: c.borderStrong, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 28, borderRadius: 4, padding: 10 },
  eventButtonText: { fontFamily: fonts.bodyMedium, fontSize: 11, color: c.blue, flexShrink: 1 },
}));