import React, { useState } from "react";
import { FlatList, View, LayoutChangeEvent, Pressable, Text } from "react-native";
import { usePhotosStore } from "@/store/usePhotosStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImageWithBoundingBoxes } from "@/components/tab_images/ImageWithBoundingBoxes";
import { Ionicons } from "@expo/vector-icons";
import { ImageOptionsModal } from "@/components/tab_images/ImageOptionsModal";
import { ProcessedPhotoData } from "@/types/ProcessedPhotoData";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { ImagesHeader } from "@/components/tab_images/ImagesHeader";

export default function ImagesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const detections = usePhotosStore((state) => state.detections);
  const toggleAccepted = usePhotosStore((state) => state.toggleAccepted);
  const deleteAcceptedPhotos = usePhotosStore((state) => state.deleteAcceptedPhotos);
  const [itemSize, setItemSize] = useState(0);
  const [selectedImage, setSelectedImage] = useState<[string, ProcessedPhotoData] | null>(
    null
  );

  const themeColors = Colors[colorScheme ?? "light"];
  const acceptedCount = Object.values(detections).filter((d) => d.isAccepted).length;

  const GAP = 4;
  const COLUMNS = 3;

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    const totalGaps = (COLUMNS - 1) * GAP;
    const calculatedSize = (width - totalGaps) / COLUMNS;
    setItemSize(calculatedSize);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: themeColors.background }}>
      <ImagesHeader
        title="Análisis"
        acceptedCount={acceptedCount}
        deleteAcceptedPhotos={deleteAcceptedPhotos}
      />
      <FlatList
        onLayout={handleLayout}
        data={Object.entries(detections)}
        numColumns={COLUMNS}
        keyExtractor={(item) => item[0]}
        columnWrapperStyle={itemSize > 0 ? { gap: GAP, marginBottom: GAP } : undefined}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setSelectedImage(item)}
            onLongPress={() => toggleAccepted(item[0])}
            delayLongPress={240}
            style={{ width: itemSize, height: itemSize }}
            className={`rounded-xl overflow-hidden ${
              isDark ? "bg-zinc-900" : "bg-zinc-100"
            }`}
          >
            {itemSize > 0 && (
              <View className="flex-1">
                <ImageWithBoundingBoxes
                  photoPath={item[0]}
                  boxes={item[1].boundingBoxes}
                  imageSize={itemSize}
                />

                {item[1].isAccepted && (
                  <View
                    className="absolute top-2 right-2 bg-green-500 rounded-full p-0.5 shadow-sm"
                    style={{ elevation: 2 }}
                  >
                    <Ionicons name="checkmark-circle" size={18} color="white" />
                  </View>
                )}
              </View>
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
