import React from 'react';
import { Canvas, Rect, Text as SkiaText, useFont, RoundedRect } from '@shopify/react-native-skia';
import { BoundingBox } from '@/types/BoundingBox';

type Props = {
  detections: BoundingBox[];
  imageWidth: number;
  imageHeight: number;
};

export function BoundingBoxOverlay({ detections, imageWidth, imageHeight }: Props) {

  // Colors for the boxes
  const colors = [
    '#00FF00', // Green
    '#FF0000', // Red
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
  ];

  return (
    <Canvas style={{ width: imageWidth, height: imageHeight, position: 'absolute' }}>
      {detections.map((detection, index) => {
        const { x, y, width, height } = detection.box;
        const color = colors[detection.classID % colors.length];
        const label = `${detection.className} ${(detection.confidence * 100).toFixed(0)}%`;

        return (
          <React.Fragment key={index}>
            {/* Bounding box */}
            <Rect
              x={x}
              y={y}
              width={width}
              height={height}
              color={color}
              style="stroke"
              strokeWidth={3}
            />
            
            {/* Label background */}
            <RoundedRect
              x={x}
              y={Math.max(0, y - 28)}
              width={Math.min(label.length * 8 + 10, imageWidth - x)}
              height={26}
              r={4}
              color={color}
              opacity={0.9}
            />
          </React.Fragment>
        );
      })}
    </Canvas>
  );
}
