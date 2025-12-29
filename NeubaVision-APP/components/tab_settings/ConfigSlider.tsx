import React from "react";
import { View, Text } from "react-native";
import Slider from "@react-native-community/slider";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

interface ConfigSliderProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  description?: string;
  showDivider?: boolean;
}

export function ConfigSlider({
  label,
  value,
  onValueChange,
  minimumValue,
  maximumValue,
  step = 0.01,
  showValue = true,
  valueFormatter = (v) => v.toFixed(2),
  description,
  showDivider = true,
}: ConfigSliderProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  return (
    <>
      <View className="px-4 py-3">
        {/* Label and Value */}
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-base" style={{ color: themeColors.text }}>
            {label}
          </Text>
          {showValue && (
            <Text className="text-base font-semibold" style={{ color: themeColors.tint }}>
              {valueFormatter(value)}
            </Text>
          )}
        </View>

        {/* Slider */}
        <Slider
          value={value}
          onValueChange={onValueChange}
          minimumValue={minimumValue}
          maximumValue={maximumValue}
          step={step}
          minimumTrackTintColor={themeColors.tint}
          maximumTrackTintColor={isDark ? "#2C2C2E" : "#E5E5EA"}
          thumbTintColor={themeColors.tint}
        />

        {/* Description */}
        {description && (
          <Text className="text-xs mt-1 opacity-60" style={{ color: themeColors.text }}>
            {description}
          </Text>
        )}
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
