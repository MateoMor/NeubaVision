import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { CameraOff } from "lucide-react-native";

/**
 * Component displayed when no camera device is available.
 */
export const DeviceNotFound = () => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <CameraOff size={48} color="#666" />
      <Text style={styles.title}>{t("camera.device_not_found_title")}</Text>
      <Text style={styles.subtitle}>{t("camera.device_not_found_subtitle")}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});
