import { useRef, useCallback } from "react";
import { Animated } from "react-native";

/**
 * Custom hook to handle camera flash animation effect.
 * Provides a trigger function and the animated opacity value.
 */
export const useCameraFlash = () => {
  const flashOpacity = useRef(new Animated.Value(0)).current;

  const triggerFlash = useCallback(() => {
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
  }, [flashOpacity]);

  return { flashOpacity, triggerFlash };
};
