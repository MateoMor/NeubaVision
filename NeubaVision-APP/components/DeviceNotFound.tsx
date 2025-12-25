import { View, Text, StyleSheet } from "react-native";
import { CameraOff } from "lucide-react-native";

/**
 * Component displayed when no camera device is available.
 */
export const DeviceNotFound = () => {
  return (
    <View style={styles.container}>
      <CameraOff size={48} color="#666" />
      <Text style={styles.title}>Camera Not Found</Text>
      <Text style={styles.subtitle}>No camera device is available on this device.</Text>
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
