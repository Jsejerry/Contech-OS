import Feather from "@react-native-vector-icons/feather";
import { BlurView } from "expo-blur";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  type SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Wordmark } from "@/src/components/logo";
import { fonts, makeStyles, useTheme } from "@/src/theme";

const HERO_SCALE = 1.7;
const LEFT = 24;

export function Header({
  scrollY,
  onMenu,
  onJoin,
}: {
  scrollY: SharedValue<number>;
  onMenu: () => void;
  onJoin: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();
  const styles = useStyles();
  const { colors } = useTheme();
  const [wordW, setWordW] = useState(170);
  const [scrolled, setScrolled] = useState(false);
  const top = insets.top + 14;
  const heroTop = H * 0.15;

  useAnimatedReaction(
    () => scrollY.value > H * 0.4,
    (v, prev) => {
      if (v !== prev) runOnJS(setScrolled)(v);
    },
  );

  const bg = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [H * 0.3, H * 0.6], [0, 1], Extrapolation.CLAMP),
  }));

  const logo = useAnimatedStyle(() => {
    const e = interpolate(scrollY.value, [0, H * 0.55], [0, 1], Extrapolation.CLAMP);
    const s = HERO_SCALE + (1 - HERO_SCALE) * e;
    return {
      transform: [
        { translateX: ((W - wordW * HERO_SCALE) / 2 - LEFT) * (1 - e) },
        { translateY: (heroTop - top) * (1 - e) },
        { scale: s },
      ],
    };
  });

  const right = useAnimatedStyle(() => {
    const t = interpolate(scrollY.value, [H * 0.35, H * 0.6], [0, 1], Extrapolation.CLAMP);
    return { opacity: t, transform: [{ translateY: (1 - t) * -10 }] };
  });

  return (
    <View style={[styles.root, { pointerEvents: "box-none" }]}>
      <Animated.View style={[styles.bar, { height: insets.top + 64, pointerEvents: "none" }, bg]}>
        {Platform.OS !== "android" && <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />}
        <View style={[StyleSheet.absoluteFill, styles.barTint]} />
      </Animated.View>

      <Animated.View
        style={[styles.logo, { top, transformOrigin: "left top", pointerEvents: "none" }, logo]}
        onLayout={(e) => setWordW(e.nativeEvent.layout.width)}
        testID="header-logo"
      >
        <Wordmark size={30} />
      </Animated.View>

      <Animated.View style={[styles.right, { top: insets.top + 12, pointerEvents: scrolled ? "auto" : "none" }, right]}>
        <Pressable testID="header-join-button" onPress={onJoin} style={styles.join} hitSlop={6}>
          <Text style={styles.joinText}>Join</Text>
        </Pressable>
        <Pressable testID="header-menu-button" onPress={onMenu} style={styles.menu} hitSlop={6}>
          <Feather name="menu" size={22} color={colors.onSurface} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  bar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.glassBorder,
  },
  barTint: { backgroundColor: c.glassStrong },
  logo: { position: "absolute", left: LEFT },
  right: { position: "absolute", right: 16, flexDirection: "row", alignItems: "center", gap: 6 },
  join: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: c.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  joinText: { fontFamily: fonts.bodySemi, fontSize: 13, color: c.onBrandPrimary },
  menu: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
}));
