import React from "react";
import { View, Text } from "react-native";
import { useThemeColor } from "@/hooks/theme/useThemeColor";

interface ConfigSectionProps {
  title: string;
  children: React.ReactNode;
}

export function ConfigSection({ title, children }: ConfigSectionProps) {
  const textColor = useThemeColor({}, "text");
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");

  return (
    <View className="mb-6">
      {/* Section Header */}
      <View className="flex-row items-center mb-3 px-1">
        <Text className="text-base font-semibold" style={{ color: textColor }}>
          {title}
        </Text>
      </View>

      {/* Section Content Container */}
      <View
        className="rounded-xl overflow-hidden"
        style={{
          backgroundColor: cardColor,
          borderWidth: 1,
          borderColor: borderColor,
        }}
      >
        {children}
      </View>
    </View>
  );
}
