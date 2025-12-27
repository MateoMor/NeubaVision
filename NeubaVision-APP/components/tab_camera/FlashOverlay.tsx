import { Animated, StyleSheet } from "react-native";

type FlashOverlayProps = {
  opacity: Animated.Value;
};

/**
 * Component that renders a white flash overlay effect.
 * Used to simulate camera flash when taking a photo.
 */
export const FlashOverlay = ({ opacity }: FlashOverlayProps) => {
  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.overlay, { opacity }]}
      pointerEvents="none"
    />
  );
};

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "white",
  },
});
