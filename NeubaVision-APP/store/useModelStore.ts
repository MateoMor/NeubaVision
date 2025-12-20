import { create } from "zustand";
import { loadTensorflowModel } from "react-native-fast-tflite";
import type { TensorflowModel } from "react-native-fast-tflite";
import * as ImageManipulator from "expo-image-manipulator";

import * as FileSystem from "expo-file-system/legacy";
import { Buffer } from "buffer";
import { decode } from "jpeg-js";

import { BoundingBox } from "@/types/BoundingBox";


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
      // Formato TRANSPUESTO: [5, 8400] aplanado = [x0...x8399, y0...y8399, w0...w8399, h0...h8399, c0...c8399]
      const numPredictions = 8400;
      const imgSize = 640;
      const confidenceThreshold = 0.25;
      const iouThreshold = 0.45;

      const boxes: number[][] = [];
      const scores: number[] = [];
      const outputData = output[0] as Float32Array;

      // Extraer boxes y scores en formato (x1, y1, x2, y2)
      for (let i = 0; i < numPredictions; i++) {
        // Acceso transpuesto: cada característica está en bloques de 8400
        const x_center = Number(outputData[0 * numPredictions + i]);
        const y_center = Number(outputData[1 * numPredictions + i]);
        const w = Number(outputData[2 * numPredictions + i]);
        const h = Number(outputData[3 * numPredictions + i]);
        const confidence = Number(outputData[4 * numPredictions + i]);

        if (confidence > confidenceThreshold) {
          // Convertir de YOLO format (center_x, center_y, w, h) a (x1, y1, x2, y2)
          const x1 = (x_center - w / 2) * imgSize;
          const y1 = (y_center - h / 2) * imgSize;
          const x2 = (x_center + w / 2) * imgSize;
          const y2 = (y_center + h / 2) * imgSize;

          boxes.push([x1, y1, x2, y2]);
          scores.push(confidence);
        }
      }

      console.log(`Found ${boxes.length} raw detections`);

      // 8. Aplicar NMS optimizado
      const pickedIndices = applyOptimizedNMS(boxes, scores, iouThreshold);

      // Convertir a formato BoundingBox
      const filteredDetections: BoundingBox[] = pickedIndices.map((idx: number) => {
        const [x1, y1, x2, y2] = boxes[idx];
        return {
          box: {
            x: x1,
            y: y1,
            width: x2 - x1,
            height: y2 - y1,
          },
          confidence: scores[idx],
          classID: 0,
          className: classNames[0] || "objeto",
        };
      });

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

// Función optimizada para aplicar Non-Maximum Suppression
// Trabaja con formato (x1, y1, x2, y2) para mejor precisión
function applyOptimizedNMS(
  boxes: number[][], 
  scores: number[], 
  iouThreshold: number
): number[] {
  if (boxes.length === 0) return [];

  // Pre-calcular áreas de todas las boxes
  const areas = boxes.map(b => (b[2] - b[0]) * (b[3] - b[1]));
  
  // Crear array de índices ordenados por score (descendente)
  const order = scores
    .map((s, i) => ({ score: s, index: i }))
    .sort((a, b) => b.score - a.score)
    .map(item => item.index);

  const pick: number[] = [];

  while (order.length > 0) {
    const i = order[0];
    pick.push(i);
    
    const suppress: number[] = [];
    
    for (let j = 1; j < order.length; j++) {
      const idx = order[j];
      
      // Calcular intersección
      const xx1 = Math.max(boxes[i][0], boxes[idx][0]);
      const yy1 = Math.max(boxes[i][1], boxes[idx][1]);
      const xx2 = Math.min(boxes[i][2], boxes[idx][2]);
      const yy2 = Math.min(boxes[i][3], boxes[idx][3]);
      
      const w = Math.max(0, xx2 - xx1);
      const h = Math.max(0, yy2 - yy1);
      const inter = w * h;
      
      // Calcular IoU
      const iou = inter / (areas[i] + areas[idx] - inter);
      
      if (iou > iouThreshold) {
        suppress.push(idx);
      }
    }
    
    // Remover el primero y todos los suprimidos
    order.splice(0, 1);
    order.splice(0, order.length, ...order.filter(idx => !suppress.includes(idx)));
  }

  return pick;
}
