import { useState, useCallback } from "react";
import { Line } from "@/types/Line";
import { createLine } from "@/components/CameraDrawOverlay";

export const useLineDrawing = (
  width: number = 0,
  height: number = 0
) => {
  // State to store lines to draw
  const [lines, setLines] = useState<Line[]>([]);

  // Function to add a line
  const addLine = useCallback((line: Line) => {
    setLines((prev) => [...prev, line]);
  }, []);

  // Function to clear all lines
  const clearLines = useCallback(() => {
    setLines([]);
  }, []);

  // Function to draw a line (helper simplified)
  const drawLine = useCallback(
    (
      startX: number,
      startY: number,
      endX: number,
      endY: number,
      color: string = "#FF0000",
      strokeWidth: number = 3
    ) => {
      addLine(createLine(startX, startY, endX, endY, color, strokeWidth));
    },
    [addLine]
  );

  // Example: add demo lines
  const addDemoLines = useCallback(() => {
    if (width === 0 || height === 0) return;

    // Cross in the center
    const centerX = width / 2;
    const centerY = height / 2;
    const size = 50;

    drawLine(centerX - size, centerY, centerX + size, centerY, "#00FF00", 4);
    drawLine(centerX, centerY - size, centerX, centerY + size, "#00FF00", 4);

    // Rectangle
    drawLine(50, 100, width - 50, 100, "#FF0000", 3);
    drawLine(width - 50, 100, width - 50, height - 50, "#FF0000", 3);
    drawLine(width - 50, height - 50, 50, height - 50, "#FF0000", 3);
    drawLine(50, height - 50, 50, 100, "#FF0000", 3);
  }, [width, height, drawLine]);

  return {
    lines,
    addLine,
    clearLines,
    drawLine,
    addDemoLines,
  };
};
