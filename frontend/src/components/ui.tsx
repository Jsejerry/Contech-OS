import Feather from "@react-native-vector-icons/feather";
import type { PropsWithChildren, ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { fonts, makeStyles, useTheme } from "@/src/theme";

export function Eyebrow({ children, lines }: { children?: string; lines?: string[] }) {
  const styles = useStyles();
  const items = lines ?? [children ?? ""];
  return (
    <View style={styles.eyebrowWrap}>
      {items.map((l) => (
        <View key={l} style={styles.eyebrowRow}>
          <View style={styles.dash} />
          <Text style={styles.eyebrow}>{l}</Text>
        </View>
      ))}
    </View>
  );
}

export function Headline({ children, size = 36 }: PropsWithChildren<{ size?: number }>) {
  const styles = useStyles();
  return <Text style={[styles.headline, { fontSize: size, lineHeight: size * 1.12 }]}>{children}</Text>;
}

export function Accent({ children }: PropsWithChildren) {
  const styles = useStyles();
  return <Text style={styles.accent}>{children}</Text>;
}

export function Body({ children, style }: PropsWithChildren<{ style?: any }>) {
  const styles = useStyles();
  return <Text style={[styles.body, style]}>{children}</Text>;
}

export function PressScale({
  children,
  onPress,
  style,
  testID,
}: PropsWithChildren<{ onPress?: () => void; style?: any; testID?: string }>) {
  const s = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      onPressIn={() => (s.value = withSpring(0.95, { damping: 15 }))}
      onPressOut={() => (s.value = withSpring(1, { damping: 12 }))}
    >
      <Animated.View style={[style, a]}>{children}</Animated.View>
    </Pressable>
  );
}

export function PrimaryButton({
  label,
  onPress,
  testID,
  icon = "arrow-right",
  big,
  right,
}: {
  label: string;
  onPress: () => void;
  testID: string;
  icon?: any;
  big?: boolean;
  right?: ReactNode;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <PressScale testID={testID} onPress={onPress} style={[styles.primary, big && styles.primaryBig]}>
      <Text style={[styles.primaryText, big && { fontSize: 17 }]}>{label}</Text>
      {right ?? <Feather name={icon} size={big ? 20 : 18} color={colors.onBrandPrimary} />}
    </PressScale>
  );
}

export function GhostButton({ label, onPress, testID }: { label: string; onPress: () => void; testID: string }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <PressScale testID={testID} onPress={onPress} style={styles.ghost}>
      <Text style={styles.ghostText}>{label}</Text>
      <View style={styles.playDot}>
        <Feather name="play" size={10} color={colors.onSurface} />
      </View>
    </PressScale>
  );
}

const useStyles = makeStyles((c) => ({
  eyebrowWrap: { gap: 4, marginBottom: 16 },
  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  dash: { width: 22, height: 1, backgroundColor: c.brandPrimary },
  eyebrow: { fontFamily: fonts.bodyMedium, fontSize: 12, letterSpacing: 3, color: c.onSurfaceTertiary },
  headline: { fontFamily: fonts.displayMedium, color: c.onSurface, letterSpacing: -0.8 },
  accent: { color: c.brandPrimary },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: c.onSurfaceTertiary },
  primary: {
    height: 52,
    borderRadius: 999,
    backgroundColor: c.brandPrimary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 22,
  },
  primaryBig: { height: 60 },
  primaryText: { fontFamily: fonts.bodySemi, fontSize: 15, color: c.onBrandPrimary },
  ghost: {
    height: 52,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: c.onSurfaceTertiary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 20,
  },
  ghostText: { fontFamily: fonts.bodyMedium, fontSize: 15, color: c.onSurface },
  playDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: c.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
}));
