import React from "react";
import { Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/theme/useThemeColor";
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
  const textColor = useThemeColor({}, "text");
  const dangerBg = useThemeColor({}, "dangerBackground");

  return (
    <Header
      title={title}
      centerContent={
        <Text className="font-bold text-2xl" style={{ color: textColor }}>
          {acceptedCount}
        </Text>
      }
      rightContent={
        acceptedCount > 0 && (
          <Pressable
            onPress={deleteAcceptedPhotos}
            className="p-1 rounded-full active:opacity-70"
            style={{ backgroundColor: dangerBg }}
          >
            <Ionicons name="trash" size={20} color="#ef4444" />
          </Pressable>
        )
      }
    />
  );
}
