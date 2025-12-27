import { create } from "zustand";
import { PhotoFile } from "react-native-vision-camera";

import { ProcessingStatus } from "@/types/ProcessingStatus";
import { ProcessedPhotoData } from "@/types/ProcessedPhotoData";

export interface GalleryPhoto extends PhotoFile {
  status: ProcessingStatus;
  createdAt: number;
}

type PhotosState = {
  photos: GalleryPhoto[];
  detections: Record<string, ProcessedPhotoData>;

  addPhoto: (photo: PhotoFile) => void;
  updatePhotoStatus: (photoPath: string, status: ProcessingStatus) => void;
  setDetections: (photoPath: string, detections: ProcessedPhotoData) => void;
  clear: () => void;
  deletePhoto: (photoPath: string) => void;
  updateUserCorrection: (photoPath: string, delta: number) => void;
  toggleAccepted: (photoPath: string) => void;

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

  setDetections: (photoPath: string, detections: ProcessedPhotoData) =>
    set((state) => ({
      detections: {
        ...state.detections,
        [getImageUri(photoPath)]: detections,
      },
    })),

  clear: () => set({ photos: [], detections: {} }),
  deletePhoto: (photoPath: string) =>
    set((state) => {
      const newDetections = { ...state.detections };
      delete newDetections[photoPath];
      return {
        photos: state.photos.filter((p) => p.path !== photoPath),
        detections: newDetections,
      };
    }),

  updateUserCorrection: (photoPath: string, delta: number) =>
    set((state) => {
      const current = state.detections[photoPath];
      if (!current) return state;

      return {
        detections: {
          ...state.detections,
          [photoPath]: {
            ...current,
            userCountCorrection: current.userCountCorrection + delta,
          },
        },
      };
    }),

  toggleAccepted: (photoPath: string) =>
    set((state) => {
      const current = state.detections[photoPath];
      if (!current) return state;

      return {
        detections: {
          ...state.detections,
          [photoPath]: {
            ...current,
            isAccepted: !current.isAccepted,
          },
        },
      };
    }),

  getLastPhoto: () => {
    const photos = get().photos;
    return photos.length ? photos[photos.length - 1] : null;
  },
}));
