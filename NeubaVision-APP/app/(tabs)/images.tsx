import React, { useState } from "react";
import { FlatList, View, LayoutChangeEvent, Pressable, Text } from "react-native";
import { usePhotosStore } from "@/store/usePhotosStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImageWithBoundingBoxes } from "@/components/core/ImageWithBoundingBoxes";
import { Ionicons } from "@expo/vector-icons";
import { ImageOptionsModal } from "@/components/tab_images/ImageOptionsModal";
import { ProcessedPhotoData } from "@/types/ProcessedPhotoData";
import { useColorScheme } from "@/hooks/theme/useColorScheme";
import { Colors } from "@/constants/theme";
import { ImagesHeader } from "@/components/tab_images/ImagesHeader";
import { CalculationSectionFooter } from "@/components/tab_images/CalculationSectionFooter";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";

import { useTranslation } from "react-i18next";

export default function ImagesScreen() {
  const { t } = useTranslation();
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

  const totalImagesCount = Object.keys(detections).length;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: themeColors.background }}>
      <ImagesHeader
        title={t("images.analysis_title")}
        acceptedCount={acceptedCount}
        deleteAcceptedPhotos={deleteAcceptedPhotos}
      />

      {acceptedCount === 0 && (
        <Animated.View
          entering={FadeInUp}
          exiting={FadeOutUp}
          className="px-4 py-2 items-center"
          style={{ backgroundColor: themeColors.card + "80" }} // Semi-transparent card color
        >
          <Text
            className="text-xs font-semibold opacity-60 uppercase tracking-wider text-center"
            style={{ color: themeColors.text }}
          >
            {totalImagesCount > 0
              ? t("images.select_images_instruction")
              : t("images.no_images_instruction")}
          </Text>
        </Animated.View>
      )}

      <FlatList
        className="flex-1"
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
                  <>
                    <View
                      className="absolute inset-0 bg-green-500/10 z-10"
                      pointerEvents="none"
                    />
                    <View
                      className="absolute top-2 right-2 bg-green-500 z-20 rounded-full p-0.5 shadow-sm"
                      style={{ elevation: 4 }}
                    >
                      <Ionicons name="checkmark-circle" size={18} color="white" />
                    </View>
                  </>
                )}
              </View>
            )}
          </Pressable>
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      <CalculationSectionFooter />

      <ImageOptionsModal
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
      />
    </SafeAreaView>
  );
}
