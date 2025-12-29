import { View, Text, ScrollView } from "react-native";
import React from "react";

export default function SettingsScreen() {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-5">
        <Text className="text-2xl font-bold mb-4">Settings</Text>
      </View>
    </ScrollView>
  );
}
