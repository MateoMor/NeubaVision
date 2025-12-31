import { useCallback } from 'react';
import { useModelStore } from '@/store/useModelStore';
import { usePhotosStore } from '@/store/usePhotosStore';
import { preprocessImageForYOLO } from '@/utils/inference/imagePreprocessing';
import { postprocessYOLOOutput } from '@/utils/inference/yoloPostprocessing';
import { BoundingBox } from '@/types/BoundingBox';
import { useAppSettingsStore } from '@/store/useAppSettingsStore';

// Private variable to manage the sequential execution of inferences
let inferenceQueue = Promise.resolve() as Promise<any>;

export const useYoloInference = () => {
  const { model, classNames, setInferenceState } = useModelStore();
  const { updatePhotoStatus } = usePhotosStore();
  const { confidenceThreshold, iouThreshold } = useAppSettingsStore();

  const runInference = useCallback(async (imagePath: string): Promise<BoundingBox[]> => {
    // Append the new inference task to the existing queue
    const task = async () => {
      if (!model) {
        throw new Error("Model not loaded. Call loadModel() first.");
      }

      try {
        setInferenceState("preprocessing");
        updatePhotoStatus(imagePath, "preprocessing");
        console.log(`Starting inference for: ${imagePath}`);

        let deltatime = new Date().getTime();
        // 1. Preprocessing
        const { tensor } = await preprocessImageForYOLO(imagePath, 640);
        deltatime = new Date().getTime() - deltatime;
        console.debug(`Preprocessing time: ${deltatime} ms`);


        setInferenceState("inference");
        updatePhotoStatus(imagePath, "inference");

        deltatime = new Date().getTime();
        // 2. Inference
        console.log("Running model inference...");
        const output = await model.run([tensor]);
        deltatime = new Date().getTime() - deltatime;
        console.debug(`Inference time: ${deltatime} ms`);

        setInferenceState("postprocessing");
        updatePhotoStatus(imagePath, "postprocessing");
        
        deltatime = new Date().getTime();
        // 3. Postprocessing
        const detections = postprocessYOLOOutput(
          output[0] as Float32Array,
          classNames,
          {
            numPredictions: 8400,
            imgSize: 640,
            confidenceThreshold,
            iouThreshold,
          }
        );
        deltatime = new Date().getTime() - deltatime;
        console.debug(`Postprocessing time: ${deltatime} ms`);

        console.debug(`Inference complete: ${detections.length} detections found`);
        setInferenceState("idle");
        // Status completion is usually handled by the caller, but we can do it here too 
        // to ensure consistency if the caller misses it.
        return detections;
      } catch (error) {
        console.error("Inference error:", error);
        setInferenceState("idle");
        updatePhotoStatus(imagePath, "error");
        throw error;
      }
    };

    // Chain the task to the queue and return the result of THIS specific task
    const resultPromise = inferenceQueue.then(task, task); 
    inferenceQueue = resultPromise.catch(() => {}); // Ensure queue continues even on error
    
    return resultPromise;
  }, [model, classNames, setInferenceState, updatePhotoStatus]);

  return { runInference };
};
