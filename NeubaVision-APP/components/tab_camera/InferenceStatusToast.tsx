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
import { useThemeColor } from "@/hooks/theme/useThemeColor";

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

  const bgTrack = useThemeColor({}, "inputBackground");
  const tint = useThemeColor({}, "tint");
  const icon = useThemeColor({}, "icon");

  return (
    <View
      className="h-1.5 rounded-full w-full overflow-hidden"
      style={{ backgroundColor: bgTrack }}
    >
      <Animated.View
        className="h-full rounded-full"
        style={[animatedStyle, { backgroundColor: status === "queued" ? icon : tint }]}
      />
    </View>
  );
};

export const InferenceStatusToast = () => {
  const { t } = useTranslation();
  const textColor = useThemeColor({}, "text");
  const overlayColor = useThemeColor({}, "overlay");
  const borderColor = useThemeColor({}, "border");
  const iconColor = useThemeColor({}, "icon");
  const tintColor = useThemeColor({}, "tint");
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
      className="absolute top-12 left-4 right-4 border p-4 rounded-2xl shadow-xl z-50"
      style={{
        backgroundColor: overlayColor,
        borderColor: borderColor,
      }}
    >
      <Text className="font-bold mb-3 text-sm" style={{ color: textColor }}>
        {activePhotos.some((p) => p.status !== "queued")
          ? t("inference.processing", { count: activePhotos.length })
          : t("inference.queued")}
      </Text>

      <View className="gap-y-3">
        {activePhotos.map((photo, index) => (
          <View key={photo.path + index} className="flex-col gap-1">
            <View className="flex-row justify-between mb-1">
              <Text className="text-xs truncate max-w-[80%]" style={{ color: iconColor }}>
                {t("inference.image_label")} {photos.length - photos.indexOf(photo)}
              </Text>
              <Text
                className="text-xs font-medium"
                style={{
                  color: photo.status === "queued" ? iconColor : tintColor,
                }}
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
