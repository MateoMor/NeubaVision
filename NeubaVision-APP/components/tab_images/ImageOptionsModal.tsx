import { View, Modal, Pressable, Text } from "react-native";
import { useThemeColor } from "@/hooks/theme/useThemeColor";
import { ImageWithBoundingBoxes } from "../core/ImageWithBoundingBoxes";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useWindowDimensions } from "react-native";
import { usePhotosStore } from "@/store/usePhotosStore";
import { ProcessedPhotoData } from "@/types/ProcessedPhotoData";
import { GestureHandlerRootView, Directions } from "react-native-gesture-handler";
import { ZoomableContainer } from "../core/ZoomableContainer";

export function ImageOptionsModal({
  selectedImage,
  setSelectedImage,
}: {
  selectedImage: [string, ProcessedPhotoData] | null;
  setSelectedImage: (image: [string, ProcessedPhotoData] | null) => void;
}) {
  const { width: screenWidth } = useWindowDimensions();
  const { deletePhoto, detections, updateUserCorrection, toggleAccepted } =
    usePhotosStore();

  const overlayColor = useThemeColor({}, "overlay");
  const cardColor = useThemeColor({}, "card");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "icon");
  const inputBgColor = useThemeColor({}, "inputBackground");
  const borderColor = useThemeColor({}, "border");

  const currentPath = selectedImage?.[0];
  const currentData = currentPath ? detections[currentPath] : null;

  const handleDelete = () => {
    if (currentPath) {
      deletePhoto(currentPath);
      setSelectedImage(null);
    }
  };

  const handleUpdateCount = (delta: number) => {
    if (currentPath) {
      updateUserCorrection(currentPath, delta);
    }
  };

  const handleToggleAccepted = () => {
    if (currentPath) {
      toggleAccepted(currentPath);
    }
  };

  if (!selectedImage) return null;

  const detectedCount = currentData?.boundingBoxes.length || 0;
  const userCorrection = currentData?.userCountCorrection || 0;
  const totalCount = detectedCount + userCorrection;

  const isAccepted = currentData?.isAccepted || false;

  const navigateToImage = (direction: Directions) => {
    if (currentPath) {
      const paths = Object.keys(detections);
      const currentIndex = paths.indexOf(currentPath);
      let nextIndex = 0;
      if (direction === Directions.LEFT) {
        nextIndex = currentIndex + 1;
      } else if (direction === Directions.RIGHT) {
        nextIndex = currentIndex - 1;
      }
      const nextPath = paths[nextIndex];
      if (nextPath) {
        setSelectedImage([nextPath, detections[nextPath]]);
      }
    }
  };

  const handleOnFling = (direction: Directions) => {
    navigateToImage(direction);
  };

  return (
    <Modal
      visible={!!selectedImage}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setSelectedImage(null)}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View className="flex-1" style={{ backgroundColor: overlayColor }}>
          <SafeAreaView className="flex-1">
            <View className="flex-row justify-between items-center p-4">
              <Pressable onPress={() => setSelectedImage(null)} className="rounded-full">
                <Ionicons name="close" size={24} color={textColor} />
              </Pressable>
              <Text className="font-bold text-xl" style={{ color: textColor }}>
                Análisis
              </Text>
              <View className="w-10" />
            </View>

            {/* Imagen Principal con Zoom */}
            <View className="flex-1 justify-center items-center overflow-hidden">
              {currentPath && currentData && (
                <ZoomableContainer
                  width={screenWidth}
                  height={screenWidth}
                  onFling={handleOnFling}
                  resetId={currentPath}
                >
                  <ImageWithBoundingBoxes
                    photoPath={currentPath}
                    boxes={currentData.boundingBoxes}
                    imageSize={screenWidth}
                  />
                </ZoomableContainer>
              )}
            </View>

            {/* Panel de Estadísticas y Controles */}
            <View
              className="p-8 rounded-t-[40px] shadow-2xl"
              style={{ backgroundColor: cardColor }}
            >
              <View
                className="w-12 h-1 rounded-full mb-8 self-center"
                style={{ backgroundColor: borderColor }}
              />

              <View className="flex-row justify-between items-end mb-8">
                {/* IA Count */}
                <View className="items-center flex-1">
                  <Text
                    className="text-[10px] font-bold uppercase tracking-tighter mb-1"
                    style={{ color: iconColor }}
                  >
                    Detectados
                  </Text>
                  <View
                    className="px-3 py-1 rounded-lg border"
                    style={{ backgroundColor: inputBgColor, borderColor: borderColor }}
                  >
                    <Text className="text-2xl font-bold" style={{ color: textColor }}>
                      {detectedCount}
                    </Text>
                  </View>
                </View>

                <View className="items-center flex-1">
                  <Text
                    className="text-xs font-black uppercase tracking-widest mb-2"
                    style={{ color: tintColor }}
                  >
                    Total
                  </Text>
                  <Text
                    className="text-5xl font-black tabular-nums leading-none"
                    style={{ color: textColor }}
                  >
                    {totalCount}
                  </Text>
                </View>

                <View className="items-center flex-1">
                  <Text
                    className="text-[10px] font-bold uppercase tracking-tighter mb-1"
                    style={{ color: iconColor }}
                  >
                    Ajuste Manual
                  </Text>
                  <View
                    className={`px-3 py-1 rounded-lg border ${
                      userCorrection !== 0 ? "bg-amber-900/20 border-amber-500/30" : ""
                    }`}
                    style={
                      userCorrection === 0
                        ? { backgroundColor: inputBgColor, borderColor: borderColor }
                        : {}
                    }
                  >
                    <Text
                      className={`text-2xl font-bold ${
                        userCorrection > 0
                          ? "text-green-400"
                          : userCorrection < 0
                          ? "text-red-400"
                          : ""
                      }`}
                      style={userCorrection === 0 ? { color: textColor } : {}}
                    >
                      {userCorrection > 0 ? `+${userCorrection}` : userCorrection}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Botones de Control de Ajuste */}
              <View className="flex-row justify-center gap-4 mb-8">
                <Pressable
                  onPress={() => handleUpdateCount(-1)}
                  className="flex-1 h-14 border rounded-2xl items-center justify-center active:opacity-80"
                  style={{ backgroundColor: inputBgColor, borderColor: borderColor }}
                >
                  <Ionicons name="remove" size={28} color={textColor} />
                </Pressable>

                <Pressable
                  onPress={() => handleUpdateCount(1)}
                  className="flex-1 h-14 border rounded-2xl items-center justify-center active:opacity-80"
                  style={{ backgroundColor: inputBgColor, borderColor: borderColor }}
                >
                  <Ionicons name="add" size={28} color={textColor} />
                </Pressable>
              </View>

              <View className="flex-row gap-4">
                <Pressable
                  onPress={handleToggleAccepted}
                  className={`flex-1 flex-row items-center justify-center py-4 rounded-2xl border ${
                    isAccepted
                      ? "bg-green-500/10 border-green-500/20"
                      : "bg-blue-500 border-blue-600"
                  } active:opacity-80`}
                >
                  <Ionicons
                    name={isAccepted ? "checkmark-circle" : "checkmark"}
                    size={20}
                    color={isAccepted ? "#22c55e" : "white"}
                  />
                  <Text
                    className={`font-bold text-lg ml-2 ${
                      isAccepted ? "text-green-500" : "text-white"
                    }`}
                  >
                    {isAccepted ? "Aceptada" : "Confirmar"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleDelete}
                  className="bg-red-500/10 border border-red-500/20 flex-row items-center justify-center py-4 px-6 rounded-2xl active:bg-red-500/20"
                >
                  <Ionicons name="trash" size={20} color="#ef4444" />
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
