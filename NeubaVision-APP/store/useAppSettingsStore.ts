import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AppSettingsState {
  // Model Settings
  confidenceThreshold: number;
  iouThreshold: number;
  
  // Appearance Settings
  themeMode: "light" | "dark" | "auto";
  language: "es" | "en" | "auto";
  
  // Neubauer Chamber Settings
  chamberWidth: number;
  chamberHeight: number;
  chamberDepth: number;
  
  // Actions
  setConfidenceThreshold: (value: number) => void;
  setIouThreshold: (value: number) => void;
  setThemeMode: (mode: "light" | "dark" | "auto") => void;
  setLanguage: (lang: "es" | "en" | "auto") => void;
  setChamberDimensions: (width: number, height: number, depth: number) => void;
  resetToDefaults: () => void;
}

const defaultSettings = {
  confidenceThreshold: 0.25,
  iouThreshold: 0.45,
  themeMode: "auto" as const,
  language: "auto" as const,
  chamberWidth: 1,
  chamberHeight: 1,
  chamberDepth: 0.1,
};

/**
 * App Settings Store
 * 
 * Centralizes all application settings including:
 * - Model configuration (confidence/IOU thresholds)
 * - Camera preferences
 * - Neubauer chamber dimensions
 * - Appearance settings
 * 
 * Settings are persisted to AsyncStorage and will persist across app restarts.
 */
export const useAppSettingsStore = create<AppSettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setConfidenceThreshold: (value: number) =>
        set({ confidenceThreshold: value }),

      setIouThreshold: (value: number) => set({ iouThreshold: value }),

      setThemeMode: (mode: "light" | "dark" | "auto") =>
        set({ themeMode: mode }),

      setLanguage: (lang: "es" | "en" | "auto") => set({ language: lang }),

      setChamberDimensions: (width: number, height: number, depth: number) =>
        set({
          chamberWidth: width,
          chamberHeight: height,
          chamberDepth: depth,
        }),

      resetToDefaults: () => set(defaultSettings),
    }),
    {
      name: "app-settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

