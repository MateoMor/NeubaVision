/**
 * Calculates the area of a bounding box in format (x1, y1, x2, y2)
 */
export function calculateBoxArea(box: number[]): number {
  "worklet";
  return (box[2] - box[0]) * (box[3] - box[1]);
}

/**
 * Calculates the intersection between two bounding boxes
 */
export function calculateIntersection(box1: number[], box2: number[]): number {
  "worklet";
  const xx1 = Math.max(box1[0], box2[0]);
  const yy1 = Math.max(box1[1], box2[1]);
  const xx2 = Math.min(box1[2], box2[2]);
  const yy2 = Math.min(box1[3], box2[3]);

  const w = Math.max(0, xx2 - xx1);
  const h = Math.max(0, yy2 - yy1);

  return w * h;
}

/**
 * Calculates Intersection over Union (IoU) between two bounding boxes
 */
export function calculateIoU(
  box1: number[],
  box2: number[],
  area1: number,
  area2: number
): number {
  "worklet";
  const inter = calculateIntersection(box1, box2);
  const union = area1 + area2 - inter;
  return union > 0 ? inter / union : 0;
}

/**
 * Applies optimized Non-Maximum Suppression
 * @param boxes - Array of boxes in format (x1, y1, x2, y2)
 * @param scores - Array of confidence scores
 * @param iouThreshold - IoU threshold to suppress boxes
 * @returns Indices of boxes that survived NMS
 */
export function applyNMS(
  boxes: number[][],
  scores: number[],
  iouThreshold: number
): number[] {
  "worklet";
  if (boxes.length === 0) return [];

  // Pre-calculate areas of all boxes
  const areas = boxes.map(calculateBoxArea);

  // Create array of indices sorted by score (descending)
  const order = scores
    .map((s, i) => ({ score: s, index: i }))
    .sort((a, b) => b.score - a.score)
    .map((item) => item.index);

  const pick: number[] = [];

  while (order.length > 0) {
    const i = order[0];
    pick.push(i);

    const suppress: number[] = [];

    for (let j = 1; j < order.length; j++) {
      const idx = order[j];

      // Calculate IoU
      const iou = calculateIoU(boxes[i], boxes[idx], areas[i], areas[idx]);

      if (iou > iouThreshold) {
        suppress.push(idx);
      }
    }

    // Remove first and all suppressed
    order.splice(0, 1);
    order.splice(
      0,
      order.length,
      ...order.filter((idx) => !suppress.includes(idx))
    );
  }

  return pick;
}
