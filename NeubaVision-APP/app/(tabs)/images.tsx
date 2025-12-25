import React from "react";
import { Image, FlatList, View } from "react-native";
import { usePhotosStore } from "@/store/usePhotosStore";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ImagesScreen() {
  const photos = usePhotosStore((state) => state.photos);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={photos}
        numColumns={3}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View className="w-1/3 aspect-square p-0.5">
            <Image
              source={{ uri: item.path }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}
