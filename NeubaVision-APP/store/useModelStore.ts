import { create } from "zustand";
import { loadTensorflowModel } from "react-native-fast-tflite";
import type { TensorflowModel } from "react-native-fast-tflite";
import * as ImageManipulator from "expo-image-manipulator";

import * as FileSystem from "expo-file-system/legacy";
import jpeg from "jpeg-js";
import { Buffer } from "buffer";

// Tipo para las detecciones de YOLO
export type Detection = {
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  class: number;
  className?: string;
};

type ModelState = {
  model: TensorflowModel | null;
  loading: boolean;
  error: string | null;
  classNames: string[];
  loadModel: () => Promise<void>;
  runInference: (imageUri: string) => Promise<Detection[]>;
  setClassNames: (names: string[]) => void;
};

export const useModelStore = create<ModelState>((set, get) => ({
  model: null,
  loading: false,
  error: null,
  classNames: [], // Agregar nombres de clases si los tienes

  setClassNames: (names: string[]) => set({ classNames: names }),

  loadModel: async () => {
    try {
      set({ loading: true, error: null });

      const model = await loadTensorflowModel(
        require("../assets/model/best_float16.tflite")
      );

      set({ model, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load model",
        loading: false,
        model: null,
      });
      throw error;
    }
  },

  runInference: async (imageUri) => {
    const { model, classNames } = get();

    if (!model) {
      throw new Error("Model not loaded. Call loadModel() first.");
    }

    try {
      // Get image
      const resized = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 640, height: 640 } }],
        { format: ImageManipulator.SaveFormat.JPEG }
      );

      /* const imgBase64 = await FileSystem.readAsStringAsync(resized.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const rawImageData = jpeg.decode(Buffer.from(imgBase64, "base64"), {
        useTArray: true,
      });

      // Prepare for model input
      const width = 640;
      const height = 640;
      const size = width * height;

      // Tensor YOLO
      const input = new Float32Array(1 * 3 * size);

      let r = 0;
      let g = size;
      let b = size * 2;

      for (let i = 0; i < size; i++) {
        input[r++] = rawImageData.data[i * 4] / 255.0; // R
        input[g++] = rawImageData.data[i * 4 + 1] / 255.0; // G
        input[b++] = rawImageData.data[i * 4 + 2] / 255.0; // B
      }

      console.log("Input:", input); */

      /* // Execute inference
      const output = await model.run([input]);

      // Procesar salida de YOLOv11
      // YOLOv11 típicamente retorna: [1, 84, 8400] o similar
      // donde 84 = 4 (bbox) + 80 (clases) para COCO dataset
      // Ajusta según tu modelo específico

      const detections: Detection[] = [];
      const confidenceThreshold = 0.25; // Umbral de confianza
      const iouThreshold = 0.45; // Umbral para NMS

      // Asumiendo que output es un array de arrays
      // Formato: [x_center, y_center, width, height, conf_class1, conf_class2, ...]
      if (output && output.length > 0) {
        const predictions = output[0]; // Primera dimensión

        for (let i = 0; i < predictions.length; i++) {
          const prediction = predictions[i];

          // Extraer bbox (primeros 4 valores)
          const x_center = prediction[0];
          const y_center = prediction[1];
          const width = prediction[2];
          const height = prediction[3];

          // Encontrar la clase con mayor confianza
          let maxConf = 0;
          let maxClass = 0;

          for (let j = 4; j < prediction.length; j++) {
            if (prediction[j] > maxConf) {
              maxConf = prediction[j];
              maxClass = j - 4;
            }
          }

          // Filtrar por umbral de confianza
          if (maxConf > confidenceThreshold) {
            detections.push({
              box: {
                x: x_center - width / 2,
                y: y_center - height / 2,
                width,
                height,
              },
              confidence: maxConf,
              class: maxClass,
              className: classNames[maxClass] || `Class ${maxClass}`,
            });
          }
        }
      }

      // Aplicar Non-Maximum Suppression (NMS)
      const filteredDetections = applyNMS(detections, iouThreshold);

      return filteredDetections; */
      return [];
    } catch (error) {
      console.error("Inference error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Inference failed"
      );
    }
  },
}));

// Función auxiliar para calcular IoU (Intersection over Union)
function calculateIoU(box1: Detection["box"], box2: Detection["box"]): number {
  const x1 = Math.max(box1.x, box2.x);
  const y1 = Math.max(box1.y, box2.y);
  const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
  const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);

  const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const area1 = box1.width * box1.height;
  const area2 = box2.width * box2.height;
  const union = area1 + area2 - intersection;

  return union > 0 ? intersection / union : 0;
}

// Función para aplicar Non-Maximum Suppression
function applyNMS(detections: Detection[], iouThreshold: number): Detection[] {
  // Ordenar por confianza (mayor a menor)
  const sorted = [...detections].sort((a, b) => b.confidence - a.confidence);
  const keep: Detection[] = [];

  while (sorted.length > 0) {
    const current = sorted.shift()!;
    keep.push(current);

    // Eliminar detecciones con IoU alto
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (sorted[i].class === current.class) {
        const iou = calculateIoU(current.box, sorted[i].box);
        if (iou > iouThreshold) {
          sorted.splice(i, 1);
        }
      }
    }
  }

  return keep;
}
