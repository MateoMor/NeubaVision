import { useState } from "react";
import { Gesture, GestureDetector, Directions } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

interface ZoomableContainerProps {
  children: React.ReactNode;
  /** The width of the container/image. Used to calculate translation boundaries. */
  width: number;
  /** The height of the container/image. Used to calculate translation boundaries. */
  height: number;
  /** Function to be called when the user flings the container and it is not zoomed in. */
  onFling?: (direction: Directions) => void;
  /** Function to be called when the zoom scale changes. */
  onZoomChange?: (isZoomed: boolean) => void;
}

/**
 * A container component that provides pinch-to-zoom and pan interactions.
 * It restricts translation to Ensure the content stays within the view boundaries
 * when zoomed in.
 *
 * @param props - The component props.
 * @returns The zoomable container.
 */
export function ZoomableContainer({
  children,
  width,
  height,
  onFling,
  onZoomChange,
}: ZoomableContainerProps) {
  // Shared values for animation state
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const isZoomedShared = useSharedValue(false);

  const updateZoomState = (zoomed: boolean) => {
    "worklet";
    if (zoomed !== isZoomedShared.value) {
      isZoomedShared.value = zoomed;
      if (onZoomChange) {
        runOnJS(onZoomChange)(zoomed);
      }
    }
  };

  /**
   * Clamps a value between a minimum and maximum value.
   * Worklet-safe for use in Reanimated callbacks.
   */
  const clamp = (val: number, min: number, max: number) => {
    "worklet";
    return Math.min(Math.max(val, min), max);
  };

  // Pinch gesture handler for zooming
  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      // If zoomed out beyond original size, bounce back
      if (scale.value < 1) {
        scale.value = withTiming(1);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedScale.value = 1;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
        updateZoomState(false);
      } else {
        // Save current scale
        savedScale.value = scale.value;
        updateZoomState(scale.value > 1.01);
        const maxTranslateX = (width * (scale.value - 1)) / 2;
        const maxTranslateY = (height * (scale.value - 1)) / 2;

        // Check if current position is out of bounds after zoom ends
        if (
          Math.abs(translateX.value) > maxTranslateX ||
          Math.abs(translateY.value) > maxTranslateY
        ) {
          const newX = clamp(translateX.value, -maxTranslateX, maxTranslateX);
          const newY = clamp(translateY.value, -maxTranslateY, maxTranslateY);
          translateX.value = withTiming(newX);
          translateY.value = withTiming(newY);
          savedTranslateX.value = newX;
          savedTranslateY.value = newY;
        }
      }
    });

  const flingLeft = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(() => {
      if (scale.value <= 1.01 && onFling) {
        runOnJS(onFling)(Directions.LEFT);
      }
    });

  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => {
      if (scale.value <= 1.01 && onFling) {
        runOnJS(onFling)(Directions.RIGHT);
      }
    });

  // Pan gesture handler for moving the zoomed view
  const pan = Gesture.Pan()
    .averageTouches(true)
    .onUpdate((e) => {
      // Only allow panning if zoomed in
      if (scale.value > 1) {
        const maxTranslateX = (width * (scale.value - 1)) / 2;
        const maxTranslateY = (height * (scale.value - 1)) / 2;

        // Ensure translation doesn't go beyond the image bounds
        //
        translateX.value = clamp(
          savedTranslateX.value + e.translationX,
          -maxTranslateX,
          maxTranslateX
        );
        translateY.value = clamp(
          savedTranslateY.value + e.translationY,
          -maxTranslateY,
          maxTranslateY
        );
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const composed = Gesture.Simultaneous(
    pinch,
    pan,
    Gesture.Exclusive(flingLeft, flingRight)
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    width,
    height,
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </GestureDetector>
  );
}
