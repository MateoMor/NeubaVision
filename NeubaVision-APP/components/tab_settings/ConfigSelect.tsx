import { View, Text } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ChevronDownIcon } from "@/components/ui/icon";

interface ConfigSelectProps {
  label: string;
  value: string;
  options: string[];
  onValueChange: (value: string) => void;
  showDivider?: boolean;
  description?: string;
}

export function ConfigSelect({
  label,
  value,
  options,
  onValueChange,
  showDivider = true,
  description,
}: ConfigSelectProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  return (
    <>
      <View className="px-4 py-3">
        {/* Label and Select Row */}
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-base font-medium" style={{ color: themeColors.text }}>
            {label}
          </Text>

          {/* Select Container with subtle background */}
          <View
            className="rounded-lg overflow-hidden"
            style={{
              backgroundColor: isDark ? "#2C2C2E" : "#F2F2F7",
            }}
          >
            <Select selectedValue={value} onValueChange={onValueChange}>
              <SelectTrigger
                className="min-w-[130px] border-0"
                style={{
                  backgroundColor: "transparent",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
              >
                <SelectInput
                  className="text-sm font-medium"
                  style={{
                    color: themeColors.tint,
                  }}
                />
                <SelectIcon className="ml-1">
                  <ChevronDownIcon className="w-4 h-4" />
                </SelectIcon>
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  {options.map((option, i) => (
                    <SelectItem key={i} value={option} label={option} />
                  ))}
                </SelectContent>
              </SelectPortal>
            </Select>
          </View>
        </View>

        {/* Description */}
        {description && (
          <Text
            className="text-xs mt-1 leading-4"
            style={{
              color: themeColors.text,
              opacity: 0.6,
            }}
          >
            {description}
          </Text>
        )}
      </View>

      {/* Divider */}
      {showDivider && (
        <View
          className="h-[0.5px] ml-4"
          style={{ backgroundColor: isDark ? "#2A2A2A" : "#E5E5EA" }}
        />
      )}
    </>
  );
}
