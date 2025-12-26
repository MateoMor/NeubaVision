import { useEffect, useRef, useState, useCallback } from "react";
import { View, Pressable, StyleSheet, useWindowDimensions } from "react-native";

import { usePhotosStore } from "@/store/usePhotosStore";
import { useModelStore } from "@/store/useModelStore"; // Import useModelStore
import { CameraOverlay } from "@/components/CameraOverlay";
import { CameraPermissionRequest } from "@/components/CameraPermissionRequest";
import { CameraControls } from "@/components/CameraControls";
import { FlashOverlay } from "@/components/FlashOverlay";
import { DeviceNotFound } from "@/components/DeviceNotFound";
import { InferenceStatusToast } from "@/components/InferenceStatusToast"; // Import Toast
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
  PhotoFile,
  useFrameProcessor,
  runAtTargetFps,
} from "react-native-vision-camera";
import { useRunOnJS } from "react-native-worklets-core";
import { useIsFocused } from "@react-navigation/native";
import { useAppState } from "@react-native-community/hooks";
import { useResizePlugin } from "vision-camera-resize-plugin";
import { useSharedValue } from "react-native-reanimated";

import { MainSquareGrid } from "@/types/MainSquareGrid";
import { postprocessYOLOOutput } from "@/utils/inference/yoloPostprocessing";

// Grid configuration constants
const GRID_CONFIG = {
  rows: 4,
  cols: 4,
  strokeWidth: 2,
  color: "#00FF00",
  opacity: 0.85,
} as const;

export default function CameraScreen() {
  const { addPhoto, updatePhotoStatus, setDetections } = usePhotosStore();
  const { model, loading, loadModel, runInference, setClassNames, inferenceState } =
    useModelStore();
  const { width, height } = useWindowDimensions();

  // Camera setup
  const { hasPermission } = useCameraPermission();
  const device = useCameraDevice("back");
  const camera = useRef<Camera>(null);

  // App state
  const isFocused = useIsFocused();
  const appState = useAppState();
  const isActive = isFocused && appState === "active";

  const [mainSquareGrid, setMainSquareGrid] = useState<MainSquareGrid | null>(null);

  // Resize
  const { resize } = useResizePlugin();
  const outputTensor = useSharedValue<Float32Array | null>(null);
  const [shouldCaptureState, setShouldCaptureState] = useState(false);

  useEffect(() => {}, []);

  // Load model when camera is active
  useEffect(() => {
    let timeoutId: any;

    if (isActive && !model && !loading) {
      // Wait 1 second after camera is active to ensure smooth feed before starting heavy loading.
      timeoutId = setTimeout(async () => {
        try {
          console.log("Camera is active, loading model in background...");
          await loadModel();
          setClassNames(["Cells"]);
        } catch (error) {
          console.error("Delayed model load failed:", error);
        }
      }, 300);
    }

    return () => clearTimeout(timeoutId);
  }, [isActive, model, loading]);

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

  // Handler for photo taken
  const handlePhotoTaken = useCallback(
    async (photo: PhotoFile) => {
      // 1. Determine the effective path (wrapper logic is in store, but we need it for updates)
      // usePhotosStore handles the wrapping of path, so we can use the raw path for status updates
      // as updatePhotoStatus checks both.

      // 2. Add photo to gallery immediately
      addPhoto(photo);
      const photoPath = photo.path;
      updatePhotoStatus(photoPath, "queued");

      // 3. Start inference in background (non-blocking)
      (async () => {
        try {
          const detections = await runInference(photoPath);
          setDetections(photoPath, detections);
          updatePhotoStatus(photoPath, "completed");
        } catch (error) {
          console.error("Inference pipeline failed:", error);
          // Error handling already in runInference, but we can double check
        }
      })();
    },
    [addPhoto, updatePhotoStatus, setDetections, runInference]
  );

  const { takePicture } = useTakePicture({
    cameraRef: camera,
    onPhotoTaken: handlePhotoTaken,
    cropImage,
  });
  const { pickImage } = useImagePicker({
    onImagePicked: handlePhotoTaken, // Reuse same handler for picked images
  });

  // Initialize grid lines on mount
  useEffect(() => {
    setMainSquareGrid(
      addNeubauerChamberLines(
        GRID_CONFIG.rows,
        GRID_CONFIG.cols,
        GRID_CONFIG.strokeWidth,
        GRID_CONFIG.color,
        GRID_CONFIG.opacity
      )
    );
  }, [addNeubauerChamberLines]);

  // Toggle grid visibility
  const toggleGrid = useCallback(() => {
    if (lines.length > 0) {
      clearLines();
    } else {
      setMainSquareGrid(
        addNeubauerChamberLines(
          GRID_CONFIG.rows,
          GRID_CONFIG.cols,
          GRID_CONFIG.strokeWidth,
          GRID_CONFIG.color,
          GRID_CONFIG.opacity
        )
      );
    }
  }, [lines.length, clearLines, addNeubauerChamberLines]);

  // Handle zoom change
  const handleZoomChange = useCallback((value: number) => {
    setZoom(value);
  }, []);

  // Worklet-safe function to reset capture state
  const resetCaptureState = useRunOnJS(() => {
    setShouldCaptureState(false);
  }, []);

  // Permission check
  if (!hasPermission) {
    return <CameraPermissionRequest />;
  }

  // Device check
  if (!device) {
    return <DeviceNotFound />;
  }

  const frameProcessor = useFrameProcessor(
    (frame) => {
      "worklet";

      console.log("shouldCapture.value", shouldCaptureState);
      if (!shouldCaptureState) return;

      console.log("Frame processor - Capturing inference");

      const deltaTime = Date.now();

      const resized = resize(frame, {
        crop: {
          x: mainSquareGrid?.x ?? 0,
          y: mainSquareGrid?.y ?? 0,
          width: mainSquareGrid?.width ?? 640,
          height: mainSquareGrid?.height ?? 640,
        },
        scale: {
          width: 640,
          height: 640,
        },
        pixelFormat: "rgb",
        dataType: "float32",
      }) as Float32Array;

      const output = model?.runSync([resized]);

      if (output && output.length > 0) {
        const detections = postprocessYOLOOutput(output[0] as Float32Array, ["Cell"], {
          confidenceThreshold: 0.3,
          iouThreshold: 0.5,
        });

        console.log("Detections in worklet (One-shot):", detections.length);
      }

      const deltaTime2 = Date.now() - deltaTime;
      console.log("Inference time (ms):", deltaTime2);

      // Reset capture state from worklet using runOnJS wrapper
      resetCaptureState();
    },
    [model, mainSquareGrid, shouldCaptureState, resetCaptureState]
  );

  const captureAndInference = useCallback(() => {
    setShouldCaptureState(true);
    console.log("Capture triggered");
    const photo = takePicture();
  }, []);

  return (
    <View className="flex-1 justify-center">
      {/* Camera View */}
      <Pressable className="flex-1" onPress={captureAndInference}>
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
          frameProcessor={frameProcessor}
        />
      </Pressable>

      {/* Grid Overlay */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <CameraOverlay lines={lines} />
      </View>

      {/* Flash Effect */}
      <FlashOverlay opacity={flashOpacity} />

      {/* Inference Progress Toast */}
      <InferenceStatusToast />

      {/* Controls */}
      <CameraControls
        zoom={zoom}
        onZoomChange={handleZoomChange}
        device={device}
        onToggleGrid={toggleGrid}
        onTakePicture={captureAndInference}
        onPickImage={pickImage}
      />
    </View>
  );
}
