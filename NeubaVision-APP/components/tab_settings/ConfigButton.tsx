import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/theme/useThemeColor";

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
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const dangerColor = useThemeColor({}, "danger");
  const borderColor = useThemeColor({}, "border");

  const color = destructive ? dangerColor : iconColor || tintColor;

  return (
    <>
      <Pressable
        onPress={onPress}
        className="flex-row items-center justify-between px-4 py-3 active:opacity-60"
      >
        <Text
          className="text-base flex-1"
          style={{ color: destructive ? dangerColor : textColor }}
        >
          {label}
        </Text>
        {icon && <Ionicons name={icon} size={20} color={color} />}
      </Pressable>
      {showDivider && (
        <View className="h-[0.5px] ml-4" style={{ backgroundColor: borderColor }} />
      )}
    </>
  );
}
