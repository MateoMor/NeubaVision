import React from "react";
import { View, Text, TextInput } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

interface ConfigInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  unit?: string;
  showDivider?: boolean;
}

export function ConfigInput({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  keyboardType = "default",
  unit,
  showDivider = true,
}: ConfigInputProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  return (
    <>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="flex-1 text-base" style={{ color: themeColors.text }}>
          {label}
        </Text>
        <View className="flex-row items-center gap-2">
          <TextInput
            className="text-base text-right px-3 py-1.5 rounded-lg min-w-[80px]"
            style={{
              color: themeColors.text,
              backgroundColor: isDark ? "#2C2C2E" : "#F2F2F7",
            }}
            value={value}
            onChangeText={onChangeText}
            onBlur={onBlur}
            placeholder={placeholder}
            placeholderTextColor={isDark ? "#8E8E93" : "#C7C7CC"}
            keyboardType={keyboardType}
          />
          {unit && (
            <Text className="text-sm opacity-60" style={{ color: themeColors.text }}>
              {unit}
            </Text>
          )}
        </View>
      </View>
      {showDivider && (
        <View
          className="h-[0.5px] ml-4"
          style={{ backgroundColor: isDark ? "#2A2A2A" : "#E5E5EA" }}
        />
      )}
    </>
  );
}
