import Feather from "@react-native-vector-icons/feather";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LanguagePicker } from "@/src/components/language-picker";
import { LogoMark } from "@/src/components/logo";
import { PrimaryButton } from "@/src/components/ui";
import { useCopy } from "@/src/content";
import { fonts, makeStyles, useTheme } from "@/src/theme";

export function AboutSheet({ visible, onClose, onJoin }: { visible: boolean; onClose: () => void; onJoin: () => void }) {
  const t = useCopy();
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return visible ? (
    <View style={styles.root} testID="about-modal">
      <Pressable testID="about-backdrop" accessibilityRole="button" accessibilityLabel={t.close} onPress={onClose} style={styles.backdrop} />
      <View style={[styles.panel, { paddingBottom: insets.bottom + 20, maxHeight: "90%" }]}>
        <View style={styles.top}><Text testID="about-label" style={styles.kicker}>{t.about.toUpperCase()}</Text><Pressable testID="about-close-button" accessibilityRole="button" accessibilityLabel={t.close} onPress={onClose} style={styles.close}><Feather name="x" size={22} color={colors.onSurface} /></Pressable></View>
        <ScrollView testID="about-scroll" showsVerticalScrollIndicator={false}>
          <View style={styles.mark}><LogoMark size={44} /></View>
          <Text testID="about-title" style={styles.title}>{t.aboutTitle}</Text>
          <Text testID="about-description" style={styles.body}>{t.aboutBody}</Text>
          <Text testID="about-mission" style={styles.body}>{t.aboutBody2}</Text>
          <View style={styles.settings}><LanguagePicker prefix="about" /></View>
          <PrimaryButton testID="about-join-button" label={t.join} onPress={onJoin} />
        </ScrollView>
      </View>
    </View>
  ) : null;
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, justifyContent: "flex-end", backgroundColor: c.scrim },
  backdrop: { flex: 1 },
  panel: { backgroundColor: c.surfaceSecondary, padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderTopWidth: 1, borderColor: c.borderStrong },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  close: { height: 44, width: 44, alignItems: "flex-end", justifyContent: "center" },
  kicker: { fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 2, color: c.blue },
  mark: { marginBottom: 24 },
  title: { fontFamily: fonts.displayMedium, fontSize: 30, lineHeight: 35, color: c.onSurface, letterSpacing: -0.6 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 24, color: c.onSurfaceTertiary, marginTop: 18 },
  settings: { borderTopWidth: 1, borderTopColor: c.border, marginTop: 24, marginBottom: 20 },
}));