import Feather from "@react-native-vector-icons/feather";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { getWaitlistCount } from "@/src/api";
import { ChapterHeading } from "@/src/components/chapter-heading";
import { DualCards, EventPreview, PilotPreview } from "@/src/components/product-previews";
import { Reveal, Section } from "@/src/components/reveal";
import { PrimaryButton } from "@/src/components/ui";
import { useCopy } from "@/src/content";
import { fonts, makeStyles, useTheme } from "@/src/theme";

export function WorksSection({ onY, onJoin }: { onY: (y: number) => void; onJoin: () => void }) {
  const styles = useStyles();
  const t = useCopy();
  const { colors } = useTheme();
  const [feature, setFeature] = useState(0);
  const { data: count } = useQuery({ queryKey: ["waitlist-count"], queryFn: getWaitlistCount });
  return <Section testID="section-works" onY={onY} style={styles.wrap}>
    <Reveal><ChapterHeading index={2} title={t.howTitle} accent={t.howAccent} lead={t.howLead} /></Reveal>
    <Text testID="product-preview-heading" style={styles.kicker}>{t.preview}</Text>
    <View style={styles.tabs}>
      {t.tabs.map((label, i) => <Pressable key={i} testID={`feature-tab-${i}`} accessibilityRole="tab" accessibilityState={{ selected: feature === i }} onPress={() => setFeature(i)} style={({ pressed }) => [styles.tab, feature === i && styles.tabOn, pressed && styles.pressed]}>
        <Feather name={(["layers", "bar-chart-2", "radio"] as const)[i]} size={16} color={feature === i ? colors.blue : colors.muted} /><Text style={[styles.tabText, feature === i && styles.tabTextOn]}>{label}</Text>
      </Pressable>)}
    </View>
    <View testID="product-workspace" style={styles.workspace}>
      <View style={styles.workspaceHeader}><View style={styles.windowDots}>{[0, 1, 2].map((i) => <View key={i} style={styles.windowDot} />)}</View><Text testID="workspace-name" style={styles.workspaceName}>CONTECH OS / {t.workspace}</Text><Feather name="maximize-2" size={11} color={colors.muted} /></View>
      <View style={styles.workspaceContent}>{feature === 0 ? <DualCards /> : feature === 1 ? <PilotPreview /> : <EventPreview />}</View>
      <Text testID="product-sample-label" style={styles.sample}>{t.sample}</Text>
    </View>
    <View style={styles.featureDescription}>
      <Text style={styles.featureNumber}>0{feature + 1}</Text>
      <View style={styles.flex}><Text testID="feature-title" style={styles.featureTitle}>{t.features[feature].title}</Text><Text testID="feature-description" style={styles.featureBody}>{t.features[feature].body}</Text></View>
    </View>
    <View style={styles.cta} testID="section-join">
      <Text testID="join-section-title" style={styles.ctaTitle}>{t.ctaTitle}</Text>
      <Text testID="join-section-description" style={styles.ctaBody}>{t.ctaBody}</Text>
      <PrimaryButton testID="final-join-waitlist-button" label={t.join} onPress={onJoin} />
      <Text testID="waitlist-count-text" style={styles.count}>{typeof count === "number" && count > 0 ? `${count} ${t.count}` : t.first}</Text>
    </View>
    <View style={styles.footer}><Text testID="footer-motto" style={styles.motto}>{t.footer}</Text><Text testID="footer-copyright" style={styles.copyright}>© 2026 ConTech OS</Text></View>
  </Section>;
}

const useStyles = makeStyles((c) => ({
  wrap: { paddingHorizontal: 24, paddingTop: 48, paddingBottom: 48, borderTopWidth: 1, borderTopColor: c.border },
  kicker: { fontFamily: fonts.bodyMedium, fontSize: 9, letterSpacing: 1.4, color: c.muted, marginTop: 36, marginBottom: 15 },
  tabs: { flexDirection: "row", gap: 6, marginBottom: 17 },
  tab: { flex: 1, minHeight: 65, paddingHorizontal: 4, paddingVertical: 10, gap: 7, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: c.border, borderRadius: 4, backgroundColor: c.glass },
  tabOn: { backgroundColor: c.blueTint, borderColor: c.borderStrong },
  tabText: { fontFamily: fonts.bodyMedium, fontSize: 10, color: c.muted, textAlign: "center" },
  tabTextOn: { color: c.blue },
  workspace: { borderRadius: 7, backgroundColor: c.surfaceSecondary, borderWidth: 1, borderColor: c.borderStrong, overflow: "hidden" },
  workspaceHeader: { flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: c.border, paddingHorizontal: 13, paddingVertical: 14, backgroundColor: c.surface },
  windowDots: { flexDirection: "row", gap: 3 },
  windowDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: c.borderStrong },
  workspaceName: { flex: 1, fontFamily: fonts.body, fontSize: 7, letterSpacing: 0.6, color: c.muted },
  workspaceContent: { padding: 18, minHeight: 392 },
  sample: { fontFamily: fonts.body, fontSize: 9, color: c.muted, textAlign: "center", paddingVertical: 12, borderTopWidth: 1, borderTopColor: c.border },
  featureDescription: { flexDirection: "row", gap: 14, marginTop: 24, minHeight: 145 },
  featureNumber: { fontFamily: fonts.display, fontSize: 24, color: c.blue },
  flex: { flex: 1 },
  featureTitle: { fontFamily: fonts.displayMedium, fontSize: 21, lineHeight: 25, color: c.onSurface },
  featureBody: { fontFamily: fonts.body, fontSize: 13, lineHeight: 21, color: c.onSurfaceTertiary, marginTop: 10 },
  cta: { borderTopWidth: 1, borderTopColor: c.border, marginTop: 24, paddingTop: 30 },
  ctaTitle: { fontFamily: fonts.displayMedium, fontSize: 30, color: c.onSurface, letterSpacing: -0.6 },
  ctaBody: { fontFamily: fonts.body, fontSize: 14, lineHeight: 22, color: c.onSurfaceTertiary, marginTop: 12, marginBottom: 24 },
  count: { textAlign: "center", fontFamily: fonts.body, fontSize: 11, color: c.muted, marginTop: 14 },
  footer: { marginTop: 48, alignItems: "center", gap: 22 },
  motto: { fontFamily: fonts.display, fontSize: 17, lineHeight: 25, color: c.onSurfaceTertiary, textAlign: "center" },
  copyright: { fontFamily: fonts.body, fontSize: 10, letterSpacing: 1.2, color: c.muted },
  pressed: { opacity: 0.6 },
}));