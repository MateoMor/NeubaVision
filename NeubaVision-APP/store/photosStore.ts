import {create} from "zustand";
import { CameraCapturedPicture } from "expo-camera";

export const usePhotosStore = create<{
  photos: CameraCapturedPicture[];
  addPhoto: (photo: CameraCapturedPicture) => void;
  clearPhotos: () => void;
  lastPhoto: () => CameraCapturedPicture | null;
}>((set, get) => ({
  photos: [],
  addPhoto: (photo) =>
    set((state) => ({ photos: [...state.photos, photo] })),
  clearPhotos: () => set({ photos: [] }),
  lastPhoto: () => {
    const photos = get().photos;
    return photos.length ? photos[photos.length - 1] : null;
  },
}));