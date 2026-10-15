import { useEffect, useMemo, useRef, useState } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ConnectSection } from "@/src/components/connect-section";
import { FinalSection } from "@/src/components/final-section";
import { Globe } from "@/src/components/globe";
import { Header } from "@/src/components/header";
import { MenuOverlay, type MenuTarget } from "@/src/components/menu-overlay";
import { ScrollCtx } from "@/src/components/reveal";
import { WaitlistSheet } from "@/src/components/waitlist-sheet";
import { WhatSection } from "@/src/components/what-section";
import { WorksSection } from "@/src/components/works-section";
import { tapLight } from "@/src/haptics";
import { fonts, makeStyles } from "@/src/theme";

function ScrollHint({ scrollY, H }: { scrollY: any; H: number }) {
  const styles = useStyles();
  const bob = useSharedValue(0);
  useEffect(() => {
    bob.value = withRepeat(withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [bob]);
  const wrap = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, H * 0.2], [1, 0], Extrapolation.CLAMP),
  }));
  const dot = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value * 12 }] }));
  return (
    <Animated.View style={[styles.hint, wrap]} testID="scroll-hint">
      <View style={styles.mouse}>
        <Animated.View style={[styles.mouseDot, dot]} />
      </View>
      <Text style={styles.hintText}>SCROLL TO EXPLORE</Text>
    </Animated.View>
  );
}

export default function Landing() {
  const insets = useSafeAreaInsets();
  const { height: H } = useWindowDimensions();
  const styles = useStyles();
  const scrollY = useSharedValue(0);
  const dragYaw = useSharedValue(0);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const ys = useRef<Record<MenuTarget, number>>({ what: 0, connect: 0, works: 0, join: 0 });
  const [waitlist, setWaitlist] = useState(false);
  const [menu, setMenu] = useState(false);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-14, 14])
        .failOffsetY([-12, 12])
        .onChange((e) => {
          dragYaw.value += e.changeX * 0.006;
        })
        .onEnd((e) => {
          dragYaw.value = withSequence(
            withDecay({ velocity: e.velocityX * 0.006, deceleration: 0.994 }),
            withDelay(1400, withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.cubic) })),
          );
        }),
    [dragYaw],
  );

  const openWaitlist = () => {
    tapLight();
    setMenu(false);
    setWaitlist(true);
  };
  const goTo = (k: MenuTarget) => {
    setMenu(false);
    if (k === "join") {
      scrollRef.current?.scrollToEnd({ animated: true });
      setTimeout(() => setWaitlist(true), 450);
      return;
    }
    scrollRef.current?.scrollTo({ y: Math.max(0, ys.current[k] - insets.top - 64), animated: true });
  };
  const scrollInfo = useMemo(() => ({ scrollY, screenH: H }), [scrollY, H]);

  return (
    <View style={styles.root} testID="landing-screen">
      <Globe scrollY={scrollY} dragYaw={dragYaw} screenH={H} />
      <ScrollCtx.Provider value={scrollInfo}>
        <GestureDetector gesture={pan}>
          <Animated.ScrollView
            ref={scrollRef}
            onScroll={onScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + H * 0.24 }}
            testID="landing-scroll"
          >
            <View style={{ height: H }}>
              <View style={[styles.hintWrap, { bottom: insets.bottom + 24 }]}>
                <ScrollHint scrollY={scrollY} H={H} />
              </View>
            </View>
            <WhatSection onJoin={openWaitlist} onExplore={() => goTo("connect")} onY={(y) => (ys.current.what = y)} />
            <ConnectSection onY={(y) => (ys.current.connect = y)} />
            <WorksSection onY={(y) => (ys.current.works = y)} />
            <FinalSection onJoin={openWaitlist} onY={(y) => (ys.current.join = y)} />
          </Animated.ScrollView>
        </GestureDetector>
      </ScrollCtx.Provider>
      <Header scrollY={scrollY} onMenu={() => setMenu(true)} onJoin={openWaitlist} />
      <MenuOverlay visible={menu} onClose={() => setMenu(false)} onSelect={goTo} />
      <WaitlistSheet visible={waitlist} onClose={() => setWaitlist(false)} />
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  hintWrap: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  hint: { alignItems: "center", gap: 12 },
  mouse: {
    width: 24,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.onSurfaceTertiary,
    alignItems: "center",
    paddingTop: 8,
  },
  mouseDot: { width: 4, height: 8, borderRadius: 2, backgroundColor: c.brandPrimary },
  hintText: { fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 3, color: c.onSurfaceTertiary },
}));
