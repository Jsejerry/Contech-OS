import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton } from "@/src/components/ui";
import { useCopy } from "@/src/content";
import { fonts, makeStyles } from "@/src/theme";

export function WaitlistDock({ onJoin, chapter, onHeight }: { onJoin: () => void; chapter: number; onHeight: (height: number) => void }) {
  const t = useCopy();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  return <View testID="waitlist-dock" onLayout={(e) => onHeight(e.nativeEvent.layout.height)} style={[styles.dock, { paddingBottom: insets.bottom + 14 }]}>
    <View style={styles.status}>
      <View style={styles.liveRow}><View style={styles.dot} /><Text testID="dock-access-label" style={styles.label}>{t.early}</Text></View>
      <Text testID="dock-chapter-progress" style={styles.progress}>0{chapter + 1} <Text style={styles.total}>/ 03</Text></Text>
    </View>
    <View style={styles.button}><PrimaryButton testID="persistent-join-waitlist-button" label={t.join} onPress={onJoin} /></View>
  </View>;
}

const useStyles = makeStyles((c) => ({
  dock: { position: "absolute", left: 0, right: 0, bottom: 0, paddingTop: 14, paddingHorizontal: 24, borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.glassStrong, flexDirection: "row", alignItems: "center", gap: 14 },
  status: { flex: 1 },
  liveRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: c.brandPrimary },
  label: { flexShrink: 1, fontFamily: fonts.bodyMedium, fontSize: 8, letterSpacing: 1, color: c.onSurfaceTertiary },
  progress: { fontFamily: fonts.displayMedium, fontSize: 18, color: c.onSurface, marginTop: 4 },
  total: { color: c.muted, fontSize: 13 },
  button: { flex: 2.05, maxWidth: 320 },
}));