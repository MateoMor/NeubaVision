import { View, ScrollView } from "react-native";
import React from "react";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { SettingsHeader } from "@/components/tab_settings/SettingsHeader";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: themeColors.background }}>
      <SettingsHeader />
      <ScrollView className="flex-1" style={{ backgroundColor: themeColors.background }}>
        <View className="p-5">{/* Contenido de settings aquí */}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
