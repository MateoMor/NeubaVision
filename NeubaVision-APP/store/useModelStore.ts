import { create } from "zustand";
import { useTensorflowModel } from "react-native-fast-tflite";

type ModelState = {
  model: any | null;
  loading: boolean;
  loadModel: () => Promise<void>;
};

export const useModelStore = create<ModelState>((set) => ({
  model: null,
  loading: false,

  loadModel: async () => {
    set({ loading: true });

    const model = useTensorflowModel(require('assets/model/best_float16.tflite'));

    set({ model, loading: false });
  },
}));
