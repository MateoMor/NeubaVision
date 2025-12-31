import React from "react";
import { View, Text, TextInput } from "react-native";
import { useThemeColor } from "@/hooks/theme/useThemeColor";

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
  const textColor = useThemeColor({}, "text");
  const inputBgColor = useThemeColor({}, "inputBackground");
  const placeholderColor = useThemeColor({}, "placeholder");
  const borderColor = useThemeColor({}, "border");

  return (
    <>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="flex-1 text-base" style={{ color: textColor }}>
          {label}
        </Text>
        <View className="flex-row items-center gap-2">
          <TextInput
            className="text-base text-right px-3 py-1.5 rounded-lg min-w-[80px]"
            style={{
              color: textColor,
              backgroundColor: inputBgColor,
            }}
            value={value}
            onChangeText={onChangeText}
            onBlur={onBlur}
            placeholder={placeholder}
            placeholderTextColor={placeholderColor}
            keyboardType={keyboardType}
          />
          {unit && (
            <Text className="text-sm opacity-60" style={{ color: textColor }}>
              {unit}
            </Text>
          )}
        </View>
      </View>
      {showDivider && (
        <View className="h-[0.5px] ml-4" style={{ backgroundColor: borderColor }} />
      )}
    </>
  );
}
