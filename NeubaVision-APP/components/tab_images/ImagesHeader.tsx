import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

export function ImagesHeader({
  title,
  acceptedCount,
  deleteAcceptedPhotos,
}: {
  title: string;
  acceptedCount: number;
  deleteAcceptedPhotos: () => void;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const themeColors = Colors[colorScheme ?? "light"];
  return (
    <View
      className="flex-row items-center px-4 py-3 border-b"
      style={{
        backgroundColor: themeColors.background,
        borderBottomColor: isDark ? "#2A2A2A" : "#F0F0F0",
      }}
    >
      <View className="flex-1">
        <Text
          className={`font-semibold text-lg ${isDark ? "text-white" : "text-zinc-900"}`}
        >
          {title}
        </Text>
      </View>

      <View className="flex-1 items-center">
        <Text
          className={`font-bold text-2xl ${isDark ? "text-zinc-300" : "text-zinc-800"}`}
        >
          {acceptedCount}
        </Text>
      </View>

      <View className="flex-1 items-end">
        {acceptedCount > 0 && (
          <Pressable
            onPress={deleteAcceptedPhotos}
            className={`p-2 rounded-full active:opacity-70 ${
              isDark ? "bg-red-500/10" : "bg-red-50"
            }`}
          >
            <Ionicons name="trash" size={20} color="#ef4444" />
          </Pressable>
        )}
      </View>
    </View>
  );
}
