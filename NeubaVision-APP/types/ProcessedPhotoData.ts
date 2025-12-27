import { BoundingBox } from "./BoundingBox"

export type ProcessedPhotoData = {
  boundingBoxes: BoundingBox[],
  userCountCorrection: number,
  isAccepted: boolean
}