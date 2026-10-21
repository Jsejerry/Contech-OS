import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { ErrorBoundary } from "@/src/components/error-boundary";
import { queryClient } from "@/src/query-client";
import { useTheme } from "@/src/theme";
import { PreferencesProvider } from "@/src/preferences";

// Disable logbox errors etc so that users can see the app
// and agent works as expected.
LogBox.ignoreAllLogs(true);
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Outfit-Light": require("../assets/fonts/Outfit-300.ttf"),
    "Outfit-Regular": require("../assets/fonts/Outfit-400.ttf"),
    "Outfit-Medium": require("../assets/fonts/Outfit-500.ttf"),
    "Outfit-SemiBold": require("../assets/fonts/Outfit-600.ttf"),
    "Inter-Regular": require("../assets/fonts/Inter-400.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter-500.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter-600.ttf"),
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return <PreferencesProvider><ErrorBoundary><AppShell /></ErrorBoundary></PreferencesProvider>;
}

function AppShell() {
  const { colors, scheme } = useTheme();
  return (
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.surface }}>
        <QueryClientProvider client={queryClient}>
          <KeyboardProvider>
            <StatusBar style={scheme === "dark" ? "light" : "dark"} />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.surface } }} />
          </KeyboardProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
  );
}
