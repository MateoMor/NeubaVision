import { useRef } from "react";
import { Alert, Text, View } from "react-native";
import { Aperture, Images } from "lucide-react-native";
//import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

import { usePhotosStore } from "@/store/usePhotosStore";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonIcon } from "@/components/ui/button";
import {
  useCameraPermission,
  useCameraDevice,
  Camera,
} from "react-native-vision-camera";
import { useIsFocused } from "@react-navigation/native";
import { useAppState } from "@react-native-community/hooks";

export default function CameraScreen() {
  //const [facing, setFacing] = useState<CameraType>("back");
  //const [permission, requestPermission] = useCameraPermissions();
  //const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
  const addPhoto = usePhotosStore((state) => state.addPhoto);

  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("back");

  const isFocused = useIsFocused();
  const appState = useAppState();
  const isActive = isFocused && appState === "active";

  const camera = useRef<Camera>(null);

  if (!hasPermission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!hasPermission) {
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

  if (!device) {
    return (
      <View className="flex-1 justify-center">
        <Text>Device not found</Text>
      </View>
    );
  }

  function toggleCameraFacing() {
    console.log("Toggling camera facing...");
  }

  const takePicture = async () => {
    console.log("Taking picture...");
    if (!camera.current) {
      return;
    }

    console.log("Camera ref is set, capturing photo...");

    const photo = await camera.current.takePhoto();
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
      <Camera
        ref={camera}
        style={{ flex: 1 }}
        device={device}
        isActive={isActive}
        photo={true}
      />
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
