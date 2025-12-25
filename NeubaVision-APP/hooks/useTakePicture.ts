import { useCallback, RefObject } from "react";
import { Camera, PhotoFile } from "react-native-vision-camera";

type UseTakePictureOptions = {
  cameraRef: RefObject<Camera | null>;
  onPhotoTaken?: (photo: PhotoFile) => void;
};

/**
 * Custom hook to handle photo capture logic.
 * Provides a function to take pictures using the camera reference.
 */
export const useTakePicture = ({
  cameraRef,
  onPhotoTaken,
}: UseTakePictureOptions) => {
  const takePicture = useCallback(async () => {
    if (!cameraRef.current) {
      console.warn("Camera ref is not set");
      return;
    }

    try {
      const photo = await cameraRef.current.takePhoto();
      console.log("Photo taken:", photo.path);
      onPhotoTaken?.(photo);
    } catch (error) {
      console.error("Failed to take photo:", error);
    }
  }, [cameraRef, onPhotoTaken]);

  return { takePicture };
};
