export type BoundingBox = {
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  classID: number;
  className?: string;
};