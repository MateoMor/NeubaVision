import { View, Text, Image, ScrollView, Dimensions } from "react-native";
import React from "react";

import { usePhotosStore } from "@/store/usePhotosStore";
import { BoundingBoxOverlay } from "@/components/BoundingBoxOverlay";

export default function segmendImage() {
  const detections = usePhotosStore((state) => state.detections);
  const screenWidth = Dimensions.get('window').width;
  const imageSize = screenWidth - 40; // Padding de 20 a cada lado

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-5">
        <Text className="text-2xl font-bold mb-4">Detections</Text>
        {Object.entries(detections).map(([photoUri, boxes]) => (
          <View key={photoUri} className="mb-8">
            <Text className="font-semibold mb-2 text-gray-600">
              Found {boxes.length} object{boxes.length !== 1 ? 's' : ''}
            </Text>
            
            {/* Contenedor de imagen con bounding boxes */}
            <View style={{ width: imageSize, height: imageSize, position: 'relative' }}>
              <Image 
                source={{ uri: photoUri }} 
                style={{ width: imageSize, height: imageSize }}
                resizeMode="cover"
              />
              <BoundingBoxOverlay
                detections={boxes}
                imageWidth={imageSize}
                imageHeight={imageSize}
              />
            </View>

            {/* Lista de detecciones */}
            <View className="mt-4">
              {boxes.map((box, index) => (
                <View key={index} className="mb-2 p-3 bg-gray-100 rounded-lg">
                  <Text className="font-bold text-green-600">
                    {box.className || 'Object'} - {(box.confidence * 100).toFixed(1)}%
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    Position: ({box.box.x.toFixed(0)}, {box.box.y.toFixed(0)}) | 
                    Size: {box.box.width.toFixed(0)}×{box.box.height.toFixed(0)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
        
        {Object.keys(detections).length === 0 && (
          <View className="items-center justify-center py-20">
            <Text className="text-gray-400 text-center">
              No detections yet.{'\n'}Take a photo to start detecting objects.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
