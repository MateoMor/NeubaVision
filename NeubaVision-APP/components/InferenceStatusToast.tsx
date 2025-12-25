import React from "react";
import { View, Text, Animated } from "react-native";
import { usePhotosStore } from "@/store/usePhotosStore";
import { FadeInUp, FadeOutUp } from "react-native-reanimated";
import AnimatedRel from "react-native-reanimated";

export const InferenceStatusToast = () => {
  const photos = usePhotosStore((state) => state.photos);

  // Get photos that are currently being processed
  const activePhotos = photos.filter((p) =>
    ["pending", "preprocessing", "inference", "postprocessing"].includes(p.status)
  );

  if (activePhotos.length === 0) return null;

  return (
    <AnimatedRel.View
      entering={FadeInUp}
      exiting={FadeOutUp}
      className="absolute top-12 left-4 right-4 bg-zinc-900/90 border border-zinc-700 p-4 rounded-2xl shadow-xl z-50"
    >
      <Text className="text-white font-bold mb-3 text-sm">
        Procesando {activePhotos.length} imagen{activePhotos.length > 1 ? "es" : ""}...
      </Text>

      <View className="gap-y-3">
        {activePhotos.map((photo, index) => (
          <View key={photo.path + index} className="flex-col gap-1">
            <View className="flex-row justify-between mb-1">
              <Text className="text-zinc-400 text-xs truncate max-w-[80%]">
                Imagen {photos.length - photos.indexOf(photo)}
              </Text>
              <Text className="text-green-400 text-xs font-medium">
                {photo.status === "pending"
                  ? "0%"
                  : photo.status === "preprocessing"
                  ? "30%"
                  : photo.status === "inference"
                  ? "60%"
                  : photo.status === "postprocessing"
                  ? "90%"
                  : "100%"}
              </Text>
            </View>
            <View className="h-1.5 bg-zinc-700 rounded-full w-full overflow-hidden">
              <View
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{
                  width:
                    photo.status === "pending"
                      ? "5%"
                      : photo.status === "preprocessing"
                      ? "33%"
                      : photo.status === "inference"
                      ? "66%"
                      : photo.status === "postprocessing"
                      ? "90%"
                      : "100%",
                }}
              />
            </View>
          </View>
        ))}
      </View>
    </AnimatedRel.View>
  );
};
