import { useCallback } from "react";
import * as ImageManipulator from "expo-image-manipulator";
import { CropBounds } from "./useLineDrawing";

type CropRegion = {
  originX: number;
  originY: number;
  width: number;
  height: number;
};

type UseCropImageOptions = {
  cropBounds: CropBounds;
  screenWidth: number;
  screenHeight: number;
};

/**
 * Custom hook to handle image cropping based on screen crop bounds.
 * Converts screen coordinates to image coordinates considering aspect fill scaling.
 */
export const useCropImage = ({
  cropBounds,
  screenWidth,
  screenHeight,
}: UseCropImageOptions) => {
  /**
   * Crops an image based on the current crop bounds.
   * Handles aspect fill (cover) scaling where the image may extend beyond screen bounds.
   *
   * @param imagePath - Path to the original image
   * @param imageWidth - Width of the original image in pixels
   * @param imageHeight - Height of the original image in pixels
   * @returns Promise with the cropped image URI, or original path if no bounds
   */
  const cropImage = useCallback(
    async (
      imagePath: string,
      imageWidth: number,
      imageHeight: number
    ): Promise<string> => {
      if (!cropBounds) {
        console.log("No crop bounds set, returning original image");
        return imagePath;
      }

      // Calculate aspect ratios
      const screenAspect = screenWidth / screenHeight;
      const imageAspect = imageWidth / imageHeight;

      let scale: number;
      let offsetX = 0;
      let offsetY = 0;

      // Aspect fill (cover) calculation
      // The image is scaled to fill the screen, maintaining aspect ratio
      // Some part of the image may be cropped off-screen
      if (imageAspect > screenAspect) {
        // Image is wider than screen (relative to height)
        // Height fills the screen, width extends beyond
        scale = imageHeight / screenHeight;
        const scaledImageWidth = imageWidth / scale;
        offsetX = (scaledImageWidth - screenWidth) / 2;
      } else {
        // Image is taller than screen (relative to width)
        // Width fills the screen, height extends beyond
        scale = imageWidth / screenWidth;
        const scaledImageHeight = imageHeight / scale;
        offsetY = (scaledImageHeight - screenHeight) / 2;
      }

      // Convert screen coordinates to image coordinates
      // Account for the offset caused by aspect fill centering
      const cropRegion: CropRegion = {
        originX: Math.round((cropBounds.x + offsetX) * scale),
        originY: Math.round((cropBounds.y + offsetY) * scale),
        width: Math.round(cropBounds.width * scale),
        height: Math.round(cropBounds.height * scale),
      };

      // Clamp values to ensure they're within image bounds
      const clampedRegion: CropRegion = {
        originX: Math.max(0, Math.min(cropRegion.originX, imageWidth - 1)),
        originY: Math.max(0, Math.min(cropRegion.originY, imageHeight - 1)),
        width: Math.max(1, Math.min(cropRegion.width, imageWidth - Math.max(0, cropRegion.originX))),
        height: Math.max(1, Math.min(cropRegion.height, imageHeight - Math.max(0, cropRegion.originY))),
      };

      try {
        // Normalize image path for expo-image-manipulator
        const uri = imagePath.startsWith("/")
          ? `file://${imagePath}`
          : imagePath;

        const result = await ImageManipulator.manipulateAsync(
          uri,
          [{ crop: clampedRegion }],
          { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
        );

        console.log("Image cropped successfully:", result.uri);
        return result.uri;
      } catch (error) {
        console.error("Failed to crop image:", error);
        console.error("Attempted crop region:", clampedRegion);
        return imagePath; // Return original on error
      }
    },
    [cropBounds, screenWidth, screenHeight]
  );

  return { cropImage };
};
