import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

interface ConfigButtonProps {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  destructive?: boolean;
  showDivider?: boolean;
}

export function ConfigButton({
  label,
  onPress,
  icon,
  iconColor,
  destructive = false,
  showDivider = true,
}: ConfigButtonProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  const color = destructive ? "#FF3B30" : iconColor || themeColors.tint;

  return (
    <>
      <Pressable
        onPress={onPress}
        className="flex-row items-center justify-between px-4 py-3 active:opacity-60"
      >
        <Text
          className="text-base flex-1"
          style={{ color: destructive ? "#FF3B30" : themeColors.text }}
        >
          {label}
        </Text>
        {icon && <Ionicons name={icon} size={20} color={color} />}
      </Pressable>
      {showDivider && (
        <View
          className="h-[0.5px] ml-4"
          style={{ backgroundColor: isDark ? "#2A2A2A" : "#E5E5EA" }}
        />
      )}
    </>
  );
}
