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
import { useTranslation } from "react-i18next";

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
    language,
    setConfidenceThreshold,
    setIouThreshold,
    setChamberDimensions,
    setThemeMode,
    setLanguage,
    resetToDefaults,
  } = useAppSettingsStore();

  const { t } = useTranslation();

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
    Alert.alert(t("settings.clear_cache.label"), t("settings.clear_cache.description"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => {
          clearAllPhotos();
          Alert.alert(t("common.success"), t("settings.clear_cache.success"));
        },
      },
    ]);
  };

  // Reset settings handler
  const handleResetSettings = () => {
    Alert.alert(
      t("settings.reset_defaults.label"),
      t("settings.reset_defaults.description"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.ok"),
          style: "destructive",
          onPress: () => {
            resetToDefaults();
            setWidth(chamberWidth.toString());
            setHeight(chamberHeight.toString());
            setDepth(chamberDepth.toString());
            Alert.alert(t("common.success"), t("settings.reset_defaults.success")); // Added success key if missing or just use generic
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
          <ConfigSection title={t("settings.appearance")}>
            <ConfigSelect
              label={t("settings.language")}
              value={
                language === "auto"
                  ? t("languages.auto")
                  : language === "es"
                  ? t("languages.es")
                  : t("languages.en")
              }
              onValueChange={(val) => setLanguage(val as any)}
              options={[
                { label: t("languages.auto"), value: "auto" },
                { label: t("languages.es"), value: "es" },
                { label: t("languages.en"), value: "en" },
              ]}
            />
            <ConfigSelect
              label={t("settings.theme.label")}
              value={
                themeMode != "auto"
                  ? themeMode.charAt(0).toUpperCase() + themeMode.slice(1)
                  : t("settings.theme.auto")
              }
              onValueChange={(val) => setThemeMode(val as any)}
              options={[
                { label: t("settings.theme.auto"), value: "auto" },
                { label: t("settings.theme.light"), value: "light" },
                { label: t("settings.theme.dark"), value: "dark" },
              ]}
              showDivider={false}
            />
          </ConfigSection>

          <ConfigSection title={t("settings.measurement_params")}>
            <ConfigInput
              label={t("settings.dilution_factor.label")}
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
              label={t("settings.chamber_width.label")}
              value={width}
              onChangeText={setWidth}
              onBlur={handleDimensionChange}
              keyboardType="numeric"
              unit="mm"
              placeholder="1"
            />
            <ConfigInput
              label={t("settings.chamber_height.label")}
              value={height}
              onChangeText={setHeight}
              onBlur={handleDimensionChange}
              keyboardType="numeric"
              unit="mm"
              placeholder="1"
            />
            <ConfigInput
              label={t("settings.chamber_depth.label")}
              value={depth}
              onChangeText={setDepth}
              onBlur={handleDimensionChange}
              keyboardType="numeric"
              unit="mm"
              placeholder="0.1"
              showDivider={false}
            />
          </ConfigSection>

          <ConfigSection title={t("settings.model_settings")}>
            <ConfigSlider
              label={t("settings.sensitivity.label")}
              value={confidenceThreshold}
              onValueChange={setConfidenceThreshold}
              minimumValue={0.1}
              maximumValue={0.9}
              step={0.05}
              valueFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              description={t("settings.sensitivity.description")}
            />
            <ConfigSlider
              label={t("settings.iou.label")}
              value={iouThreshold}
              onValueChange={setIouThreshold}
              minimumValue={0.1}
              maximumValue={0.9}
              step={0.05}
              valueFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              description={t("settings.iou.description")}
              showDivider={false}
            />
          </ConfigSection>

          <ConfigSection title={t("settings.advanced")}>
            <ConfigButton
              label={t("settings.clear_cache.label")}
              onPress={handleClearCache}
              icon="trash-outline"
              destructive
              showDivider={false}
            />
            <ConfigButton
              label={t("settings.reset_defaults.label")}
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
