import React from "react";
import { View, Text, Animated } from "react-native";
import { usePhotosStore } from "@/store/usePhotosStore";
import { FadeInUp, FadeOutUp, ReanimatedLogLevel } from "react-native-reanimated";
import AnimatedRel from "react-native-reanimated";
import { configureReanimatedLogger } from "react-native-reanimated";

configureReanimatedLogger({
  strict: false,
});

export const InferenceStatusToast = () => {
  const photos = usePhotosStore((state) => state.photos);

  // Get photos that are currently being processed or in queue
  const activePhotos = photos.filter((p) =>
    ["pending", "queued", "preprocessing", "inference", "postprocessing"].includes(
      p.status
    )
  );

  if (activePhotos.length === 0) return null;

  return (
    <AnimatedRel.View
      entering={FadeInUp}
      exiting={FadeOutUp}
      className="absolute top-12 left-4 right-4 bg-zinc-900/90 border border-zinc-700 p-4 rounded-2xl shadow-xl z-50"
    >
      <Text className="text-white font-bold mb-3 text-sm">
        {activePhotos.some((p) => p.status !== "queued")
          ? `Procesando ${activePhotos.length} imagen${
              activePhotos.length > 1 ? "es" : ""
            }`
          : "Imágenes en cola"}
      </Text>

      <View className="gap-y-3">
        {activePhotos.map((photo, index) => (
          <View key={photo.path + index} className="flex-col gap-1">
            <View className="flex-row justify-between mb-1">
              <Text className="text-zinc-400 text-xs truncate max-w-[80%]">
                Imagen {photos.length - photos.indexOf(photo)}
              </Text>
              <Text
                className={`${
                  photo.status === "queued" ? "text-zinc-500" : "text-green-400"
                } text-xs font-medium`}
              >
                {photo.status === "pending" || photo.status === "queued"
                  ? "En espera"
                  : photo.status === "preprocessing"
                  ? "Preparando..."
                  : photo.status === "inference"
                  ? "Analizando..."
                  : photo.status === "postprocessing"
                  ? "Finalizando..."
                  : "Listo"}
              </Text>
            </View>
            <View className="h-1.5 bg-zinc-700 rounded-full w-full overflow-hidden">
              <View
                className={`h-full ${
                  photo.status === "queued" ? "bg-zinc-600" : "bg-green-500"
                } rounded-full transition-all duration-300`}
                style={{
                  width:
                    photo.status === "pending" || photo.status === "queued"
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
