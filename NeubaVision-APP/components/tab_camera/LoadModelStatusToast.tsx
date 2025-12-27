import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useModelStore } from "@/store/useModelStore";

export const LoadModelStatusToast = () => {
  const { loading, model } = useModelStore();
  const [isVisible, setIsVisible] = useState(true);
  const [statusText, setStatusText] = useState("Cargando IA...");

  useEffect(() => {
    if (loading) {
      setStatusText("Cargando IA...");
    } else if (model) {
      setStatusText("IA lista");

      // wait 1 second and close
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, model]);

  if (!isVisible) return null;

  return (
    <View className="absolute top-12 left-4 right-4 bg-zinc-900/90 border border-zinc-700 p-4 rounded-2xl shadow-xl z-50">
      <View className="flex-row justify-between items-center">
        <Text
          className={`${
            statusText === "IA lista" ? "text-green-400" : "text-amber-400"
          } font-bold text-sm`}
        >
          {statusText}
        </Text>
      </View>
    </View>
  );
};
