import { useState, useCallback, useMemo } from "react";
import { Line } from "@/types/Line";
import { MainSquareGrid } from "@/types/MainSquareGrid";
import { createLine } from "@/components/CameraOverlay";

export type CropBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
} | null;

export const useLineDrawing = (
  width: number = 0,
  height: number = 0
) => {
  // State to store lines to draw
  const [lines, setLines] = useState<Line[]>([]);
  // State to store crop bounds for the Neubauer grid
  const [cropBounds, setCropBounds] = useState<CropBounds>(null);

  // Function to add a line
  const addLine = useCallback((line: Line) => {
    setLines((prev) => [...prev, line]);
  }, []);

  // Function to clear all lines and crop bounds
  const clearLines = useCallback(() => {
    setLines([]);
    setCropBounds(null);
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

  /**
   * Draws a Neubauer chamber grid on the screen and calculates the main square coordinates.
   * 
   * This function creates a square grid centered on the screen, representing the
   * counting area of a Neubauer chamber. It draws both inner grid lines and an outer border,
   * and updates the `cropBounds` state for subsequent image cropping/processing.
   * 
   * @param gridCols - The number of columns/rows in the grid. Defaults to 4.
   * @param outerThickness - The line thickness for the outer border of the chamber (default: 4).
   * @param innerThickness - The line thickness for the internal grid lines (default: 2).
   * @param color - The hex color string used for the lines (default: "#00FF00").
   * @param sizeFactor - A multiplier (0-1) that determines the size of the chamber relative to the screen (default: 0.85).
   * 
   * @returns An object containing the coordinates (x, y) and dimensions (width, height) of the main square grid.
   */
  const addNeubauerChamberLines = useCallback(
    (
      gridCols?: number | any,
      outerThickness: number = 4,
      innerThickness: number = 2,
      color: string = "#00FF00",
      sizeFactor: number = 0.85
    ): MainSquareGrid => {
      if (width === 0 || height === 0) return {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      };

      const safeGridCols = typeof gridCols === "number" ? gridCols : 4;

      const size = Math.min(width, height) * sizeFactor; // Square size
      const halfSize = size / 2;
      const centerX = width / 2;
      const centerY = height / 2;

      const topLeftX = centerX - halfSize;
      const topLeftY = centerY - halfSize;
      const bottomRightX = centerX + halfSize;
      const bottomRightY = centerY + halfSize;

      const step = size / safeGridCols;
      const innerColor = `${color}AA`; // Add transparency
      const outerColor = color;

      // Draw inner vertical lines
      for (let i = 1; i < safeGridCols; i++) {
        const x = topLeftX + step * i;
        drawLine(x, topLeftY, x, bottomRightY, innerColor, innerThickness);
      }

      // Draw inner horizontal lines
      for (let i = 1; i < safeGridCols; i++) {
        const y = topLeftY + step * i;
        drawLine(topLeftX, y, bottomRightX, y, innerColor, innerThickness);
      }

      // Draw outer box
      // Top
      drawLine(topLeftX, topLeftY, bottomRightX, topLeftY, outerColor, outerThickness);
      // Bottom
      drawLine(topLeftX, bottomRightY, bottomRightX, bottomRightY, outerColor, outerThickness);
      // Left
      drawLine(topLeftX, topLeftY, topLeftX, bottomRightY, outerColor, outerThickness);
      // Right
      drawLine(bottomRightX, topLeftY, bottomRightX, bottomRightY, outerColor, outerThickness);

      // Set crop bounds for photo cropping
      setCropBounds({
        x: topLeftX,
        y: topLeftY,
        width: size,
        height: size,
      });

      return {
        x: topLeftX,
        y: topLeftY,
        width: size,
        height: size,
      };
    },
    [width, height, drawLine]
  );

  return {
    lines,
    cropBounds,
    addLine,
    clearLines,
    drawLine,
    addNeubauerChamberLines,
  };
};
