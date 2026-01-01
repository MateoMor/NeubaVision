import { useTranslation } from "react-i18next";
import { Tabs } from "expo-router";
import React from "react";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/theme/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: t("tabs.camera"),
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="camera" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="images"
        options={{
          title: t("tabs.images"),
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="image" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("tabs.settings"),
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="cog" color={color} />,
        }}
      />
    </Tabs>
  );
}
