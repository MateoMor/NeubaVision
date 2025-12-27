import React from "react";
import { StyleSheet } from "react-native";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import { Line } from "@/types/Line";

// Function to create a line
export const createLine = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  color: string = "#FF0000",
  strokeWidth: number = 3
): Line => ({
  startX,
  startY,
  endX,
  endY,
  color,
  strokeWidth,
});

interface CameraOverlayProps {
  lines: Line[];
}

export const CameraOverlay = ({ lines }: CameraOverlayProps) => {
  return (
    <Canvas style={StyleSheet.absoluteFill}>
      {lines.map((line, index) => {
        const path = Skia.Path.Make();
        path.moveTo(line.startX, line.startY);
        path.lineTo(line.endX, line.endY);

        return (
          <Path
            key={index}
            path={path}
            color={line.color}
            style="stroke"
            strokeWidth={line.strokeWidth}
            strokeCap="round"
          />
        );
      })}
    </Canvas>
  );
};
