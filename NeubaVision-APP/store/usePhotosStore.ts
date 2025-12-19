import {create} from "zustand";
import { CameraCapturedPicture } from "expo-camera";

type PhotosState = {
  photos: CameraCapturedPicture[];
  addPhoto: (photo: CameraCapturedPicture) => void;
  clearPhotos: () => void;
  getLastPhoto: () => CameraCapturedPicture | null;
};

export const usePhotosStore = create<PhotosState>((set, get) => ({
  photos: [],
  addPhoto: (photo) =>
    set((state) => ({ photos: [...state.photos, photo] })),
  clearPhotos: () => set({ photos: [] }),
  getLastPhoto: () => {
    const photos = get().photos;
    return photos.length ? photos[photos.length - 1] : null;
  },
}));