import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { useModelStore } from "@/store/useModelStore";

export const LoadModelStatusToast = () => {
  const { t } = useTranslation();
  const { loading, model } = useModelStore();
  const [isVisible, setIsVisible] = useState(true);
  const [statusText, setStatusText] = useState(t("model.loading"));

  useEffect(() => {
    if (loading) {
      setStatusText(t("model.loading"));
    } else if (model) {
      setStatusText(t("model.ready"));

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
            statusText === t("model.ready") ? "text-green-400" : "text-amber-400"
          } font-bold text-sm`}
        >
          {statusText}
        </Text>
      </View>
    </View>
  );
};
