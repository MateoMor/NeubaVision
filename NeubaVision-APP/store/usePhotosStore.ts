import { create } from "zustand";
import { PhotoFile } from "react-native-vision-camera";

import { BoundingBox } from "@/types/BoundingBox";

type PhotosState = {
  photos: PhotoFile[];
  detections: Record<string, BoundingBox[]>;

  addPhoto: (photo: PhotoFile) => void;
  setDetections: (photoPath: string, boxes: BoundingBox[]) => void;
  clear: () => void;

  getLastPhoto: () => PhotoFile | null;
};

// Function to normalize the image path
const getImageUri = (path: string): string => {
  if (path.startsWith("/")) {
    return `file://${path}`;
  }
  return path;
};

export const usePhotosStore = create<PhotosState>((set, get) => ({
  photos: [],
  detections: {},

  addPhoto: (photo: PhotoFile) =>
    set((state) => ({
      photos: [
        ...state.photos,
        { ...photo, path: getImageUri(photo.path) },
      ],
    })),

  setDetections: (photoPath: string, boxes: BoundingBox[]) =>
    set((state) => ({
      detections: {
        ...state.detections,
        [photoPath]: boxes,
      },
    })),

  clear: () => set({ photos: [], detections: {} }),

  getLastPhoto: () => {
    const photos = get().photos;
    return photos.length ? photos[photos.length - 1] : null;
  },
}));
