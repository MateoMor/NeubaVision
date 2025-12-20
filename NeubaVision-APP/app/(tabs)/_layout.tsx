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
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="camera" color={color} />,
        }}
      />
      <Tabs.Screen
        name="imageScreen"
        options={{
          title: 'Images',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="image" color={color} />,
        }}
      />
      <Tabs.Screen
        name="segmendImage"
        options={{
          title: 'Segmented Image',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="scissors" color={color} />,
        }}
      />
    </Tabs>
  );
}
