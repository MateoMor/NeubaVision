import React from "react";
import { View, Text } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

interface HeaderProps {
  title?: string;
  leftContent?: React.ReactNode;
  centerContent?: React.ReactNode;
  rightContent?: React.ReactNode;
}

export function Header({ title, leftContent, centerContent, rightContent }: HeaderProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  return (
    <View
      className="flex-row items-center px-4 py-3 border-b"
      style={{
        backgroundColor: themeColors.background,
        borderBottomColor: isDark ? "#2A2A2A" : "#F0F0F0",
      }}
    >
      <View className="flex-1 justify-center">
        {leftContent
          ? leftContent
          : title && (
              <Text
                className={`font-semibold text-lg ${
                  isDark ? "text-white" : "text-zinc-900"
                }`}
              >
                {title}
              </Text>
            )}
      </View>

      <View className="flex-1 items-center justify-center">{centerContent}</View>

      <View className="flex-1 items-end justify-center">{rightContent}</View>
    </View>
  );
}
