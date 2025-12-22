import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { useEffect } from "react";

import { useModelStore } from "@/store/useModelStore";
import { usePhotosStore } from "@/store/usePhotosStore";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Subscribe to model and loading state
  const model = useModelStore((state) => state.model);
  const loading = useModelStore((state) => state.loading);
  const classNames = useModelStore((state) => state.classNames);

  useEffect(() => {
    // Static method to access the store without subscribing
    const { loadModel } = useModelStore.getState();

    if (!model && !loading) {
      loadModel().catch((err) => {
        console.error("Failed to load model:", err);
      });
    }

    classNames[0] = "Cells";
  }, [model, loading]);

  const photos = usePhotosStore((state) => state.photos);

  useEffect(() => {
    console.log("Photos updated, total photos:", photos.length);
    const { runInference } = useModelStore.getState();
    const { setDetections } = usePhotosStore.getState();

    const { getLastPhoto } = usePhotosStore.getState();

    const lastPhoto = getLastPhoto();

    if (!lastPhoto) {
      return;
    }

    const photoPath = lastPhoto.path;

    console.log("Running inference on photo URI:", photoPath);
    async function testInference() {
      if (model) {
        try {
          const detections = await runInference(photoPath);
          setDetections(photoPath, detections);
          // console.log("Detections:", detections);
        } catch (error) {
          console.error("Inference error:", error);
        }
      }
    }

    testInference();
  }, [photos, model]);

  return (
    <GluestackUIProvider mode="dark">
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GluestackUIProvider>
  );
}
