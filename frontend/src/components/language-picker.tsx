import Feather from "@react-native-vector-icons/feather";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useCopy } from "@/src/content";
import { type Language, usePreferences } from "@/src/preferences";
import { fonts, makeStyles, useTheme } from "@/src/theme";

export const LANGUAGES: { key: Language; label: string }[] = [{ key: "en", label: "English" }, { key: "fr", label: "Français" }, { key: "es", label: "Español" }];

export function LanguagePicker({ prefix }: { prefix: string }) {
  const [expanded, setExpanded] = useState(false);
  const { language, setLanguage } = usePreferences();
  const { colors } = useTheme();
  const styles = useStyles();
  const t = useCopy();
  return (
    <View testID={`${prefix}-language-picker`}>
      <Pressable testID={`${prefix}-language-toggle`} accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded(!expanded)} style={styles.row}>
        <Feather name="globe" size={18} color={colors.blue} />
        <Text style={styles.label}>{t.language}</Text>
        <Text style={styles.current}>{LANGUAGES.find((l) => l.key === language)?.label}</Text>
        <Feather name={expanded ? "chevron-up" : "chevron-down"} size={16} color={colors.muted} />
      </Pressable>
      {expanded && <View style={styles.options} testID={`${prefix}-language-options`}>
        {LANGUAGES.map((l) => <Pressable key={l.key} testID={`${prefix}-language-${l.key}`} accessibilityRole="radio" accessibilityState={{ checked: language === l.key }} onPress={() => setLanguage(l.key)} style={[styles.option, language === l.key && styles.selected]}>
          <Text style={[styles.optionText, language === l.key && styles.selectedText]}>{l.label}</Text>
          {language === l.key && <Feather name="check" size={13} color={colors.blue} />}
        </Pressable>)}
      </View>}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  row: { minHeight: 56, flexDirection: "row", alignItems: "center", gap: 12 },
  label: { fontFamily: fonts.bodyMedium, fontSize: 15, color: c.onSurface, flex: 1 },
  current: { fontFamily: fonts.body, fontSize: 12, color: c.muted },
  options: { flexDirection: "row", gap: 6, marginBottom: 12 },
  option: { flex: 1, minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, borderWidth: 1, borderColor: c.border, borderRadius: 5 },
  selected: { backgroundColor: c.blueTint, borderColor: c.borderStrong },
  optionText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: c.onSurfaceTertiary },
  selectedText: { color: c.blue },
}));