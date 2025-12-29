import { Gesture } from "react-native-gesture-handler";
import { SharedValue, withSpring } from "react-native-reanimated";

/**
 * Creates a Pan Gesture for vertical movement, typically used for Bottom Sheets.
 * 
 * Features:
 * - Upper boundary resistance (rubber banding) when pulling beyond the fully expanded state.
 * - Automatic snapping to "expanded" or "collapsed" states.
 * - Draggable range limited between 0 (expanded) and the calculated max translation (collapsed).
 * 
 * @param translateY - The animated shared value that controls the vertical position.
 * @param contentHeight - The total height of the component being moved.
 * @param COLLAPSED_PEEK_HEIGHT - The height of the section that should remain visible when collapsed.
 * @param context - A shared value used to store the starting position of the gesture.
 * @param damping - The damping factor for the spring animation.
 * 
 * @returns A configured Pan Gesture to be used with GestureDetector.
 */
export const verticalPan = (
  translateY: SharedValue<number>,
  contentHeight: number,
  COLLAPSED_PEEK_HEIGHT: number,
  context: SharedValue<number>,
  damping: number = 45
) =>
  Gesture.Pan()
    .onStart(() => {
      // Save current position to calculate relative movement during the gesture
      context.value = translateY.value;
    })
    .onUpdate((event) => {
      const newY = context.value + event.translationY;
      const maxTranslate = Math.max(contentHeight - COLLAPSED_PEEK_HEIGHT, 0);

      if (newY < 0) {
        // Apply resistance if the user tries to pull the sheet higher than its top limit
        translateY.value = newY * 0.3;
      } else {
        // Limit movement between the expanded state (0) and collapsed state (maxTranslate)
        translateY.value = Math.max(0, Math.min(newY, maxTranslate));
      }
    })
    .onEnd(() => {
      const maxTranslate = Math.max(contentHeight - COLLAPSED_PEEK_HEIGHT, 0);

      if (translateY.value < 0) {
        // If pulled beyond the top, spring back to the expanded (0) position
        translateY.value = withSpring(0, { damping });
      } else if (translateY.value > maxTranslate / 2) {
        // If dragged more than halfway down, snap to the collapsed position
        translateY.value = withSpring(maxTranslate, { damping });
      } else {
        // If dragged less than halfway, snap back to the expanded positionPronntach
        translateY.value = withSpring(0, { damping });
      }
    });