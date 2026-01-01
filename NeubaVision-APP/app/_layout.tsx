import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/theme/useColorScheme";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";

import { GestureHandlerRootView } from "react-native-gesture-handler";

import "@/i18n"; // Initialize i18n
import { updateLanguage } from "@/i18n";
import { useAppSettingsStore } from "@/store/useAppSettingsStore";
import { useEffect } from "react";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments() as string[];
  const isDark = colorScheme === "dark";

  const isCamera = segments.includes("camera");

  const language = useAppSettingsStore((state) => state.language);
  const themeMode = useAppSettingsStore((state) => state.themeMode);

  useEffect(() => {
    updateLanguage(language);
  }, [language]);

  const resolveTheme = (themeMode: "dark" | "light" | "auto") => {
    return themeMode === "dark" ? "dark" : themeMode === "light" ? "light" : "system"
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GluestackUIProvider mode={resolveTheme(themeMode)}>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
          </Stack>
          <StatusBar style={isCamera ? "light" : isDark ? "light" : "dark"} />
        </ThemeProvider>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}
