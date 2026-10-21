import Feather from "@react-native-vector-icons/feather";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Wordmark } from "@/src/components/logo";
import { useCopy } from "@/src/content";
import { fonts, makeStyles, useTheme } from "@/src/theme";

export function Header({ onMenu, onAbout }: { onMenu: () => void; onAbout: () => void }) {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const t = useCopy();
  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]} testID="landing-header">
      <View style={styles.left}>
        <Pressable accessibilityRole="button" accessibilityLabel={t.openMenu} testID="header-menu-button" onPress={onMenu} style={({ pressed }) => [styles.menu, pressed && styles.pressed]}>
          <Feather name="menu" size={23} color={colors.onSurface} />
        </Pressable>
        <View style={styles.separator} />
        <Pressable testID="header-about-button" accessibilityRole="button" onPress={onAbout} style={({ pressed }) => [styles.about, pressed && styles.pressed]}>
          <Text style={styles.aboutText}>{t.about}</Text>
        </Pressable>
      </View>
      <Wordmark size={25} testID="header-wordmark" />
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { position: "absolute", top: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: c.glassStrong, borderBottomWidth: 1, borderBottomColor: c.divider },
  left: { flexDirection: "row", alignItems: "center", gap: 9 },
  menu: { width: 44, height: 44, alignItems: "flex-start", justifyContent: "center" },
  separator: { width: 1, height: 17, backgroundColor: c.border },
  about: { minHeight: 44, justifyContent: "center", paddingHorizontal: 4 },
  aboutText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: c.onSurfaceSecondary },
  pressed: { opacity: 0.55 },
}));