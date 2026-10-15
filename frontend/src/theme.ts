// Design tokens for ConTech OS. Dark-only brand; keys match /app/design_guidelines.json.
import { useMemo } from "react";
import { Appearance, StyleSheet, useColorScheme } from "react-native";

export type ColorScheme = "light" | "dark";

const dark = {
  surface: "#020711",
  onSurface: "#FFFFFF",
  surfaceSecondary: "#0C1320",
  onSurfaceSecondary: "#E2E4E9",
  surfaceTertiary: "#1E2538",
  onSurfaceTertiary: "#A3A6AE",
  surfaceInverse: "#FFFFFF",
  onSurfaceInverse: "#000000",
  muted: "#8A8F9E",

  brand: "#FF5C00",
  onBrand: "#090B0E",
  brandPrimary: "#FF5C00",
  onBrandPrimary: "#090B0E",
  brandSecondary: "#F7931E",
  onBrandSecondary: "#0B0F19",
  brandTertiary: "#2A3582",
  onBrandTertiary: "#FFFFFF",

  success: "#34C759",
  onSuccess: "#FFFFFF",
  warning: "#FF9F0A",
  onWarning: "#000000",
  error: "#FF453A",
  onError: "#FFFFFF",
  info: "#0A84FF",
  onInfo: "#FFFFFF",

  border: "#1E2538",
  borderStrong: "#2A3582",
  divider: "#151A29",

  // Extras
  glass: "rgba(12,19,32,0.88)",
  glassStrong: "rgba(2,7,17,0.94)",
  glassBorder: "rgba(255,255,255,0.08)",
  brandGlow: "rgba(255,98,0,0.18)",
  brandGlowStrong: "rgba(255,98,0,0.35)",
  scrim: "rgba(5,7,12,0.72)",
  globeLand: "#498EC0",
  globeBase: "#041122",
  atmosphere: "#5CBFFF",
  ocean: "#010814",
  orbit: "rgba(105,129,160,0.11)",
  heroOutline: "#606978",
  transparent: "transparent",
};

export type ThemeColors = typeof dark;

export const defaultScheme = "dark" satisfies ColorScheme;

export const themes: { light: ThemeColors; dark: ThemeColors } = { light: dark, dark };

export const colors = dark;

export function setColorScheme(scheme: ColorScheme | null) {
  Appearance.setColorScheme?.(scheme ?? "unspecified");
}

setColorScheme?.(defaultScheme);

export function useTheme(): { scheme: ColorScheme; colors: ThemeColors } {
  const system = useColorScheme();
  const scheme: ColorScheme = system === "light" || system === "dark" ? system : defaultScheme;
  return { scheme, colors: themes[scheme] ?? themes.dark };
}

export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (colors: ThemeColors) => T & StyleSheet.NamedStyles<any>,
): () => T {
  return function useStyles(): T {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}

export const fonts = {
  displayLight: "Outfit-Light",
  display: "Outfit-Regular",
  displayMedium: "Outfit-Medium",
  displaySemi: "Outfit-SemiBold",
  body: "Inter-Regular",
  bodyMedium: "Inter-Medium",
  bodySemi: "Inter-SemiBold",
};
