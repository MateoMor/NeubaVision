import { create } from "zustand";
import { loadTensorflowModel, TensorflowModel } from "react-native-fast-tflite";

import { BoundingBox } from "@/types/BoundingBox";
import { usePhotosStore } from "./usePhotosStore";
import { preprocessImageForYOLO } from "@/utils/inference/imagePreprocessing";
import { postprocessYOLOOutput } from "@/utils/inference/yoloPostprocessing";

type ModelState = {
  model: TensorflowModel | null;
  loading: boolean;
  error: string | null;
  inferenceState: "idle" | "preprocessing" | "inference" | "postprocessing";
  classNames: string[];
  loadModel: () => Promise<void>;
  runInference: (imagePath: string) => Promise<BoundingBox[]>;
  setClassNames: (names: string[]) => void;
};

// Private variable to manage the sequential execution of inferences
let inferenceQueue = Promise.resolve() as Promise<any>;

export const useModelStore = create<ModelState>((set, get) => ({
  model: null,
  loading: false,
  error: null,
  inferenceState: "idle",
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
    // Append the new inference task to the existing queue
    const task = async () => {
      const { model, classNames } = get();
      const { updatePhotoStatus } = usePhotosStore.getState();

      if (!model) {
        throw new Error("Model not loaded. Call loadModel() first.");
      }

      try {
        set({ inferenceState: "preprocessing" });
        updatePhotoStatus(imagePath, "preprocessing");
        console.log(`Starting inference for: ${imagePath}`);

        let deltatime = new Date().getTime();
        // 1. Preprocessing
        const { tensor } = await preprocessImageForYOLO(imagePath, 640);
        deltatime = new Date().getTime() - deltatime;
        console.debug(`Preprocessing time: ${deltatime} ms`);


        set({ inferenceState: "inference" });
        updatePhotoStatus(imagePath, "inference");

        deltatime = new Date().getTime();
        // 2. Inference
        console.log("Running model inference...");
        const output = await model.run([tensor]);
        deltatime = new Date().getTime() - deltatime;
        console.debug(`Inference time: ${deltatime} ms`);

        set({ inferenceState: "postprocessing" });
        updatePhotoStatus(imagePath, "postprocessing");
        
        deltatime = new Date().getTime();
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
        deltatime = new Date().getTime() - deltatime;
        console.debug(`Postprocessing time: ${deltatime} ms`);

        console.debug(`Inference complete: ${detections.length} detections found`);
        set({ inferenceState: "idle" });
        // Status completion is usually handled by the caller, but we can do it here too 
        // to ensure consistency if the caller misses it.
        return detections;
      } catch (error) {
        console.error("Inference error:", error);
        set({ inferenceState: "idle" });
        updatePhotoStatus(imagePath, "error");
        throw error;
      }
    };

    // Chain the task to the queue and return the result of THIS specific task
    const resultPromise = inferenceQueue.then(task, task); 
    inferenceQueue = resultPromise.catch(() => {}); // Ensure queue continues even on error
    
    return resultPromise;
  },
}));
