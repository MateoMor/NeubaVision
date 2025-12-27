import { View, Text, Image, ScrollView, Dimensions } from "react-native";
import React from "react";

import { usePhotosStore } from "@/store/usePhotosStore";
import { BoundingBoxOverlay } from "@/components/tab_images/BoundingBoxOverlay";

export default function segmendImage() {
  const detections = usePhotosStore((state) => state.detections);
  const screenWidth = Dimensions.get("window").width;
  const imageSize = screenWidth - 40; // Padding de 20 a cada lado

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-5">
        <Text className="text-2xl font-bold mb-4">Detections</Text>
        {Object.entries(detections).map(([photoPath, boxes]) => (
          <View key={photoPath} className="mb-8">
            <Text className="font-semibold mb-2 text-gray-600">
              Found {boxes.boundingBoxes.length} object
              {boxes.boundingBoxes.length !== 1 ? "s" : ""}
            </Text>

            {/* Contenedor de imagen con bounding boxes */}
            <View
              style={{
                width: imageSize,
                height: imageSize,
                position: "relative",
              }}
            >
              <Image
                source={{ uri: photoPath }}
                style={{ width: imageSize, height: imageSize }}
                resizeMode="cover"
              />
              <BoundingBoxOverlay
                detections={boxes.boundingBoxes}
                imageWidth={imageSize}
                imageHeight={imageSize}
                originalWidth={640}
                originalHeight={640}
              />
            </View>
          </View>
        ))}

        {Object.keys(detections).length === 0 && (
          <View className="items-center justify-center py-20">
            <Text className="text-gray-400 text-center">
              No detections yet.{"\n"}Take a photo to start detecting objects.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
