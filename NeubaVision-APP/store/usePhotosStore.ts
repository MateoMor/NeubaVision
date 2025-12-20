import { create } from "zustand";
import { CameraCapturedPicture } from "expo-camera";

import { BoundingBox } from "@/types/BoundingBox";

type PhotosState = {
  photos: CameraCapturedPicture[];
  detections: Record<string, BoundingBox[]>;

  addPhoto: (photo: CameraCapturedPicture) => void;
  setDetections: (photoUri: string, boxes: BoundingBox[]) => void;
  clear: () => void;

  getLastPhoto: () => CameraCapturedPicture | null;
};

export const usePhotosStore = create<PhotosState>((set, get) => ({
  photos: [],
  detections: {},

  addPhoto: (photo) =>
    set((state) => ({
      photos: [...state.photos, photo],
    })),

  setDetections: (photoUri, boxes) =>
    set((state) => ({
      detections: {
        ...state.detections,
        [photoUri]: boxes,
      },
    })),

  clear: () => set({ photos: [], detections: {} }),

  getLastPhoto: () => {
    const photos = get().photos;
    return photos.length ? photos[photos.length - 1] : null;
  },
}));
