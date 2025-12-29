import React from "react";
import { Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Header } from "@/components/shared/Header";

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

  return (
    <Header
      title={title}
      centerContent={
        <Text
          className={`font-bold text-2xl ${isDark ? "text-zinc-300" : "text-zinc-800"}`}
        >
          {acceptedCount}
        </Text>
      }
      rightContent={
        acceptedCount > 0 && (
          <Pressable
            onPress={deleteAcceptedPhotos}
            className={`p-1 rounded-full active:opacity-70 ${
              isDark ? "bg-red-500/10" : "bg-red-50"
            }`}
          >
            <Ionicons name="trash" size={20} color="#ef4444" />
          </Pressable>
        )
      }
    />
  );
}
