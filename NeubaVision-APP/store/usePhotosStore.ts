import { create } from "zustand";
import { PhotoFile } from "react-native-vision-camera";

import { BoundingBox } from "@/types/BoundingBox";
import { ProcessingStatus } from "@/types/ProcessingStatus";


export interface GalleryPhoto extends PhotoFile {
  status: ProcessingStatus;
  createdAt: number;
}

type PhotosState = {
  photos: GalleryPhoto[];
  detections: Record<string, BoundingBox[]>;

  addPhoto: (photo: PhotoFile) => void;
  updatePhotoStatus: (photoPath: string, status: ProcessingStatus) => void;
  setDetections: (photoPath: string, boxes: BoundingBox[]) => void;
  clear: () => void;

  getLastPhoto: () => GalleryPhoto | null;
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
        { 
          ...photo, 
          path: getImageUri(photo.path),
          status: 'pending',
          createdAt: Date.now()
        },
      ],
    })),

  updatePhotoStatus: (photoPath: string, status: ProcessingStatus) =>
    set((state) => ({
      photos: state.photos.map((p) =>
        p.path === photoPath || p.path === getImageUri(photoPath)
          ? { ...p, status }
          : p
      ),
    })),

  setDetections: (photoPath: string, boxes: BoundingBox[]) =>
    set((state) => ({
      detections: {
        ...state.detections,
        [getImageUri(photoPath)]: boxes,
      },
    })),

  clear: () => set({ photos: [], detections: {} }),

  getLastPhoto: () => {
    const photos = get().photos;
    return photos.length ? photos[photos.length - 1] : null;
  },
}));
