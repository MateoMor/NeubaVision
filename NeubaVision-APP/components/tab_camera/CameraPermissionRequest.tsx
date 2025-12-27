import React from "react";
import { View, Text } from "react-native";
import { Button } from "@/components/ui/button";
import { useCameraPermission } from "react-native-vision-camera";

export const CameraPermissionRequest = () => {
  const { requestPermission } = useCameraPermission();

  return (
    <View className="flex-1 justify-center items-center p-5">
      <Text className="text-center mb-5 text-base">
        We need your permission to show the camera
      </Text>
      <Button onPress={requestPermission}>
        <Text className="text-white font-semibold">Grant Permission</Text>
      </Button>
    </View>
  );
};
