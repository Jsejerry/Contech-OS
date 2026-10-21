import { useMemo, useRef, useState } from "react";
import { Modal, useWindowDimensions, View } from "react-native";
import Animated, { runOnJS, useAnimatedReaction, useAnimatedRef, useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AboutSheet } from "@/src/components/about-sheet";
import { Blueprint } from "@/src/components/blueprint";
import { ConnectSection } from "@/src/components/connect-section";
import { Globe } from "@/src/components/globe";
import { Header } from "@/src/components/header";
import { MenuOverlay, type MenuTarget } from "@/src/components/menu-overlay";
import { ScrollCtx } from "@/src/components/reveal";
import { WaitlistDock } from "@/src/components/waitlist-dock";
import { WaitlistSheet } from "@/src/components/waitlist-sheet";
import { WhatSection } from "@/src/components/what-section";
import { WorksSection } from "@/src/components/works-section";
import { tapLight } from "@/src/haptics";
import { makeStyles } from "@/src/theme";

export default function Landing() {
  const insets = useSafeAreaInsets();
  const { height: H, width: W } = useWindowDimensions();
  const styles = useStyles();
  const scrollY = useSharedValue(0);
  const secondY = useSharedValue(H);
  const thirdY = useSharedValue(H * 2);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const ys = useRef({ what: 0, connect: 0, works: 0 });
  const [overlay, setOverlay] = useState<"menu" | "about" | "waitlist" | null>(null);
  const [chapter, setChapter] = useState(0);
  const [dockHeight, setDockHeight] = useState(insets.bottom + 81);
  const onScroll = useAnimatedScrollHandler((e) => { scrollY.value = Math.max(0, e.contentOffset.y); });
  useAnimatedReaction(() => scrollY.value + H * 0.4 >= thirdY.value ? 2 : scrollY.value + H * 0.4 >= secondY.value ? 1 : 0,
    (value, previous) => { if (value !== previous) runOnJS(setChapter)(value); });
  const openWaitlist = () => { tapLight(); setOverlay("waitlist"); };
  const goTo = (key: MenuTarget) => {
    if (key === "join") return openWaitlist();
    if (key === "about") return setOverlay("about");
    setOverlay(null);
    scrollRef.current?.scrollTo({ y: Math.max(0, ys.current[key] - insets.top - 82), animated: true });
  };
  const scrollInfo = useMemo(() => ({ scrollY, screenH: H }), [scrollY, H]);
  return <View style={styles.root} testID="landing-screen">
    <Blueprint />
    <Globe key={`${W}-${H}`} scrollY={scrollY} screenH={H} />
    <ScrollCtx.Provider value={scrollInfo}>
      <Animated.ScrollView ref={scrollRef} onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false} style={{ marginBottom: dockHeight }} contentContainerStyle={[styles.content, { paddingBottom: 32 }]} testID="landing-scroll">
        <WhatSection height={H} onY={(y) => { ys.current.what = y; }} onExplore={() => goTo("connect")} />
        <ConnectSection height={H} onY={(y) => { ys.current.connect = y; secondY.value = y; }} />
        <WorksSection onY={(y) => { ys.current.works = y; thirdY.value = y; }} onJoin={openWaitlist} />
      </Animated.ScrollView>
    </ScrollCtx.Provider>
    <Header onMenu={() => setOverlay("menu")} onAbout={() => setOverlay("about")} />
    <WaitlistDock onJoin={openWaitlist} chapter={chapter} onHeight={setDockHeight} />
    <Modal visible={overlay !== null} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setOverlay(null)}>
      {overlay === "menu" && <MenuOverlay visible onClose={() => setOverlay(null)} onSelect={goTo} />}
      {overlay === "about" && <AboutSheet visible onClose={() => setOverlay(null)} onJoin={openWaitlist} />}
      {overlay === "waitlist" && <WaitlistSheet visible onClose={() => setOverlay(null)} />}
    </Modal>
  </View>;
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface, overflow: "hidden" },
  content: { width: "100%", maxWidth: 560, alignSelf: "center" },
}));