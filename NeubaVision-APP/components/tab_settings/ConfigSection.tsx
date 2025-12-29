import React from "react";
import { View, Text } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

interface ConfigSectionProps {
  title: string;
  children: React.ReactNode;
}

export function ConfigSection({ title, children }: ConfigSectionProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  return (
    <View className="mb-6">
      {/* Section Header */}
      <View className="flex-row items-center mb-3 px-1">
        <Text className="text-base font-semibold" style={{ color: themeColors.text }}>
          {title}
        </Text>
      </View>

      {/* Section Content Container */}
      <View
        className="rounded-xl overflow-hidden"
        style={{
          backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
          borderWidth: 1,
          borderColor: isDark ? "#2A2A2A" : "#E5E5EA",
        }}
      >
        {children}
      </View>
    </View>
  );
}
