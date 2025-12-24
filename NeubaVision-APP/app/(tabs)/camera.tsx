import { useRef, useState } from "react";
import {
  Alert,
  Text,
  View,
  useWindowDimensions,
  StyleSheet,
  Pressable,
  Animated,
} from "react-native";
import { Aperture, Images, Trash2 } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

import { usePhotosStore } from "@/store/usePhotosStore";
import { HStack } from "@/components/ui/hstack";
import {
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
} from "@/components/ui/slider";
import { Button, ButtonIcon } from "@/components/ui/button";
import { CameraOverlay } from "@/components/CameraOverlay";
import { useLineDrawing } from "@/hooks/useLineDrawing";
import {
  useCameraPermission,
  useCameraDevice,
  Camera,
  useFrameProcessor,
  useCameraFormat,
} from "react-native-vision-camera";
import { useIsFocused } from "@react-navigation/native";
import { useAppState } from "@react-native-community/hooks";

export default function CameraScreen() {
  const addPhoto = usePhotosStore((state) => state.addPhoto);
  const { width, height } = useWindowDimensions();

  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("back");

  const isFocused = useIsFocused();
  const appState = useAppState();
  const isActive = isFocused && appState === "active";

  const camera = useRef<Camera>(null);
  const [zoom, setZoom] = useState(device?.neutralZoom ?? 1);

  const { lines, clearLines, addNeubauerChamberLines } = useLineDrawing(width, height);

  if (!hasPermission) {
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

  const flashOpacity = useRef(new Animated.Value(0)).current;

  const triggerFlash = () => {
    Animated.sequence([
      Animated.timing(flashOpacity, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(flashOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const takePicture = async () => {
    console.log("Taking picture...");
    if (!camera.current) {
      return;
    }

    console.log("Camera ref is set, capturing photo...");

    try {
      const photo = await camera.current.takePhoto();
      console.log("Photo taken:", photo);
      addPhoto(photo);
    } catch (e) {
      console.error("Failed to take photo", e);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

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

  const frameProcessor = useFrameProcessor((frame) => {
    "worklet";
  }, []);

  const format = useCameraFormat(device, [{ fps: 30 }]);
  const fps = format?.maxFps;

  return (
    <View className="flex-1 justify-center">
      <Pressable style={{ flex: 1 }} onPress={takePicture}>
        <Camera
          ref={camera}
          style={{ flex: 1 }}
          device={device}
          isActive={isActive}
          photo={true}
          frameProcessor={frameProcessor}
          format={format}
          fps={fps}
          enableZoomGesture={true}
          onShutter={triggerFlash}
          zoom={zoom}
        />
      </Pressable>

      {/* Component to draw lines superimposed */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <CameraOverlay lines={lines} />
      </View>

      {/* Flash Overlay */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "white", opacity: flashOpacity },
        ]}
        pointerEvents="none"
      />

      {/* Zoom Slider */}
      <View className="absolute bottom-0 w-full px-8 items-center h-40 justify-evenly bg-[rgba(0,0,0,0.2)]">
        <Slider
          defaultValue={zoom}
          minValue={device?.minZoom ?? 1}
          maxValue={Math.min(device?.maxZoom ?? 1, 10)} // Cap at 10x
          value={zoom}
          onChange={(value) => {
            setZoom(value);
          }}
          className="w-1/2"
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>

        <HStack className="w-full px-16 justify-center items-center gap-4">
          <Button onPress={toggleCameraFacing}>
            <Text>Flip</Text>
          </Button>
          <Button onPress={() => addNeubauerChamberLines(4, 4, 2, "#00FF00", 0.85)}>
            <Text>Draw</Text>
          </Button>
          <Button onPress={takePicture} variant="link" size="xl" className="p-0">
            <ButtonIcon as={Aperture} size="xl" className="w-20 h-20" />
          </Button>
          <Button onPress={pickImage}>
            <ButtonIcon as={Images} size="lg" className="w-8 h-8" />
          </Button>
          <Button onPress={clearLines}>
            <ButtonIcon as={Trash2} size="lg" className="w-8 h-8" />
          </Button>
        </HStack>
      </View>
    </View>
  );
}
