import { useMemo, useRef, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
  withDecay,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ConnectSection } from "@/src/components/connect-section";
import { FinalSection } from "@/src/components/final-section";
import { Globe } from "@/src/components/globe";
import { Header } from "@/src/components/header";
import { HeroSection } from "@/src/components/hero-section";
import { MenuOverlay, type MenuTarget } from "@/src/components/menu-overlay";
import { ScrollCtx } from "@/src/components/reveal";
import { WaitlistSheet } from "@/src/components/waitlist-sheet";
import { WhatSection } from "@/src/components/what-section";
import { WorksSection } from "@/src/components/works-section";
import { tapLight } from "@/src/haptics";
import { makeStyles } from "@/src/theme";

export default function Landing() {
  const insets = useSafeAreaInsets();
  const { height: H, width: W } = useWindowDimensions();
  const heroHeight = Math.max(H, Math.min(W, 500) * 2.08 + insets.top);
  const styles = useStyles();
  const scrollY = useSharedValue(0);
  const dragYaw = useSharedValue(0);
  const contentBottom = useSharedValue(H * 0.52);
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
      <Globe key={`${W}-${H}`} scrollY={scrollY} dragYaw={dragYaw} screenH={H} contentBottom={contentBottom} />
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
            <HeroSection height={heroHeight} contentBottom={contentBottom} onJoin={openWaitlist} onExplore={() => goTo("what")} />
            <WhatSection onY={(y) => (ys.current.what = y)} />
            <ConnectSection onY={(y) => (ys.current.connect = y)} />
            <WorksSection onY={(y) => (ys.current.works = y)} />
            <FinalSection onJoin={openWaitlist} onY={(y) => (ys.current.join = y)} />
          </Animated.ScrollView>
        </GestureDetector>
      </ScrollCtx.Provider>
      <Header scrollY={scrollY} onMenu={() => setMenu(true)} />
      <MenuOverlay visible={menu} onClose={() => setMenu(false)} onSelect={goTo} />
      <WaitlistSheet visible={waitlist} onClose={() => setWaitlist(false)} />
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface, overflow: "hidden" },
}));
