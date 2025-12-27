import React, { useState } from "react";
import { FlatList, View, LayoutChangeEvent } from "react-native";
import { usePhotosStore } from "@/store/usePhotosStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImageWithBoundingBoxes } from "@/components/ImageWithBoundingBoxes";
export default function ImagesScreen() {
  const detections = usePhotosStore((state) => state.detections);
  const [itemSize, setItemSize] = useState(0);

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
        onLayout={handleLayout} // Obtenemos el tamaño del contenedor padre aquí
        data={Object.entries(detections)}
        numColumns={COLUMNS}
        keyExtractor={(item) => item[0]}
        // columnWrapperStyle aplica el espacio entre las columnas
        columnWrapperStyle={itemSize > 0 ? { gap: GAP, marginBottom: GAP } : undefined}
        renderItem={({ item }) => (
          <View
            style={{ width: itemSize, height: itemSize }}
            className="rounded-xl overflow-hidden bg-zinc-100"
          >
            {itemSize > 0 && (
              <ImageWithBoundingBoxes
                photoPath={item[0]}
                boxes={item[1]}
                imageSize={itemSize}
              />
            )}
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}
