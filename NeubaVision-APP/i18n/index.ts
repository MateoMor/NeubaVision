import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import { en } from "./en";
import { es } from "./es";
import { useAppSettingsStore } from "@/store/useAppSettingsStore";

const resources = {
  en,
  es,
};

// Initialize i18next
i18n.use(initReactI18next).init({
  resources,
  lng: Localization.getLocales()[0].languageCode ?? "es", // Default to device language
  fallbackLng: "es",
  interpolation: {
    escapeValue: false,
  },
});

// Function to update language based on store or system
export const updateLanguage = (language: "en" | "es" | "auto") => {
  if (language === "auto") {
    const systemLanguage = Localization.getLocales()[0].languageCode;
    i18n.changeLanguage(systemLanguage === "en" ? "en" : "es");
  } else {
    i18n.changeLanguage(language);
  }
};

export default i18n;
