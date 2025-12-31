import React from "react";
import { View, Text } from "react-native";
import Slider from "@react-native-community/slider";
import { useThemeColor } from "@/hooks/theme/useThemeColor";

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
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "border");

  return (
    <>
      <View className="px-4 py-3">
        {/* Label and Value */}
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-base" style={{ color: textColor }}>
            {label}
          </Text>
          {showValue && (
            <Text className="text-base font-semibold" style={{ color: tintColor }}>
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
          minimumTrackTintColor={tintColor}
          maximumTrackTintColor={borderColor}
          thumbTintColor={tintColor}
        />

        {/* Description */}
        {description && (
          <Text className="text-xs mt-1 opacity-60" style={{ color: textColor }}>
            {description}
          </Text>
        )}
      </View>
      {showDivider && (
        <View className="h-[0.5px] ml-4" style={{ backgroundColor: borderColor }} />
      )}
    </>
  );
}
