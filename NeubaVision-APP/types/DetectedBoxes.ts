import { BoundingBox } from "./BoundingBox"

export type DetectedBoxes = {
  boundingBoxes: BoundingBox[],
  userCountCorrection: number
}