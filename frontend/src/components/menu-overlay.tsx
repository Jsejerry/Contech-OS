import Feather from "@react-native-vector-icons/feather";
import Constants from "expo-constants";
import { useState } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LanguagePicker } from "@/src/components/language-picker";
import { Wordmark } from "@/src/components/logo";
import { PrimaryButton } from "@/src/components/ui";
import { useCopy } from "@/src/content";
import { usePreferences } from "@/src/preferences";
import { fonts, makeStyles, useTheme } from "@/src/theme";

export type MenuTarget = "what" | "connect" | "works" | "join" | "about";
const TARGETS: MenuTarget[] = ["what", "connect", "works", "about"];

export function MenuOverlay({ visible, onClose, onSelect }: { visible: boolean; onClose: () => void; onSelect: (key: MenuTarget) => void }) {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const { mode, setMode } = usePreferences();
  const t = useCopy();
  const [linkError, setLinkError] = useState(false);
  const openSocial = async (kind: "instagram" | "gmail") => {
    setLinkError(false);
    // Use the service homepages until the owner supplies a verified profile/contact.
    const extra = Constants.expoConfig?.extra;
    const url = kind === "instagram" ? extra?.instagramUrl || "https://www.instagram.com/" : extra?.contactEmail ? `mailto:${extra.contactEmail}` : "https://mail.google.com/";
    try { await Linking.openURL(url); } catch { setLinkError(true); }
  };
  return visible ? (
      <View style={[styles.root, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }]} testID="menu-overlay">
        <View style={styles.top}>
          <Pressable testID="menu-close-button" accessibilityRole="button" accessibilityLabel={t.close} onPress={onClose} style={styles.close}><Feather name="x" size={24} color={colors.onSurface} /></Pressable>
          <Wordmark size={25} testID="menu-wordmark" />
        </View>
        <ScrollView testID="menu-scroll" showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
          <Text style={styles.kicker} testID="menu-title">CONTECH OS / {t.menu.toUpperCase()}</Text>
          {TARGETS.map((key, i) => <Pressable key={key} testID={`menu-link-${key}`} accessibilityRole="button" onPress={() => onSelect(key)} style={({ pressed }) => [styles.link, pressed && styles.pressed]}>
            <Text style={styles.number}>0{i + 1}</Text>
            <Text style={styles.linkText}>{i < 3 ? t.chapters[i] : t.about}</Text>
            <Feather name="arrow-up-right" size={18} color={colors.muted} />
          </Pressable>)}
          <View style={styles.settings}>
            <LanguagePicker prefix="menu" />
            <View style={styles.themeRow}>
              <Feather name="sun" size={18} color={colors.blue} /><Text style={styles.settingLabel}>{t.theme}</Text>
              <View style={styles.segment}>
                {(["dark", "light"] as const).map((value) => <Pressable key={value} testID={`menu-theme-${value}`} accessibilityRole="radio" accessibilityState={{ checked: mode === value }} onPress={() => setMode(value)} style={[styles.themeButton, value === mode && styles.themeOn]}>
                  <Feather name={value === "dark" ? "moon" : "sun"} size={14} color={value === mode ? colors.blue : colors.muted} />
                  <Text style={[styles.themeText, value === mode && styles.themeTextOn]}>{t[value]}</Text>
                </Pressable>)}
              </View>
            </View>
          </View>
          <View style={styles.socials}>
            {(["instagram", "gmail"] as const).map((kind) => <Pressable key={kind} testID={`menu-social-${kind}`} accessibilityRole="link" onPress={() => openSocial(kind)} style={({ pressed }) => [styles.social, pressed && styles.pressed]}>
              <Feather name={kind === "instagram" ? "instagram" : "mail"} size={19} color={colors.onSurface} />
              <Text style={styles.socialText}>{kind === "instagram" ? "Instagram" : "Gmail"}</Text>
              <Feather name="arrow-up-right" size={13} color={colors.muted} />
            </Pressable>)}
          </View>
          {linkError && <Text testID="menu-social-error" accessibilityRole="alert" style={styles.error}>{t.socialError}</Text>}
          <View style={styles.cta}><PrimaryButton testID="menu-link-join" label={t.join} onPress={() => onSelect("join")} /></View>
        </ScrollView>
      </View>
  ) : null;
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface, paddingHorizontal: 24 },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: c.border },
  close: { width: 44, height: 44, justifyContent: "center" },
  body: { paddingTop: 30, paddingBottom: 16 },
  kicker: { fontFamily: fonts.bodyMedium, fontSize: 10, letterSpacing: 1.5, color: c.muted, marginBottom: 20 },
  link: { flexDirection: "row", gap: 14, alignItems: "center", minHeight: 68, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: c.divider },
  number: { fontFamily: fonts.bodyMedium, fontSize: 11, color: c.blue },
  linkText: { flex: 1, fontFamily: fonts.display, fontSize: 25, color: c.onSurface, letterSpacing: -0.5 },
  settings: { marginTop: 24 },
  themeRow: { flexDirection: "row", minHeight: 64, alignItems: "center", gap: 12, borderTopWidth: 1, borderTopColor: c.divider },
  settingLabel: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 15, color: c.onSurface },
  segment: { flexDirection: "row", backgroundColor: c.surfaceSecondary, borderRadius: 6, borderWidth: 1, borderColor: c.border, padding: 3 },
  themeButton: { flexDirection: "row", gap: 5, minHeight: 44, alignItems: "center", paddingHorizontal: 8, borderRadius: 3 },
  themeOn: { backgroundColor: c.blueTint },
  themeText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: c.muted },
  themeTextOn: { color: c.blue },
  socials: { flexDirection: "row", gap: 24, marginTop: 20 },
  social: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 8 },
  socialText: { fontFamily: fonts.body, fontSize: 13, color: c.onSurfaceSecondary },
  cta: { marginTop: 24 },
  pressed: { opacity: 0.55 },
  error: { fontFamily: fonts.body, color: c.error, fontSize: 13 },
}));