// Shared light/dark tokens. Orange is reserved for primary actions and signal details.
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { usePreferences } from "@/src/preferences";

export type ColorScheme = "light" | "dark";

const dark = {
  surface: "#080E19",
  onSurface: "#F1F5FA",
  surfaceSecondary: "#101D2F",
  onSurfaceSecondary: "#E2E4E9",
  surfaceTertiary: "#1E2538",
  onSurfaceTertiary: "#A3A6AE",
  surfaceInverse: "#FFFFFF",
  onSurfaceInverse: "#000000",
  muted: "#8A8F9E",

  brand: "#FF762E",
  onBrand: "#090B0E",
  brandPrimary: "#FF762E",
  onBrandPrimary: "#090B0E",
  brandSecondary: "#FF985D",
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
  borderStrong: "#345375",
  divider: "#1C2C40",

  // Extras
  glass: "rgba(16,29,47,0.94)",
  glassStrong: "rgba(8,14,25,0.97)",
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
  blue: "#8CBDED",
  blueStrong: "#2C6FAD",
  blueTint: "#162D48",
  blueprint: "rgba(120,169,215,0.055)",
  blueprintStrong: "rgba(120,169,215,0.14)",
  transparent: "transparent",
};

export type ThemeColors = typeof dark;

export const defaultScheme = "dark" satisfies ColorScheme;

const light: ThemeColors = {
  ...dark,
  surface: "#F0F4F8", onSurface: "#101D2F",
  surfaceSecondary: "#FFFFFF", onSurfaceSecondary: "#263D55",
  surfaceTertiary: "#E2EAF3", onSurfaceTertiary: "#51657B",
  surfaceInverse: "#101D2F", onSurfaceInverse: "#FFFFFF", muted: "#63768A",
  border: "#D2DEEA", borderStrong: "#9BB5D0", divider: "#D8E2ED",
  glass: "rgba(255,255,255,0.95)", glassStrong: "rgba(240,244,248,0.98)",
  glassBorder: "rgba(16,29,47,0.1)", orbit: "rgba(44,111,173,0.12)",
  blue: "#225F98", blueStrong: "#226AA9", blueTint: "#E1EDFA",
  blueprint: "rgba(44,90,135,0.055)", blueprintStrong: "rgba(44,90,135,0.15)",
  error: "#BC3030", success: "#227546", heroOutline: "#7D91A6",
};
export const themes = { light, dark };

export const colors = dark;

export function useTheme(): { scheme: ColorScheme; colors: ThemeColors } {
  const { mode } = usePreferences();
  return { scheme: mode, colors: themes[mode] };
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
