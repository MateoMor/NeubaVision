import { useCallback, RefObject } from "react";
import { Camera, PhotoFile } from "react-native-vision-camera";

type UseTakePictureOptions = {
  cameraRef: RefObject<Camera | null>;
  onPhotoTaken?: (photo: PhotoFile) => void;
  cropImage?: (
    imagePath: string,
    imageWidth: number,
    imageHeight: number
  ) => Promise<string>;
};

/**
 * Custom hook to handle photo capture logic.
 * Provides a function to take pictures using the camera reference.
 * Optionally crops the image before saving.
 */
export const useTakePicture = ({
  cameraRef,
  onPhotoTaken,
  cropImage,
}: UseTakePictureOptions) => {
  const takePicture = useCallback(async () => {
    if (!cameraRef.current) {
      console.warn("Camera ref is not set");
      return;
    }

    try {
      const photo = await cameraRef.current.takePhoto();
      console.log("Photo taken:", photo.path);

      // If cropImage is provided, crop the photo
      if (cropImage) {
        const croppedUri = await cropImage(
          photo.path,
          photo.width,
          photo.height
        );
        
        // Create a modified photo object with the cropped path
        const croppedPhoto: PhotoFile = {
          ...photo,
          path: croppedUri,
        };
        
        onPhotoTaken?.(croppedPhoto);
      } else {
        onPhotoTaken?.(photo);
      }
    } catch (error) {
      console.error("Failed to take photo:", error);
    }
  }, [cameraRef, onPhotoTaken, cropImage]);

  return { takePicture };
};
