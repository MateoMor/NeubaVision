import React from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Button, ButtonText } from "@/components/ui/button";
import { useCameraPermission } from "react-native-vision-camera";
import { useThemeColor } from "@/hooks/theme/useThemeColor";
import { Ionicons } from "@expo/vector-icons";

export const CameraPermissionRequest = () => {
  const { t } = useTranslation();
  const { requestPermission } = useCameraPermission();

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "card");
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icon");
  const borderColor = useThemeColor({}, "border");
  const tintColor = useThemeColor({}, "tint");

  return (
    <View className="flex-1 justify-center items-center p-6" style={{ backgroundColor }}>
      <View
        className="w-full max-w-sm p-8 rounded-3xl items-center border shadow-lg"
        style={{
          backgroundColor: cardColor,
          borderColor: borderColor,
        }}
      >
        {/* Icon Container */}
        <View
          className="w-20 h-20 rounded-full items-center justify-center mb-6"
          style={{ backgroundColor: `${tintColor}15` }}
        >
          <Ionicons name="camera-outline" size={40} color={tintColor} />
        </View>

        {/* Title */}
        <Text className="text-xl font-bold text-center mb-3" style={{ color: textColor }}>
          {t("camera.permission_title", "Permiso de Cámara")}
        </Text>

        {/* Description */}
        <Text
          className="text-center mb-8 text-base leading-6"
          style={{ color: iconColor }}
        >
          {t("camera.permission_text")}
        </Text>

        {/* Button */}
        <Button onPress={requestPermission} size="lg" className="w-full rounded-xl">
          <ButtonText className="font-semibold">
            {t("camera.grant_permission")}
          </ButtonText>
        </Button>
      </View>
    </View>
  );
};
