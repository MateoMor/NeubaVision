import { View, Modal, Pressable, Text } from "react-native";
import { ImageWithBoundingBoxes } from "./ImageWithBoundingBoxes";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useWindowDimensions } from "react-native";
import { usePhotosStore } from "@/store/usePhotosStore";
import { DetectedBoxes } from "@/types/DetectedBoxes";

export function ImageOptionsModal({
  selectedImage,
  setSelectedImage,
}: {
  selectedImage: [string, DetectedBoxes] | null;
  setSelectedImage: (image: [string, DetectedBoxes] | null) => void;
}) {
  const { width: screenWidth } = useWindowDimensions();
  const { deletePhoto, detections, updateUserCorrection } = usePhotosStore();

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

  if (!selectedImage) return null;

  const detectedCount = currentData?.boundingBoxes.length || 0;
  const userCorrection = currentData?.userCountCorrection || 0;
  const totalCount = detectedCount + userCorrection;

  return (
    <Modal
      visible={!!selectedImage}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setSelectedImage(null)}
    >
      <View className="flex-1 bg-black/95">
        <SafeAreaView className="flex-1">
          <View className="flex-row justify-between items-center p-4">
            <Pressable
              onPress={() => setSelectedImage(null)}
              className="p-2 bg-zinc-800/50 rounded-full"
            >
              <Ionicons name="close" size={24} color="white" />
            </Pressable>
            <Text className="text-white font-bold text-lg">Análisis</Text>
            <View className="w-10" />
          </View>

          {/* Imagen Principal */}
          <View className="flex-1 justify-center items-center">
            {currentPath && currentData && (
              <View style={{ width: screenWidth, height: screenWidth }}>
                <ImageWithBoundingBoxes
                  photoPath={currentPath}
                  boxes={currentData.boundingBoxes}
                  imageSize={screenWidth}
                />
              </View>
            )}
          </View>

          {/* Panel de Estadísticas y Controles */}
          <View className="p-8 bg-zinc-900 rounded-t-[40px] shadow-2xl">
            <View className="w-12 h-1 bg-zinc-700 rounded-full mb-8 self-center" />

            <View className="flex-row justify-between items-end mb-8">
              {/* IA Count */}
              <View className="items-center flex-1">
                <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-tighter mb-1">
                  Detectados
                </Text>
                <View className="bg-zinc-800/50 px-3 py-1 rounded-lg border border-zinc-700/50">
                  <Text className="text-zinc-300 text-2xl font-bold">
                    {detectedCount}
                  </Text>
                </View>
              </View>

              {/* Total Count (Enfocado) */}
              <View className="items-center flex-1">
                <Text className="text-zinc-400 text-xs font-black uppercase tracking-widest mb-2">
                  Total
                </Text>
                <Text className="text-white text-5xl font-black tabular-nums leading-none">
                  {totalCount}
                </Text>
              </View>

              {/* Correction Count */}
              <View className="items-center flex-1">
                <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-tighter mb-1">
                  Ajuste Manual
                </Text>
                <View
                  className={`px-3 py-1 rounded-lg border ${
                    userCorrection !== 0
                      ? "bg-amber-900/20 border-amber-500/30"
                      : "bg-zinc-800/50 border-zinc-700/50"
                  }`}
                >
                  <Text
                    className={`text-2xl font-bold ${
                      userCorrection > 0
                        ? "text-green-400"
                        : userCorrection < 0
                        ? "text-red-400"
                        : "text-zinc-300"
                    }`}
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
                className="flex-1 h-14 bg-zinc-800 border border-zinc-700 rounded-2xl items-center justify-center active:bg-zinc-700"
              >
                <Ionicons name="remove" size={28} color="white" />
              </Pressable>

              <Pressable
                onPress={() => handleUpdateCount(1)}
                className="flex-1 h-14 bg-zinc-800 border border-zinc-700 rounded-2xl items-center justify-center active:bg-zinc-700"
              >
                <Ionicons name="add" size={28} color="white" />
              </Pressable>
            </View>

            <Pressable
              onPress={handleDelete}
              className="bg-red-500/10 border border-red-500/20 flex-row items-center justify-center py-4 rounded-2xl w-full active:bg-red-500/20"
            >
              <Ionicons name="trash" size={20} color="#ef4444" />
              <Text className="text-red-500 font-bold text-lg ml-2">Borrar Registro</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
