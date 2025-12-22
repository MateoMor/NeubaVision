import { create } from "zustand";
import { loadTensorflowModel, TensorflowModel } from "react-native-fast-tflite";

import { BoundingBox } from "@/types/BoundingBox";
import { preprocessImageForYOLO } from "@/utils/inference/imagePreprocessing";
import { postprocessYOLOOutput } from "@/utils/inference/yoloPostprocessing";

type ModelState = {
  model: TensorflowModel | null;
  loading: boolean;
  error: string | null;
  classNames: string[];
  loadModel: () => Promise<void>;
  runInference: (imagePath: string) => Promise<BoundingBox[]>;
  setClassNames: (names: string[]) => void;
};

export const useModelStore = create<ModelState>((set, get) => ({
  model: null,
  loading: false,
  error: null,
  classNames: ["object"],

  setClassNames: (names: string[]) => set({ classNames: names }),

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

  runInference: async (imagePath: string) => {
    const { model, classNames } = get();

    if (!model) {
      throw new Error("Model not loaded. Call loadModel() first.");
    }

    try {
      console.log("Starting inference pipeline...");

      // 1. Preprocessing
      const { tensor } = await preprocessImageForYOLO(imagePath, 640);

      // 2. Inference
      console.log("Running model inference...");
      const output = await model.run([tensor]);

      // 3. Postprocessing
      const detections = postprocessYOLOOutput(
        output[0] as Float32Array,
        classNames,
        {
          numPredictions: 8400,
          imgSize: 640,
          confidenceThreshold: 0.25,
          iouThreshold: 0.45,
        }
      );

      console.log(`Inference complete: ${detections.length} detections found`);

      return detections;
    } catch (error) {
      console.error("Inference error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Inference failed"
      );
    }
  },
}));
