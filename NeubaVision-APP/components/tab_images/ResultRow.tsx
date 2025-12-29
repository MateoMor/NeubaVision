import { Text, View } from "react-native";

interface ResultRowProps {
  label: string;
  value: string;
  themeColors: { text: string };
}

export const ResultRow = ({ label, value, themeColors }: ResultRowProps) => {
  return (
    <View className="flex-row justify-between">
      <Text className="opacity-70" style={{ color: themeColors.text }}>
        {label}
      </Text>
      <Text className="font-medium" style={{ color: themeColors.text }}>
        {value}
      </Text>
    </View>
  );
};
