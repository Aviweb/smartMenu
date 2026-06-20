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
import { Plus, Edit2, Trash2, GripVertical } from "lucide-react-native";
import { api } from "../../../../src/lib/api";

interface Category {
  id: string;
  name: string;
  sortOrder: number;
}

export default function MenuItemsScreen() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");

  const { data, isLoading } = useQuery<{ categories: Category[] }>({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/api/categories")).data,
  });

  const createMutation = useMutation({
    mutationFn: (name: string) =>
      api.post("/api/categories", { name, sortOrder: (data?.categories.length || 0) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      setShowAdd(false);
      setNewName("");
    },
    onError: (e: any) =>
      Alert.alert("Error", e.response?.data?.error || "Failed to create category"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
    onError: (e: any) =>
      Alert.alert("Error", e.response?.data?.error || "Failed to delete category"),
  });

  function confirmDelete(cat: Category) {
    Alert.alert("Delete Category", `Delete "${cat.name}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteMutation.mutate(cat.id),
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>Menu</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAdd(true)}
        >
          <Plus size={18} color="#fff" />
          <Text style={styles.addBtnText}>Category</Text>
        </TouchableOpacity>
      </View>

      {showAdd && (
        <View style={styles.addForm}>
          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder="Category name"
            style={styles.addInput}
            autoFocus
          />
          <View style={styles.addFormActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => { setShowAdd(false); setNewName(""); }}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={() => newName.trim() && createMutation.mutate(newName.trim())}
            >
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <Text style={styles.emptyText}>Loading...</Text>
        ) : !data?.categories.length ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No categories yet</Text>
            <Text style={styles.emptySubtitle}>Create your first category to start adding menu items</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {data.categories.map((cat) => (
              <View key={cat.id} style={styles.categoryCard}>
                <GripVertical size={16} color="#d1d5db" style={styles.dragHandle} />
                <TouchableOpacity
                  style={styles.categoryInfo}
                  onPress={() => router.push(`/(app)/categories/${cat.id}`)}
                >
                  <Text style={styles.categoryName}>{cat.name}</Text>
                  <Text style={styles.categoryHint}>Tap to manage items →</Text>
                </TouchableOpacity>
                <View style={styles.categoryActions}>
                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => router.push(`/(app)/categories/${cat.id}`)}
                  >
                    <Edit2 size={16} color="#6b7280" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => confirmDelete(cat)}
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

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
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f97316",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  addForm: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    gap: 12,
  },
  addInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: "#f9fafb",
  },
  addFormActions: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  cancelBtnText: { color: "#6b7280", fontWeight: "600" },
  saveBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f97316",
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "600" },
  scroll: { flex: 1, padding: 16 },
  emptyText: { color: "#9ca3af", textAlign: "center", marginTop: 40, fontSize: 14 },
  emptyContainer: { alignItems: "center", marginTop: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#374151", marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: "#9ca3af", textAlign: "center", lineHeight: 20 },
  list: { gap: 10 },
  categoryCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  dragHandle: { marginRight: 10 },
  categoryInfo: { flex: 1 },
  categoryName: { fontSize: 16, fontWeight: "600", color: "#111827" },
  categoryHint: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  categoryActions: { flexDirection: "row", gap: 4 },
  iconBtn: { padding: 8 },
});
