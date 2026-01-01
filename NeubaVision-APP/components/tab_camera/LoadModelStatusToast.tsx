import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { useModelStore } from "@/store/useModelStore";
import { useThemeColor } from "@/hooks/theme/useThemeColor";

export const LoadModelStatusToast = () => {
  const { t } = useTranslation();
  const overlayColor = useThemeColor({}, "overlay");
  const borderColor = useThemeColor({}, "border");
  const tintColor = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "icon");

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
    <View
      className="absolute top-12 left-4 right-4 border p-4 rounded-2xl shadow-xl z-50"
      style={{
        backgroundColor: overlayColor,
        borderColor: borderColor,
      }}
    >
      <View className="flex-row justify-between items-center">
        <Text
          className="font-bold text-sm"
          style={{
            color: statusText === t("model.ready") ? tintColor : iconColor,
          }}
        >
          {statusText}
        </Text>
      </View>
    </View>
  );
};
