import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { User, Building2, LogOut, ChevronRight, Save } from "lucide-react-native";
import { api } from "../../../../src/lib/api";
import { useAuthStore } from "../../../../src/store/auth";

interface Business {
  name: string;
  phone: string;
  address: string;
  description: string;
}

export default function SettingsScreen() {
  const { user, business, logout, updateBusiness } = useAuthStore();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Business>({
    name: business?.name || "",
    phone: "",
    address: "",
    description: "",
  });

  const { data } = useQuery({
    queryKey: ["business"],
    queryFn: async () => {
      const res = await api.get("/api/business");
      const b = res.data.business;
      setForm({
        name: b.name || "",
        phone: b.phone || "",
        address: b.address || "",
        description: b.description || "",
      });
      return b;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Business>) => api.put("/api/business", data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["business"] });
      updateBusiness({ name: res.data.business.name });
      setEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    },
    onError: (e: any) =>
      Alert.alert("Error", e.response?.data?.error || "Failed to update profile"),
  });

  function update(key: keyof Business) {
    return (value: string) => setForm((f) => ({ ...f, [key]: value }));
  }

  function confirmLogout() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>Settings</Text>
        {editing ? (
          <View style={styles.editActions}>
            <TouchableOpacity
              onPress={() => setEditing(false)}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => updateMutation.mutate(form)}
              style={styles.saveBtn}
            >
              <Save size={14} color="#fff" />
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setEditing(true)}
            style={styles.editBtn}
          >
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* Business Profile */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Building2 size={16} color="#6b7280" />
            <Text style={styles.sectionTitle}>Business Profile</Text>
          </View>

          {editing ? (
            <View style={styles.editForm}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Business Name</Text>
                <TextInput
                  value={form.name}
                  onChangeText={update("name")}
                  style={styles.fieldInput}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Phone</Text>
                <TextInput
                  value={form.phone}
                  onChangeText={update("phone")}
                  keyboardType="phone-pad"
                  style={styles.fieldInput}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Address</Text>
                <TextInput
                  value={form.address}
                  onChangeText={update("address")}
                  style={styles.fieldInput}
                  multiline
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Description</Text>
                <TextInput
                  value={form.description}
                  onChangeText={update("description")}
                  style={[styles.fieldInput, styles.fieldInputMultiline]}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          ) : (
            <View style={styles.infoList}>
              <InfoRow label="Business Name" value={data?.name || "—"} />
              <InfoRow label="Slug" value={`/menu/${data?.slug || "—"}`} />
              <InfoRow label="Phone" value={data?.phone || "—"} />
              <InfoRow label="Address" value={data?.address || "—"} />
              <InfoRow label="Description" value={data?.description || "—"} />
            </View>
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout}>
          <LogOut size={18} color="#ef4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  label: { fontSize: 13, color: "#6b7280" },
  value: { fontSize: 13, color: "#111827", fontWeight: "500", maxWidth: "60%", textAlign: "right" },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  pageTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  editActions: { flexDirection: "row", gap: 8 },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cancelText: { color: "#6b7280", fontSize: 13, fontWeight: "600" },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f97316",
  },
  saveText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  editBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#fff7ed",
  },
  editText: { color: "#f97316", fontWeight: "700", fontSize: 13 },
  scroll: { flex: 1, padding: 16 },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#f97316",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 22, fontWeight: "700" },
  userName: { fontSize: 17, fontWeight: "700", color: "#111827" },
  userEmail: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#374151" },
  infoList: {},
  editForm: { gap: 12 },
  field: {},
  fieldLabel: { fontSize: 11, color: "#6b7280", fontWeight: "600", marginBottom: 4 },
  fieldInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#f9fafb",
  },
  fieldInputMultiline: { minHeight: 72, textAlignVertical: "top" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#fee2e2",
  },
  logoutText: { color: "#ef4444", fontWeight: "700", fontSize: 15 },
});
