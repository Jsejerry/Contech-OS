import Feather from "@react-native-vector-icons/feather";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Wordmark } from "@/src/components/logo";
import { LANGUAGES } from "@/src/components/language-picker";
import { useCopy } from "@/src/content";
import { usePreferences } from "@/src/preferences";
import { fonts, makeStyles, useTheme } from "@/src/theme";

export const HEADER_HEIGHT = 68;

export function Header({ onMenu, onAbout }: { onMenu: () => void; onAbout: () => void }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const styles = useStyles();
  const { colors } = useTheme();
  const t = useCopy();
  const { language, setLanguage } = usePreferences();
  const [languageOpen, setLanguageOpen] = useState(false);
  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]} testID="landing-header">
      <View style={styles.mainRow}>
      <View style={styles.left}>
        <Pressable accessibilityRole="button" accessibilityLabel={t.openMenu} testID="header-menu-button" onPress={onMenu} style={({ pressed }) => [styles.menu, pressed && styles.pressed]}>
          <Feather name="menu" size={23} color={colors.onSurface} />
        </Pressable>
        <Pressable testID="header-about-button" accessibilityRole="button" accessibilityLabel={t.about} onPress={onAbout} style={({ pressed }) => [styles.about, pressed && styles.pressed]}>
          <Text testID="header-about-label" numberOfLines={1} style={styles.aboutText}>{t.about}</Text>
        </Pressable>
      </View>
      <Wordmark size={width < 360 ? 20 : 24} testID="header-wordmark" />
      <View style={styles.right}>
        <Pressable testID="header-language-toggle" accessibilityRole="button" accessibilityLabel={t.language} accessibilityState={{ expanded: languageOpen }} onPress={() => setLanguageOpen(true)} style={({ pressed }) => [styles.languageButton, pressed && styles.pressed]}>
          <Feather name="globe" size={15} color={colors.blue} />
          <Text testID="header-language-current" style={styles.languageCode}>{language.toUpperCase()}</Text>
          <Feather name="chevron-down" size={12} color={colors.muted} />
        </Pressable>
      </View>
      </View>
      <Modal visible={languageOpen} transparent animationType="fade" onRequestClose={() => setLanguageOpen(false)} statusBarTranslucent>
        <View style={styles.overlay}>
          <Pressable testID="header-language-backdrop" accessibilityRole="button" accessibilityLabel={t.close} onPress={() => setLanguageOpen(false)} style={StyleSheet.absoluteFill} />
          <View testID="header-language-options" style={[styles.dropdown, { top: insets.top + HEADER_HEIGHT }]}>
            <Text testID="header-language-label" style={styles.languageLabel}>{t.language}</Text>
            {LANGUAGES.map((option) => <Pressable key={option.key} testID={`header-language-${option.key}`} accessibilityRole="radio" accessibilityState={{ checked: language === option.key }} onPress={() => { setLanguage(option.key); setLanguageOpen(false); }} style={({ pressed }) => [styles.option, pressed && styles.pressed]}>
              <Text style={styles.optionText}>{option.label}</Text>
              {language === option.key && <Feather name="check" size={16} color={colors.blue} />}
            </Pressable>)}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { position: "absolute", top: 0, left: 0, right: 0, paddingHorizontal: 10, paddingBottom: 11, backgroundColor: c.glassStrong, borderBottomWidth: 1, borderBottomColor: c.divider },
  mainRow: { flexDirection: "row", alignItems: "center", height: 44 },
  left: { flex: 1, flexDirection: "row", alignItems: "center" },
  right: { flex: 1, alignItems: "flex-end" },
  menu: { width: 44, height: 44, alignItems: "flex-start", justifyContent: "center" },
  about: { minHeight: 44, width: 56, alignItems: "center", justifyContent: "center", borderRadius: 4, backgroundColor: c.blueTint },
  aboutText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: c.onSurface },
  languageButton: { minHeight: 44, minWidth: 62, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 5 },
  languageCode: { fontFamily: fonts.bodyMedium, fontSize: 11, color: c.onSurfaceSecondary },
  overlay: { flex: 1 },
  dropdown: { position: "absolute", right: 12, width: 190, padding: 12, backgroundColor: c.surfaceSecondary, borderWidth: 1, borderColor: c.borderStrong, borderRadius: 6 },
  languageLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, color: c.muted, marginBottom: 6 },
  option: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 8 },
  optionText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: c.onSurface },
  pressed: { opacity: 0.55 },
}));