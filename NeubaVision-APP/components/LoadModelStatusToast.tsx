import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useModelStore } from "@/store/useModelStore";

export const LoadModelStatusToast = () => {
  const { loading, model } = useModelStore();
  const [isVisible, setIsVisible] = useState(true);
  const [statusText, setStatusText] = useState("Cargando");

  useEffect(() => {
    if (loading) {
      setStatusText("Cargando");
    } else if (model) {
      setStatusText("Completado");

      // Esperar 2 segundos y cerrar
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [loading, model]);

  if (!isVisible) return null;

  return (
    <View className="absolute top-12 left-4 right-4 bg-zinc-900/90 border border-zinc-700 p-4 rounded-2xl shadow-xl z-50">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-white font-bold text-sm">{statusText}</Text>
        <Text
          className={`${
            statusText === "Completado" ? "text-green-400" : "text-amber-400"
          } text-xs font-medium`}
        >
          {statusText === "Completado" ? "Completado" : "Cargando..."}
        </Text>
      </View>
    </View>
  );
};
