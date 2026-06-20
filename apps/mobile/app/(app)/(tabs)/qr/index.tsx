import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Download, Share2 } from "lucide-react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { api } from "../../../../src/lib/api";
import { useAuthStore } from "../../../../src/store/auth";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export default function QRScreen() {
  const { business, token } = useAuthStore();

  const menuUrl = `${API_URL.replace("localhost:3000", "smartmenu.app")}/menu/${business?.slug}`;

  async function downloadQR(format: "png" | "svg") {
    try {
      const res = await api.get(`/api/business/qr?format=${format}`, {
        responseType: "arraybuffer",
      });

      const base64 = btoa(
        new Uint8Array(res.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );

      const filename = `qr-${business?.slug}.${format}`;
      const uri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: format === "png" ? "image/png" : "image/svg+xml",
          dialogTitle: `QR Code — ${business?.name}`,
        });
      } else {
        Alert.alert("Saved", `QR code saved to ${uri}`);
      }
    } catch {
      Alert.alert("Error", "Failed to download QR code");
    }
  }

  async function shareMenuLink() {
    try {
      await Share.share({
        message: `View our menu: ${menuUrl}`,
        url: menuUrl,
        title: `${business?.name} — Digital Menu`,
      });
    } catch {
      // User cancelled
    }
  }

  const qrImageUrl = `${API_URL}/api/business/qr?format=png`;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        <Text style={styles.title}>Your QR Code</Text>
        <Text style={styles.subtitle}>
          Customers scan this to view your menu
        </Text>

        {/* QR Preview */}
        <View style={styles.qrCard}>
          <Image
            source={{
              uri: qrImageUrl,
              headers: { Authorization: `Bearer ${token}` },
            }}
            style={styles.qrImage}
            resizeMode="contain"
          />
          <Text style={styles.businessName}>{business?.name}</Text>
          <Text style={styles.menuUrl} numberOfLines={1}>
            {menuUrl}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => downloadQR("png")}
          >
            <Download size={20} color="#f97316" />
            <Text style={styles.actionBtnText}>Download PNG</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => downloadQR("svg")}
          >
            <Download size={20} color="#f97316" />
            <Text style={styles.actionBtnText}>Download SVG</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.shareBtn]}
            onPress={shareMenuLink}
          >
            <Share2 size={20} color="#fff" />
            <Text style={[styles.actionBtnText, styles.shareBtnText]}>
              Share Menu Link
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  content: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 32,
    textAlign: "center",
  },
  qrCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 32,
    width: "100%",
    maxWidth: 320,
  },
  qrImage: {
    width: 220,
    height: 220,
    marginBottom: 16,
  },
  businessName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  menuUrl: {
    fontSize: 12,
    color: "#9ca3af",
    maxWidth: 240,
  },
  actions: { gap: 12, width: "100%", maxWidth: 320 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#f97316",
    borderRadius: 14,
    paddingVertical: 14,
  },
  actionBtnText: { fontSize: 15, fontWeight: "600", color: "#f97316" },
  shareBtn: { backgroundColor: "#f97316", borderColor: "#f97316" },
  shareBtnText: { color: "#fff" },
});
