import { useCallback } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { PhotoFile } from "react-native-vision-camera";

type UseImagePickerOptions = {
  onImagePicked?: (photo: PhotoFile) => void;
};

/**
 * Custom hook to handle image picking from the media library.
 * Requests permissions and allows user to select an image.
 */
export const useImagePicker = ({ onImagePicked }: UseImagePickerOptions) => {
  const pickImage = useCallback(async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Permission to access the media library is required."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const selectedAsset = result.assets[0];
      // Create a PhotoFile-like object from the selected asset
      const photoFromGallery: PhotoFile = {
        path: selectedAsset.uri,
        width: selectedAsset.width ?? 0,
        height: selectedAsset.height ?? 0,
        isRawPhoto: false,
        orientation: "portrait",
        isMirrored: false,
      };
      onImagePicked?.(photoFromGallery);
    }
  }, [onImagePicked]);

  return { pickImage };
};
