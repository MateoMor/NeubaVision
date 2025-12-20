import { BoundingBox } from "@/types/BoundingBox";
import { applyNMS } from "./nms";

export interface YOLOOutput {
  boxes: number[][];
  scores: number[];
}

/**
 * Extracts boxes and scores from transposed YOLO output
 * Format: [5, 8400] flattened = [x0...x8399, y0...y8399, w0...w8399, h0...h8399, c0...c8399]
 */
export function extractDetectionsFromTransposedOutput(
  outputData: Float32Array,
  numPredictions: number,
  imgSize: number,
  confidenceThreshold: number
): YOLOOutput {
  const boxes: number[][] = [];
  const scores: number[] = [];

  for (let i = 0; i < numPredictions; i++) {
    // Transposed access: each feature is in blocks of numPredictions
    const x_center = Number(outputData[0 * numPredictions + i]);
    const y_center = Number(outputData[1 * numPredictions + i]);
    const w = Number(outputData[2 * numPredictions + i]);
    const h = Number(outputData[3 * numPredictions + i]);
    const confidence = Number(outputData[4 * numPredictions + i]);

    if (confidence > confidenceThreshold) {
      // Convert from YOLO format (center_x, center_y, w, h) to (x1, y1, x2, y2)
      const x1 = (x_center - w / 2) * imgSize;
      const y1 = (y_center - h / 2) * imgSize;
      const x2 = (x_center + w / 2) * imgSize;
      const y2 = (y_center + h / 2) * imgSize;

      boxes.push([x1, y1, x2, y2]);
      scores.push(confidence);
    }
  }

  return { boxes, scores };
}

/**
 * Converts boxes in format (x1, y1, x2, y2) to BoundingBox
 */
export function convertToBoundingBoxes(
  boxes: number[][],
  scores: number[],
  indices: number[],
  className: string
): BoundingBox[] {
  return indices.map((idx) => {
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
      className: className,
    };
  });
}

/**
 * Postprocesses complete YOLO output: extracts detections, applies NMS and converts format
 */
export function postprocessYOLOOutput(
  outputData: Float32Array,
  classNames: string[],
  config: {
    numPredictions?: number;
    imgSize?: number;
    confidenceThreshold?: number;
    iouThreshold?: number;
  } = {}
): BoundingBox[] {
  const {
    numPredictions = 8400,
    imgSize = 640,
    confidenceThreshold = 0.25,
    iouThreshold = 0.45,
  } = config;

  console.log("Postprocessing YOLO output...");

  // 1. Extract raw detections
  const { boxes, scores } = extractDetectionsFromTransposedOutput(
    outputData,
    numPredictions,
    imgSize,
    confidenceThreshold
  );

  console.log(`Found ${boxes.length} raw detections`);

  // 2. Apply NMS
  const pickedIndices = applyNMS(boxes, scores, iouThreshold);

  console.log(`After NMS: ${pickedIndices.length} detections`);

  // 3. Convert to BoundingBox format
  const detections = convertToBoundingBoxes(
    boxes,
    scores,
    pickedIndices,
    classNames[0] || "object"
  );

  return detections;
}
