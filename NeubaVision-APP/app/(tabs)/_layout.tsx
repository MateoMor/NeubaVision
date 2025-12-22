import { Tabs } from 'expo-router';
import React from 'react';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Camera',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="camera" color={color} />,
        }}
      />
      <Tabs.Screen
        name="images"
        options={{
          title: 'Images',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="image" color={color} />,
        }}
      />
      <Tabs.Screen
        name="segmented-images"
        options={{
          title: 'Segmented Image',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="scissors" color={color} />,
        }}
      />
    </Tabs>
  );
}
