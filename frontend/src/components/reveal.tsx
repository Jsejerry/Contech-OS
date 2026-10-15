import { createContext, type PropsWithChildren, useContext } from "react";
import { type StyleProp, View, type ViewStyle } from "react-native";
import Animated, { Extrapolation, interpolate, type SharedValue, useAnimatedStyle, useSharedValue } from "react-native-reanimated";

type ScrollInfo = { scrollY: SharedValue<number>; screenH: number };
export const ScrollCtx = createContext<ScrollInfo | null>(null);
const SectionCtx = createContext<SharedValue<number> | null>(null);

export function useScrollInfo() {
  return useContext(ScrollCtx)!;
}
export function useSectionY() {
  return useContext(SectionCtx)!;
}

export function Section({
  children,
  style,
  testID,
  onY,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle>; testID?: string; onY?: (y: number) => void }>) {
  const y = useSharedValue(0);
  return (
    <SectionCtx.Provider value={y}>
      <View
        testID={testID}
        style={style}
        onLayout={(e) => {
          y.value = e.nativeEvent.layout.y;
          onY?.(e.nativeEvent.layout.y);
        }}
      >
        {children}
      </View>
    </SectionCtx.Provider>
  );
}

/** 3D tilt-in reveal driven by scroll. Must be a direct child of <Section>. */
export function Reveal({ children, style, delay = 0 }: PropsWithChildren<{ style?: StyleProp<ViewStyle>; delay?: number }>) {
  const { scrollY, screenH } = useScrollInfo();
  const sectionY = useSectionY();
  const top = useSharedValue(0);

  const anim = useAnimatedStyle(() => {
    const start = sectionY.value + top.value - screenH * 0.98 + delay * 40;
    const t = interpolate(scrollY.value, [start, start + screenH * 0.32], [0, 1], Extrapolation.CLAMP);
    return {
      opacity: t,
      transform: [
        { perspective: 900 },
        { translateY: (1 - t) * 70 },
        { rotateX: `${(1 - t) * 38}deg` },
        { scale: 0.9 + 0.1 * t },
      ],
    };
  });

  return (
    <Animated.View style={[style, anim]} onLayout={(e) => (top.value = e.nativeEvent.layout.y)}>
      {children}
    </Animated.View>
  );
}
