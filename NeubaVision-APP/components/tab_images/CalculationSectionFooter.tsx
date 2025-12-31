import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle } from "react-native-reanimated";
import { GestureDetector } from "react-native-gesture-handler";

import { useNeubauerCalculationsStore } from "@/store/useNeubauerCalculationsStore";
import { usePhotosStore } from "@/store/usePhotosStore";
import { useColorScheme } from "@/hooks/theme/useColorScheme";
import { Colors } from "@/constants/theme";
import { formatScientific } from "@/utils/calculation/formatScientific";
import { verticalPan } from "@/utils/animations/verticalPan";
import { ResultRow } from "./ResultRow";
import { DividerLine } from "./DividerLine";

export const CalculationSectionFooter = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const themeColors = Colors[colorScheme ?? "light"];

  // Stores
  const {
    dilutionFactor,
    cellsPerSquare,
    cellsPerMilliliter,
    volumePerSquare,
    calculateCellsPerSquare,
    calculateVolumePerSquare,
    calculateCellsPerMilliliter,
  } = useNeubauerCalculationsStore();

  const detections = usePhotosStore((state) => state.detections);

  // Local state for chamber dimensions
  const [depth, setDepth] = useState("0.1");
  const [width, setWidth] = useState("1");
  const [height, setHeight] = useState("1");

  // Derived state from photos
  const acceptedPhotos = Object.values(detections).filter((d) => d.isAccepted);
  const nSquares = acceptedPhotos.length;
  const totalCells = acceptedPhotos.reduce(
    (acc, d) => acc + d.boundingBoxes.length + d.userCountCorrection,
    0
  );

  // Effects
  useEffect(() => {
    calculateCellsPerSquare(totalCells, nSquares);
  }, [totalCells, nSquares, calculateCellsPerSquare]);

  useEffect(() => {
    const h = parseFloat(height);
    const w = parseFloat(width);
    const d = parseFloat(depth);
    if (!isNaN(h) && !isNaN(w) && !isNaN(d)) {
      calculateVolumePerSquare(h, w, d);
    }
  }, [height, width, depth, calculateVolumePerSquare]);

  useEffect(() => {
    calculateCellsPerMilliliter();
  }, [cellsPerSquare, volumePerSquare, dilutionFactor, calculateCellsPerMilliliter]);

  // Animation
  const [contentHeight, setContentHeight] = useState(0);
  const translateY = useSharedValue(0);
  const COLLAPSED_PEEK_HEIGHT = 70;
  const context = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <GestureDetector
      gesture={verticalPan(translateY, contentHeight, COLLAPSED_PEEK_HEIGHT, context, 45)}
    >
      <Animated.View
        className="rounded-t-3xl shadow-lg absolute bottom-0 left-0 right-0"
        style={[animatedStyle, { backgroundColor: isDark ? "#27272a" : "#f4f4f5" }]}
        onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
      >
        {/* Handle */}
        <View className="w-full items-center pt-3 pb-1">
          <View className="w-12 h-1.5 bg-gray-400/40 rounded-full" />
        </View>

        <View className="px-4 pb-6 pt-2">
          <Text className="text-xl font-bold mb-4" style={{ color: themeColors.text }}>
            Cálculo de Células
          </Text>

          {/* Results */}
          <View className="gap-2">
            <ResultRow
              label="Factor de dilución"
              value={dilutionFactor.toString()}
              themeColors={themeColors}
            />
            <ResultRow
              label="Dimensión de la imágen mm³"
              value={width + " x " + height + " x " + depth}
              themeColors={themeColors}
            />

            <DividerLine />

            <ResultRow
              label="Número de imágenes"
              value={nSquares.toString()}
              themeColors={themeColors}
            />
            <ResultRow
              label="Total de células"
              value={totalCells.toString()}
              themeColors={themeColors}
            />
            <ResultRow
              label="Promedio / imagen"
              value={cellsPerSquare.toFixed(2)}
              themeColors={themeColors}
            />

            <DividerLine />

            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-semibold" style={{ color: themeColors.text }}>
                Concentración
              </Text>
              <View className="items-end">
                <Text className="text-2xl font-bold text-blue-500">
                  {formatScientific(cellsPerMilliliter)}
                </Text>
                <Text className="text-xs text-gray-500">células / mL</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Skirt to cover bottom gap during over-drag */}
        <View
          className="absolute w-full h-[1000px]"
          style={{
            top: "100%",
            backgroundColor: isDark ? "#27272a" : "#f4f4f5",
          }}
        />
      </Animated.View>
    </GestureDetector>
  );
};
