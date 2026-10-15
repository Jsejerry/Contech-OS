import { BlurView } from "expo-blur";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, { Extrapolation, interpolate, type SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Wordmark } from "@/src/components/logo";
import { makeStyles } from "@/src/theme";

export function Header({ scrollY, onMenu }: { scrollY: SharedValue<number>; onMenu: () => void }) {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const background = useAnimatedStyle(() => ({ opacity: interpolate(scrollY.value, [10, 140], [0, 1], Extrapolation.CLAMP) }));
  return (
    <View style={[styles.root, { paddingTop: insets.top + 20 }]} testID="landing-header">
      <Animated.View style={[StyleSheet.absoluteFill, styles.background, background]}>
        {Platform.OS !== "android" && <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />}
      </Animated.View>
      <View testID="header-logo"><Wordmark size={30} testID="header-wordmark" /></View>
      <Pressable accessibilityRole="button" accessibilityLabel="Open navigation" testID="header-menu-button" onPress={onMenu} style={({ pressed }) => [styles.menu, pressed && styles.pressed]}>
        <View style={styles.line} /><View style={[styles.line, styles.middleLine]} /><View style={styles.line} />
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { position: "absolute", top: 0, left: 0, right: 0, paddingHorizontal: 26, paddingBottom: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  background: { backgroundColor: c.glassStrong, pointerEvents: "none" },
  menu: { width: 44, height: 44, alignItems: "flex-end", justifyContent: "center", gap: 5 },
  line: { width: 25, height: 1.2, borderRadius: 1, backgroundColor: c.onSurface },
  middleLine: { width: 18 },
  pressed: { opacity: 0.55 },
}));