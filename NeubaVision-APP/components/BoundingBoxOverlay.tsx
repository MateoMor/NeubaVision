import React from 'react';
import { Canvas, Rect, Text as SkiaText, useFont, RoundedRect } from '@shopify/react-native-skia';
import { BoundingBox } from '@/types/BoundingBox';

type Props = {
  detections: BoundingBox[];
  imageWidth: number;
  imageHeight: number;
  originalWidth?: number;  // Original image width from model (default 640)
  originalHeight?: number; // Original image height from model (default 640)
};

export function BoundingBoxOverlay({ 
  detections, 
  imageWidth, 
  imageHeight,
  originalWidth = 640,
  originalHeight = 640
}: Props) {

  // Colors for the boxes
  const colors = [
    '#00FF00', // Green
    '#FF0000', // Red
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
  ];

  // Calculate scale factors
  const scaleX = imageWidth / originalWidth;
  const scaleY = imageHeight / originalHeight;

  return (
    <Canvas style={{ width: imageWidth, height: imageHeight, position: 'absolute' }}>
      {detections.map((detection, index) => {
        // Scale coordinates from model space (640x640) to display space
        const x = detection.box.x * scaleX;
        const y = detection.box.y * scaleY;
        const width = detection.box.width * scaleX;
        const height = detection.box.height * scaleY;
        const color = colors[detection.classID % colors.length];

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
              strokeWidth={1}
            />
            
          </React.Fragment>
        );
      })}
    </Canvas>
  );
}
