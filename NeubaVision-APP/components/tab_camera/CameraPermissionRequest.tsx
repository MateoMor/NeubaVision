import React from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useCameraPermission } from "react-native-vision-camera";

export const CameraPermissionRequest = () => {
  const { t } = useTranslation();
  const { requestPermission } = useCameraPermission();

  return (
    <View className="flex-1 justify-center items-center p-5">
      <Text className="text-center mb-5 text-base">{t("camera.permission_text")}</Text>
      <Button onPress={requestPermission}>
        <Text className="text-white font-semibold">{t("camera.grant_permission")}</Text>
      </Button>
    </View>
  );
};
