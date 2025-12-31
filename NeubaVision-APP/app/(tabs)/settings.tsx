import { View, ScrollView, Alert } from "react-native";
import React, { useState } from "react";
import { useColorScheme } from "@/hooks/theme/useColorScheme";
import { Colors } from "@/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { SettingsHeader } from "@/components/tab_settings/SettingsHeader";
import { ConfigSection } from "@/components/tab_settings/ConfigSection";
import { ConfigInput } from "@/components/tab_settings/ConfigInput";
import { ConfigSlider } from "@/components/tab_settings/ConfigSlider";
import { ConfigButton } from "@/components/tab_settings/ConfigButton";
import { useNeubauerCalculationsStore } from "@/store/useNeubauerCalculationsStore";
import { useAppSettingsStore } from "@/store/useAppSettingsStore";
import { usePhotosStore } from "@/store/usePhotosStore";
import { ConfigSelect } from "@/components/tab_settings/ConfigSelect";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];

  // Neubauer Calculations Store
  const { dilutionFactor, setDilutionFactor } = useNeubauerCalculationsStore();

  // App Settings Store
  const {
    confidenceThreshold,
    iouThreshold,
    chamberWidth,
    chamberHeight,
    chamberDepth,
    themeMode,
    setConfidenceThreshold,
    setIouThreshold,
    setChamberDimensions,
    setThemeMode,
    resetToDefaults,
  } = useAppSettingsStore();

  // Photos Store
  const { clearAllPhotos } = usePhotosStore();

  // Local state for chamber dimensions
  const [width, setWidth] = useState(chamberWidth.toString());
  const [height, setHeight] = useState(chamberHeight.toString());
  const [depth, setDepth] = useState(chamberDepth.toString());

  // Update chamber dimensions
  const handleDimensionChange = () => {
    const w = parseFloat(width) || 1;
    const h = parseFloat(height) || 1;
    const d = parseFloat(depth) || 0.1;
    setChamberDimensions(w, h, d);
  };

  // Clear cache handler
  const handleClearCache = () => {
    Alert.alert(
      "Limpiar Caché",
      "¿Estás seguro de que quieres eliminar todas las imágenes guardadas?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            clearAllPhotos();
            Alert.alert("Éxito", "Caché limpiado correctamente");
          },
        },
      ]
    );
  };

  // Reset settings handler
  const handleResetSettings = () => {
    Alert.alert(
      "Restaurar Configuración",
      "¿Estás seguro de que quieres restaurar todas las configuraciones a sus valores por defecto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Restaurar",
          style: "destructive",
          onPress: () => {
            resetToDefaults();
            setWidth(chamberWidth.toString());
            setHeight(chamberHeight.toString());
            setDepth(chamberDepth.toString());
            Alert.alert("Éxito", "Configuración restaurada");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: themeColors.background }}
      edges={["right", "top", "left"]}
    >
      <SettingsHeader />
      <ScrollView className="flex-1" style={{ backgroundColor: themeColors.background }}>
        <View className="p-5">
          <ConfigSection title="Apariencia">
            <ConfigSelect
              label="Tema"
              value={
                themeMode === "auto"
                  ? "Automático"
                  : themeMode === "dark"
                  ? "Oscuro"
                  : "Claro"
              }
              onValueChange={(value) => {
                const mode =
                  value === "Automático" ? "auto" : value === "Oscuro" ? "dark" : "light";
                setThemeMode(mode);
              }}
              options={["Automático", "Claro", "Oscuro"]}
              description="Selecciona el tema de la aplicación"
              showDivider={false}
            />
          </ConfigSection>

          <ConfigSection title="Párametros de medición">
            <ConfigInput
              label="Factor de dilución"
              value={dilutionFactor.toString()}
              onChangeText={(text) => {
                const val = parseFloat(text);
                if (!isNaN(val)) setDilutionFactor(val);
                else if (text === "") setDilutionFactor(0);
              }}
              keyboardType="numeric"
              placeholder="10"
            />
            <ConfigInput
              label="Ancho de celda"
              value={width}
              onChangeText={setWidth}
              onBlur={handleDimensionChange}
              keyboardType="numeric"
              unit="mm"
              placeholder="1"
            />
            <ConfigInput
              label="Alto de celda"
              value={height}
              onChangeText={setHeight}
              onBlur={handleDimensionChange}
              keyboardType="numeric"
              unit="mm"
              placeholder="1"
            />
            <ConfigInput
              label="Profundidad de celda"
              value={depth}
              onChangeText={setDepth}
              onBlur={handleDimensionChange}
              keyboardType="numeric"
              unit="mm"
              placeholder="0.1"
              showDivider={false}
            />
          </ConfigSection>

          <ConfigSection title="Configuración del Modelo">
            <ConfigSlider
              label="Sensibilidad"
              value={confidenceThreshold}
              onValueChange={setConfidenceThreshold}
              minimumValue={0.1}
              maximumValue={0.9}
              step={0.05}
              valueFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              description="Umbral de confianza para detecciones. Mayor = más estricto"
            />
            <ConfigSlider
              label="Supresión de duplicados (IOU)"
              value={iouThreshold}
              onValueChange={setIouThreshold}
              minimumValue={0.1}
              maximumValue={0.9}
              step={0.05}
              valueFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              description="Umbral para eliminar detecciones duplicadas"
              showDivider={false}
            />
          </ConfigSection>

          <ConfigSection title="Avanzado">
            <ConfigButton
              label="Limpiar caché de imágenes"
              onPress={handleClearCache}
              icon="trash-outline"
              destructive
              showDivider={false}
            />
            <ConfigButton
              label="Restaurar configuración por defecto"
              onPress={handleResetSettings}
              icon="refresh-outline"
              destructive
              showDivider={false}
            />
          </ConfigSection>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
