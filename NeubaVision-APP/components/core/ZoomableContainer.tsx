import React, { useEffect } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector, Directions } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedReaction } from "react-native-reanimated";
import { useZoomGesture } from "react-native-zoom-reanimated";

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
  /** Optional identifier to reset zoom when it changes (e.g. image path) */
  resetId?: string;
}

/**
 * A container component that provides pinch-to-zoom and pan interactions
 * using react-native-zoom-reanimated for better performance and reliability.
 */
export function ZoomableContainer({
  children,
  width,
  height,
  onFling,
  onZoomChange,
  resetId,
}: ZoomableContainerProps) {
  const {
    zoomGesture,
    contentContainerAnimatedStyle,
    isZoomedIn,
    onLayout,
    onLayoutContent,
    zoomOut,
  } = useZoomGesture({
    doubleTapConfig: {
      defaultScale: 1,
    },
  });

  // Notify parent about zoom changes
  useAnimatedReaction(
    () => isZoomedIn.value,
    (zoomed) => {
      if (onZoomChange) {
        runOnJS(onZoomChange)(zoomed);
      }
    },
    [onZoomChange]
  );

  // Reset zoom when resetId changes
  useEffect(() => {
    zoomOut();
  }, [resetId]);

  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => {
      if (!isZoomedIn.value && onFling) {
        runOnJS(onFling)(Directions.RIGHT);
      }
    });

  const flingLeft = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(() => {
      if (!isZoomedIn.value && onFling) {
        runOnJS(onFling)(Directions.LEFT);
      }
    });

  const composedGesture = Gesture.Simultaneous(
    zoomGesture,
    Gesture.Exclusive(flingLeft, flingRight)
  );

  return (
    <View
      style={{ width, height }}
      onLayout={onLayout}
      className="justify-center items-center overflow-hidden"
    >
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[contentContainerAnimatedStyle, { width, height }]}>
          <View onLayout={onLayoutContent}>{children}</View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
