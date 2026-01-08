import * as ImageManipulator from "expo-image-manipulator";
import { useCallback } from "react";
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
 * Helper function to perform the actual crop operation
 */
const performCrop = async (
  imagePath: string,
  cropRegion: CropRegion
): Promise<string> => {
  try {
    const uri = imagePath.startsWith("/") ? `file://${imagePath}` : imagePath;

    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ crop: cropRegion }],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );

    console.log("Image cropped successfully:", result.uri);
    return result.uri;
  } catch (error) {
    console.error("Failed to crop image:", error);
    console.error("Attempted crop region:", cropRegion);
    return imagePath;
  }
};

/**
 * Custom hook to handle image cropping based on screen crop bounds.
 */
export const useCropImage = ({
  cropBounds,
  screenWidth,
  screenHeight,
}: UseCropImageOptions) => {
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

      console.log("=== CROP DEBUG ===");
      console.log("Screen dimensions:", { screenWidth, screenHeight });
      console.log("Image dimensions:", { imageWidth, imageHeight });
      console.log("Crop bounds (screen coords):", cropBounds);

      const isScreenPortrait = screenHeight > screenWidth;
      const isImageLandscape = imageWidth > imageHeight;
      const needsRotationHandling = isScreenPortrait && isImageLandscape;

      console.log("Orientation:", { isScreenPortrait, isImageLandscape, needsRotationHandling });

      // NOTE: expo-image-manipulator respects EXIF orientation, so even though
      // the camera reports 1600x1200 (landscape), the manipulator sees it as 
      // 1200x1600 (portrait) after applying EXIF rotation.
      // We should use the EXIF-corrected dimensions for our calculations.
      
      // Swap dimensions if the image needs rotation (EXIF will be applied by manipulator)
      const actualImageWidth = needsRotationHandling ? imageHeight : imageWidth;
      const actualImageHeight = needsRotationHandling ? imageWidth : imageHeight;
      
      console.log("Actual image dims (after EXIF):", { actualImageWidth, actualImageHeight });

      let scale: number;
      let offsetX = 0;
      let offsetY = 0;
      let cropRegion: CropRegion;

      // Calculate aspect fill scaling (how the image fills the screen)
      const imageAspect = actualImageWidth / actualImageHeight;
      const screenAspect = screenWidth / screenHeight;

      console.log("Aspect ratios:", { imageAspect, screenAspect });

      if (imageAspect > screenAspect) {
        // Image is wider - height fills, width is cropped
        scale = actualImageHeight / screenHeight;
        const scaledWidth = actualImageWidth / scale;
        offsetX = (scaledWidth - screenWidth) / 2;
        console.log("Width cropped mode:", { scale, scaledWidth, offsetX });
      } else {
        // Image is taller - width fills, height is cropped
        scale = actualImageWidth / screenWidth;
        const scaledHeight = actualImageHeight / scale;
        offsetY = (scaledHeight - screenHeight) / 2;
        console.log("Height cropped mode:", { scale, scaledHeight, offsetY });
      }

      // Convert screen coordinates directly to image coordinates (no rotation needed)
      cropRegion = {
        originX: Math.round((cropBounds.x + offsetX) * scale),
        originY: Math.round((cropBounds.y + offsetY) * scale),
        width: Math.round(cropBounds.width * scale),
        height: Math.round(cropBounds.height * scale),
      };

      console.log("Crop region (before clamp):", cropRegion);

      // Clamp using the actual (EXIF-corrected) dimensions
      const clampedRegion: CropRegion = {
        originX: Math.max(0, Math.min(cropRegion.originX, actualImageWidth - 1)),
        originY: Math.max(0, Math.min(cropRegion.originY, actualImageHeight - 1)),
        width: Math.max(1, Math.min(cropRegion.width, actualImageWidth - Math.max(0, cropRegion.originX))),
        height: Math.max(1, Math.min(cropRegion.height, actualImageHeight - Math.max(0, cropRegion.originY))),
      };

      console.log("Crop region (after clamp):", clampedRegion);
      console.log("=== END CROP DEBUG ===");

      return await performCrop(imagePath, clampedRegion);
    },
    [cropBounds, screenWidth, screenHeight]
  );

  return { cropImage };
};
