import { create } from "zustand";
import { loadTensorflowModel } from "react-native-fast-tflite";
import type { TensorflowModel } from "react-native-fast-tflite";
import * as ImageManipulator from "expo-image-manipulator";

import * as FileSystem from "expo-file-system/legacy";
import jpeg from "jpeg-js";
import { Buffer } from "buffer";
import { decode } from "jpeg-js";

import { BoundingBox } from "@/types/BoundingBox";

// Tipo para las detecciones de YOLO


type ModelState = {
  model: TensorflowModel | null;
  loading: boolean;
  error: string | null;
  classNames: string[];
  loadModel: () => Promise<void>;
  runInference: (imageUri: string) => Promise<BoundingBox[]>;
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
    // 1. Redimensionar imagen a 640x640
    const resized = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 640, height: 640 } }],
      { format: ImageManipulator.SaveFormat.JPEG }
    );

    // 2. Leer imagen como base64
    const base64 = await FileSystem.readAsStringAsync(resized.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 3. Convertir base64 a buffer
    const imageBuffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

    // 4. Decodificar JPEG
    const { data, width, height } = decode(imageBuffer, {
      useTArray: true,
    });

    // 5. Preparar tensor para YOLOv11 [1, 3, 640, 640]
    const inputSize = width * height;
    const input = new Float32Array(3 * inputSize);

    // Convertir RGBA a RGB normalizado [0-1] en formato CHW
    for (let i = 0; i < inputSize; i++) {
      const pixelIndex = i * 4; // RGBA
      input[i] = data[pixelIndex] / 255.0; // R channel
      input[inputSize + i] = data[pixelIndex + 1] / 255.0; // G channel
      input[2 * inputSize + i] = data[pixelIndex + 2] / 255.0; // B channel
    }

    console.log("Input tensor shape: [1, 3, 640, 640]");
    console.log("Input tensor size:", input.length);

    // 6. Ejecutar inferencia - ✅ Pasar como array
    const output = await model.run([input]);

    // ✅ Agregar estos logs para inspeccionar
console.log("=== MODEL OUTPUT DEBUG ===");
console.log("Number of outputs:", output.length);
console.log("Output[0] length:", output[0].length);
console.log("Output[0] type:", output[0].constructor.name);

// Si es formato transpuesto, necesitas reshape
const outputLength = output[0].length;
console.log("Possible shapes:");
console.log("- If 705600:", "8400 predictions × 84 values");
console.log("- If format is [N, 4+classes]:", outputLength);

// Detectar el número de clases
const possibleNumClasses = [1]; // Ajusta según tu modelo
for (const nc of possibleNumClasses) {
  const numPredictions = outputLength / (4 + nc);
  if (Number.isInteger(numPredictions)) {
    console.log(`Possible: ${numPredictions} predictions with ${nc} classes`);
  }
}
// 7. Procesar detecciones
      // Formato: [8400 predicciones × 5 valores]
      // Cada predicción: [x_center, y_center, width, height, class_confidence]
      const numPredictions = 8400;
      const numValues = 5; // 4 bbox + 1 clase
      const confidenceThreshold = 0.25;
      const iouThreshold = 0.45;

      const detections: BoundingBox[] = [];
      const outputData = output[0];

      for (let i = 0; i < numPredictions; i++) {
        const offset = i * numValues;

        // ✅ Convertir explícitamente a number
        const x_center = Number(outputData[offset + 0]);
        const y_center = Number(outputData[offset + 1]);
        const w = Number(outputData[offset + 2]);
        const h = Number(outputData[offset + 3]);
        const confidence = Number(outputData[offset + 4]);

        // Filtrar por umbral de confianza
        if (confidence > confidenceThreshold) {
          detections.push({
            box: {
              x: (x_center - w / 2) * 640, // Convertir a coordenadas absolutas
              y: (y_center - h / 2) * 640,
              width: w * 640,
              height: h * 640,
            },
            confidence: confidence,
            classID: 0, // only one class
            className: classNames[0] || "objeto",
          });
        }
      }

      console.log(`Found ${detections.length} raw detections`);

      // 8. Aplicar NMS
      const filteredDetections = applyNMS(detections, iouThreshold);

      console.log(`After NMS: ${filteredDetections.length} detections`);

      return filteredDetections;
    } catch (error) {
      console.error("Inference error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Inference failed"
      );
    }
  },
}));

// Función auxiliar para calcular IoU (Intersection over Union)
function calculateIoU(box1: BoundingBox["box"], box2: BoundingBox["box"]): number {
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
function applyNMS(detections: BoundingBox[], iouThreshold: number): BoundingBox[] {
  // Ordenar por confianza (mayor a menor)
  const sorted = [...detections].sort((a, b) => b.confidence - a.confidence);
  const keep: BoundingBox[] = [];

  while (sorted.length > 0) {
    const current = sorted.shift()!;
    keep.push(current);

    // Eliminar detecciones con IoU alto
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (sorted[i].classID === current.classID) {
        const iou = calculateIoU(current.box, sorted[i].box);
        if (iou > iouThreshold) {
          sorted.splice(i, 1);
        }
      }
    }
  }

  return keep;
}
