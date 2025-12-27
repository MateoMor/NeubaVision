import React, { useState } from "react";
import {
  FlatList,
  View,
  LayoutChangeEvent,
  Modal,
  Pressable,
  Text,
  useWindowDimensions,
} from "react-native";
import { usePhotosStore } from "@/store/usePhotosStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImageWithBoundingBoxes } from "@/components/tab_images/ImageWithBoundingBoxes";
import { Ionicons } from "@expo/vector-icons";
import { ImageOptionsModal } from "@/components/tab_images/ImageOptionsModal";

export default function ImagesScreen() {
  const { detections } = usePhotosStore();
  const [itemSize, setItemSize] = useState(0);
  const [selectedImage, setSelectedImage] = useState<[string, any] | null>(null);

  const GAP = 4;
  const COLUMNS = 3;

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    const totalGaps = (COLUMNS - 1) * GAP;
    const calculatedSize = (width - totalGaps) / COLUMNS;
    setItemSize(calculatedSize);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        onLayout={handleLayout}
        data={Object.entries(detections)}
        numColumns={COLUMNS}
        keyExtractor={(item) => item[0]}
        columnWrapperStyle={itemSize > 0 ? { gap: GAP, marginBottom: GAP } : undefined}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setSelectedImage(item)}
            style={{ width: itemSize, height: itemSize }}
            className="rounded-xl overflow-hidden bg-zinc-100"
          >
            {itemSize > 0 && (
              <ImageWithBoundingBoxes
                photoPath={item[0]}
                boxes={item[1].boundingBoxes}
                imageSize={itemSize}
              />
            )}
          </Pressable>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <ImageOptionsModal
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
      />
    </SafeAreaView>
  );
}
