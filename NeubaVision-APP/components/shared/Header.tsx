import React from "react";
import { View, Text } from "react-native";
import { useThemeColor } from "@/hooks/theme/useThemeColor";

interface HeaderProps {
  title?: string;
  leftContent?: React.ReactNode;
  centerContent?: React.ReactNode;
  rightContent?: React.ReactNode;
}

export function Header({ title, leftContent, centerContent, rightContent }: HeaderProps) {
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");

  return (
    <View
      className="flex-row items-center px-4 py-3 border-b"
      style={{
        backgroundColor: backgroundColor,
        borderBottomColor: borderColor,
      }}
    >
      <View className="flex-1 justify-center">
        {leftContent
          ? leftContent
          : title && (
              <Text className="font-semibold text-lg" style={{ color: textColor }}>
                {title}
              </Text>
            )}
      </View>

      <View className="flex-1 items-center justify-center">{centerContent}</View>

      <View className="flex-1 items-end justify-center">{rightContent}</View>
    </View>
  );
}
