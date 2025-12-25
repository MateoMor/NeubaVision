import { useEffect, useRef, useState, useCallback } from "react";
import { View, Pressable, StyleSheet, useWindowDimensions } from "react-native";

import { usePhotosStore } from "@/store/usePhotosStore";
import { CameraOverlay } from "@/components/CameraOverlay";
import { CameraPermissionRequest } from "@/components/CameraPermissionRequest";
import { CameraControls } from "@/components/CameraControls";
import { FlashOverlay } from "@/components/FlashOverlay";
import { DeviceNotFound } from "@/components/DeviceNotFound";
import { useLineDrawing } from "@/hooks/useLineDrawing";
import { useCameraFlash } from "@/hooks/useCameraFlash";
import { useTakePicture } from "@/hooks/useTakePicture";
import { useImagePicker } from "@/hooks/useImagePicker";
import { useCropImage } from "@/hooks/useCropImage";
import {
  useCameraPermission,
  useCameraDevice,
  Camera,
  useCameraFormat,
} from "react-native-vision-camera";
import { useIsFocused } from "@react-navigation/native";
import { useAppState } from "@react-native-community/hooks";

// Grid configuration constants
const GRID_CONFIG = {
  rows: 4,
  cols: 4,
  strokeWidth: 2,
  color: "#00FF00",
  opacity: 0.85,
} as const;

export default function CameraScreen() {
  const addPhoto = usePhotosStore((state) => state.addPhoto);
  const { width, height } = useWindowDimensions();

  // Camera setup
  const { hasPermission } = useCameraPermission();
  const device = useCameraDevice("back");
  const camera = useRef<Camera>(null);

  // App state
  const isFocused = useIsFocused();
  const appState = useAppState();
  const isActive = isFocused && appState === "active";

  // Camera state
  const [zoom, setZoom] = useState(device?.neutralZoom ?? 1);
  const format = useCameraFormat(device, [{ fps: 30 }]);
  const fps = format?.maxFps;

  // Custom hooks
  const { lines, cropBounds, clearLines, addNeubauerChamberLines } = useLineDrawing(
    width,
    height
  );
  const { flashOpacity, triggerFlash } = useCameraFlash();
  const { cropImage } = useCropImage({
    cropBounds,
    screenWidth: width,
    screenHeight: height,
  });
  const { takePicture } = useTakePicture({
    cameraRef: camera,
    onPhotoTaken: addPhoto,
    cropImage,
  });
  const { pickImage } = useImagePicker({
    onImagePicked: addPhoto,
  });

  // Initialize grid lines on mount
  useEffect(() => {
    addNeubauerChamberLines(
      GRID_CONFIG.rows,
      GRID_CONFIG.cols,
      GRID_CONFIG.strokeWidth,
      GRID_CONFIG.color,
      GRID_CONFIG.opacity
    );
  }, [addNeubauerChamberLines]);

  // Toggle grid visibility
  const toggleGrid = useCallback(() => {
    if (lines.length > 0) {
      clearLines();
    } else {
      addNeubauerChamberLines(
        GRID_CONFIG.rows,
        GRID_CONFIG.cols,
        GRID_CONFIG.strokeWidth,
        GRID_CONFIG.color,
        GRID_CONFIG.opacity
      );
    }
  }, [lines.length, clearLines, addNeubauerChamberLines]);

  // Handle zoom change
  const handleZoomChange = useCallback((value: number) => {
    setZoom(value);
  }, []);

  // Permission check
  if (!hasPermission) {
    return <CameraPermissionRequest />;
  }

  // Device check
  if (!device) {
    return <DeviceNotFound />;
  }

  return (
    <View className="flex-1 justify-center">
      {/* Camera View */}
      <Pressable className="flex-1" onPress={takePicture}>
        <Camera
          ref={camera}
          style={{ flex: 1 }}
          device={device}
          isActive={isActive}
          photo={true}
          format={format}
          fps={fps}
          enableZoomGesture={true}
          onShutter={triggerFlash}
          zoom={zoom}
        />
      </Pressable>

      {/* Grid Overlay */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <CameraOverlay lines={lines} />
      </View>

      {/* Flash Effect */}
      <FlashOverlay opacity={flashOpacity} />

      {/* Controls */}
      <CameraControls
        zoom={zoom}
        onZoomChange={handleZoomChange}
        device={device}
        onToggleGrid={toggleGrid}
        onTakePicture={takePicture}
        onPickImage={pickImage}
      />
    </View>
  );
}
