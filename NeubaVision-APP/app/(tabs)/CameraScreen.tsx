import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { Aperture, Images } from "lucide-react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

import { usePhotosStore } from "@/store/usePhotosStore";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonIcon } from "@/components/ui/button";

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
  const addPhoto = usePhotosStore((state) => state.addPhoto);

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

  const takePicture = async () => {
    console.log("Taking picture...");
    if (!cameraRef) {
      return;
    }

    console.log("Camera ref is set, capturing photo...");

    const photo = await cameraRef.takePictureAsync();
    console.log("Photo taken:", photo);
    addPhoto(photo);
  };

  const pickImage = async () => {

    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Permission to access the media library is required."
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      quality: 1,
    });


    if (!result.canceled) {
      const selectedAsset = result.assets[0];
      addPhoto({ uri: selectedAsset.uri } as any);
    }
  };

  return (
    <View className="flex-1 justify-center">
      <CameraView style={{ flex: 1 }} facing={facing} ref={setCameraRef} />
      <HStack className="absolute bottom-16 w-full px-16 justify-center items-center gap-4">
        <Button onPress={toggleCameraFacing}>
          <Text>Flip</Text>
        </Button>
        <Button onPress={takePicture} variant="link" size="xl" className="p-0">
          <ButtonIcon as={Aperture} size="xl" className="w-20 h-20" />
        </Button>
        <Button onPress={pickImage}>
          <ButtonIcon as={Images} size="lg" className="w-8 h-8" />
        </Button>
      </HStack>
    </View>
  );
}
