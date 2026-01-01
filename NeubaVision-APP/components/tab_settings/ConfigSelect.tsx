import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { useThemeColor } from "@/hooks/theme/useThemeColor";
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
  options: { label: string; value: string }[];
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
  const { i18n } = useTranslation();
  const textColor = useThemeColor({}, "text");
  const inputBgColor = useThemeColor({}, "inputBackground");
  const tintColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "border");

  return (
    <>
      <View className="px-4 py-3">
        {/* Label and Select Row */}
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-base font-medium" style={{ color: textColor }}>
            {label}
          </Text>

          {/* Select Container with subtle background */}
          <View
            className="rounded-lg overflow-hidden"
            style={{
              backgroundColor: inputBgColor,
            }}
          >
            <Select
              key={i18n.language}
              selectedValue={value}
              onValueChange={onValueChange}
            >
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
                    color: tintColor,
                  }}
                />
                <SelectIcon className="ml-1">
                  <ChevronDownIcon className="w-4 h-4" />
                </SelectIcon>
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  {options.map((option, i) => {
                    const optionLabel = option.label;
                    const optionValue = option.value;
                    return <SelectItem key={i} label={optionLabel} value={optionValue} />;
                  })}
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
              color: textColor,
              opacity: 0.6,
            }}
          >
            {description}
          </Text>
        )}
      </View>

      {/* Divider */}
      {showDivider && (
        <View className="h-[0.5px] ml-4" style={{ backgroundColor: borderColor }} />
      )}
    </>
  );
}
