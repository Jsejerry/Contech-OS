import Feather from "@react-native-vector-icons/feather";
import { Modal, Pressable, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Wordmark } from "@/src/components/logo";
import { fonts, makeStyles, useTheme } from "@/src/theme";

export type MenuTarget = "what" | "connect" | "works" | "join";

const LINKS: { key: MenuTarget; label: string; n: string }[] = [
  { key: "what", label: "What it does", n: "01" },
  { key: "connect", label: "Who it connects", n: "02" },
  { key: "works", label: "How it works", n: "03" },
  { key: "join", label: "Join the waitlist", n: "04" },
];

export function MenuOverlay({ visible, onClose, onSelect }: { visible: boolean; onClose: () => void; onSelect: (k: MenuTarget) => void }) {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={[styles.root, { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 24 }]} testID="menu-overlay">
        <View style={styles.top}>
          <Wordmark size={30} testID="menu-wordmark" />
          <Pressable testID="menu-close-button" onPress={onClose} style={styles.close} hitSlop={6}>
            <Feather name="x" size={24} color={colors.onSurface} />
          </Pressable>
        </View>
        <View style={styles.links}>
          {visible &&
            LINKS.map((l, i) => (
              <Animated.View key={l.key} entering={FadeInDown.delay(80 * i).springify().damping(16)}>
                <Pressable testID={`menu-link-${l.key}`} onPress={() => onSelect(l.key)} style={styles.link}>
                  <Text style={styles.n}>{l.n}</Text>
                  <Text style={[styles.label, l.key === "join" && { color: colors.brandPrimary }]}>{l.label}</Text>
                </Pressable>
              </Animated.View>
            ))}
        </View>
        <Text style={styles.foot}>Structure creates connection.{"\n"}Connection creates growth.</Text>
      </View>
    </Modal>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.glassStrong, paddingHorizontal: 24 },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  close: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  links: { flex: 1, justifyContent: "center", gap: 8 },
  link: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  n: { fontFamily: fonts.bodyMedium, fontSize: 12, color: c.brandPrimary, letterSpacing: 2 },
  label: { fontFamily: fonts.displayMedium, fontSize: 32, color: c.onSurface, letterSpacing: -0.6 },
  foot: { fontFamily: fonts.body, fontSize: 13, lineHeight: 20, color: c.muted },
}));
