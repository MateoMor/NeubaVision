import { create } from "zustand";
import { loadTensorflowModel, TensorflowModel } from "react-native-fast-tflite";

type ModelState = {
  model: TensorflowModel | null;
  loading: boolean;
  error: string | null;
  inferenceState: "idle" | "preprocessing" | "inference" | "postprocessing";
  classNames: string[];
  loadModel: () => Promise<void>;
  setInferenceState: (state: "idle" | "preprocessing" | "inference" | "postprocessing") => void;
  setClassNames: (names: string[]) => void;
};

export const useModelStore = create<ModelState>((set, get) => ({
  model: null,
  loading: false,
  error: null,
  inferenceState: "idle",
  classNames: ["object"],

  setClassNames: (names: string[]) => set({ classNames: names }),

  setInferenceState: (state) => set({ inferenceState: state }),

  loadModel: async () => {
    try {
      set({ loading: true, error: null });

      const model = await loadTensorflowModel(
        require("../assets/model/best_float16.tflite")
      );

      set({ model, loading: false });
      console.log("Model loaded successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load model";
      set({
        error: errorMessage,
        loading: false,
        model: null,
      });
      throw error;
    }
  },


}));
