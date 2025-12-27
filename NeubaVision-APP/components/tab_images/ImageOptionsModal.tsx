import { View, Modal, Pressable, Text } from "react-native";
import { ImageWithBoundingBoxes } from "./ImageWithBoundingBoxes";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BoundingBox } from "@/types/BoundingBox";
import { useWindowDimensions } from "react-native";
import { usePhotosStore } from "@/store/usePhotosStore";

export function ImageOptionsModal({
  selectedImage,
  setSelectedImage,
}: {
  selectedImage: [string, BoundingBox[]] | null;
  setSelectedImage: (image: [string, BoundingBox[]] | null) => void;
}) {
  const { width: screenWidth } = useWindowDimensions();
  const { deletePhoto } = usePhotosStore();

  const handleDelete = () => {
    if (selectedImage) {
      deletePhoto(selectedImage[0]);
      setSelectedImage(null);
    }
  };
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
            <View className="w-10" /> {/* Espaciador para centrar el título */}
          </View>

          {/* Imagen Principal */}
          <View className="flex-1 justify-center items-center">
            {selectedImage && (
              <View style={{ width: screenWidth, height: screenWidth }}>
                <ImageWithBoundingBoxes
                  photoPath={selectedImage[0]}
                  boxes={selectedImage[1]}
                  imageSize={screenWidth}
                />
              </View>
            )}
          </View>

          {/* Info y Botón Borrar */}
          <View className="p-8 bg-zinc-900 rounded-t-[40px] items-center shadow-2xl">
            <View className="w-12 h-1 bg-zinc-700 rounded-full mb-6" />

            <Text className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-1">
              Células detectadas
            </Text>
            <Text className="text-white text-6xl font-black mb-8">
              {selectedImage ? selectedImage[1].length : 0}
            </Text>

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
