import { Image } from "expo-image";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "@/components/ui/icon";

import { Link, Stack } from "expo-router";

import { Aperture } from "lucide-react-native";

import { HStack } from "@/components/ui/hstack";

import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useState } from "react";

import { Button, ButtonIcon } from "@/components/ui/button";

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View className="flex-1 justify-center">
        <Text className="text-center mb-4">
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission}>Grant Permission</Button>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  return (
    <View className="flex-1 justify-center">
      <CameraView style={{ flex: 1 }} facing={facing} />
      <HStack className="absolute bottom-16 w-full px-16 justify-center items-center gap-4">
        <Button onPress={toggleCameraFacing}>
          <Text>Flip</Text>
        </Button>
        <Button onPress={() => {}} variant="link" size="xl" className="p-0">
          <ButtonIcon as={Aperture} size="xl" className="w-20 h-20" />
        </Button>
      </HStack>
    </View>
  );
}
