import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { usePhotosStore } from "@/store/usePhotosStore";
import Animated, {
  FadeInUp,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { configureReanimatedLogger } from "react-native-reanimated";
import { ProcessingStatus } from "@/types/ProcessingStatus";

// Desactiva el modo estricto para evitar advertencias
configureReanimatedLogger({
  strict: false,
});

// Componente para la barra de progreso animada
const ProgressBar = ({ status }: { status: ProcessingStatus }) => {
  const progress = useSharedValue(0);

  // Calcula el progreso según el estado
  const getProgressValue = (status: ProcessingStatus) => {
    switch (status) {
      case "pending":
      case "queued":
        return 5;
      case "preprocessing":
        return 53;
      case "inference":
        return 86;
      case "postprocessing":
        return 90;
      default:
        return 100;
    }
  };

  // Actualiza el progreso cuando cambia el estado
  useEffect(() => {
    progress.value = withTiming(getProgressValue(status), {
      duration: 800,
    });
  }, [status]);

  // Estilo animado para la barra de progreso
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value}%`,
    };
  });

  return (
    <View className="h-1.5 bg-zinc-700 rounded-full w-full overflow-hidden">
      <Animated.View
        className={`h-full ${
          status === "queued" ? "bg-zinc-600" : "bg-green-500"
        } rounded-full`}
        style={animatedStyle}
      />
    </View>
  );
};

export const InferenceStatusToast = () => {
  const { t } = useTranslation();
  const photos = usePhotosStore((state) => state.photos);

  // Get photos that are currently being processed or in queue
  const activePhotos = photos.filter((p) =>
    ["pending", "queued", "preprocessing", "inference", "postprocessing"].includes(
      p.status
    )
  );

  if (activePhotos.length === 0) return null;

  return (
    <Animated.View
      entering={FadeInUp}
      exiting={FadeOutUp}
      className="absolute top-12 left-4 right-4 bg-zinc-900/90 border border-zinc-700 p-4 rounded-2xl shadow-xl z-50"
    >
      <Text className="text-white font-bold mb-3 text-sm">
        {activePhotos.some((p) => p.status !== "queued")
          ? t("inference.processing", { count: activePhotos.length })
          : t("inference.queued")}
      </Text>

      <View className="gap-y-3">
        {activePhotos.map((photo, index) => (
          <View key={photo.path + index} className="flex-col gap-1">
            <View className="flex-row justify-between mb-1">
              <Text className="text-zinc-400 text-xs truncate max-w-[80%]">
                {t("inference.image_label")} {photos.length - photos.indexOf(photo)}
              </Text>
              <Text
                className={`${
                  photo.status === "queued" ? "text-zinc-500" : "text-green-400"
                } text-xs font-medium`}
              >
                {photo.status === "pending" || photo.status === "queued"
                  ? t("inference.status.waiting")
                  : photo.status === "preprocessing"
                  ? t("inference.status.preparing")
                  : photo.status === "inference"
                  ? t("inference.status.analyzing")
                  : photo.status === "postprocessing"
                  ? t("inference.status.finishing")
                  : t("inference.status.ready")}
              </Text>
            </View>
            <ProgressBar status={photo.status} />
          </View>
        ))}
      </View>
    </Animated.View>
  );
};
