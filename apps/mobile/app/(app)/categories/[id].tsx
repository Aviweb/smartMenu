import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { useState } from "react";
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from "lucide-react-native";
import { api } from "../../../src/lib/api";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  status: "ACTIVE" | "OUT_OF_STOCK" | "ARCHIVED";
  category: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
}

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();
  const [showAddItem, setShowAddItem] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
  });

  const { data: catData } = useQuery<{ categories: Category[] }>({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/api/categories")).data,
  });

  const category = catData?.categories.find((c) => c.id === id);

  const { data, isLoading } = useQuery<{ items: MenuItem[] }>({
    queryKey: ["menu-items", id],
    queryFn: async () =>
      (await api.get(`/api/menu-items?categoryId=${id}`)).data,
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.post("/api/menu-items", {
        categoryId: id,
        name: form.name,
        description: form.description || undefined,
        price: parseFloat(form.price),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menu-items", id] });
      setShowAddItem(false);
      setForm({ name: "", description: "", price: "" });
    },
    onError: (e: any) =>
      Alert.alert("Error", e.response?.data?.error || "Failed to create item"),
  });

  const deleteMutation = useMutation({
    mutationFn: (itemId: string) => api.delete(`/api/menu-items/${itemId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menu-items", id] }),
    onError: (e: any) =>
      Alert.alert("Error", e.response?.data?.error || "Failed to delete item"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ itemId, status }: { itemId: string; status: string }) =>
      api.patch(`/api/menu-items/${itemId}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menu-items", id] }),
  });

  function confirmDelete(item: MenuItem) {
    Alert.alert("Delete Item", `Delete "${item.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteMutation.mutate(item.id),
      },
    ]);
  }

  function toggleStatus(item: MenuItem) {
    const newStatus =
      item.status === "ACTIVE" ? "OUT_OF_STOCK" : "ACTIVE";
    toggleMutation.mutate({ itemId: item.id, status: newStatus });
  }

  function validateAndCreate() {
    if (!form.name.trim()) return Alert.alert("Error", "Item name is required");
    if (!form.price || isNaN(parseFloat(form.price))) {
      return Alert.alert("Error", "Please enter a valid price");
    }
    createMutation.mutate();
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: category?.name || "Category",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setShowAddItem(true)}
              style={styles.headerBtn}
            >
              <Plus size={18} color="#f97316" />
            </TouchableOpacity>
          ),
        }}
      />

      {showAddItem && (
        <View style={styles.addForm}>
          <Text style={styles.addFormTitle}>Add Menu Item</Text>
          <TextInput
            value={form.name}
            onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
            placeholder="Item name *"
            style={styles.input}
          />
          <TextInput
            value={form.description}
            onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
            placeholder="Description (optional)"
            style={styles.input}
            multiline
          />
          <TextInput
            value={form.price}
            onChangeText={(v) => setForm((f) => ({ ...f, price: v }))}
            placeholder="Price (₹) *"
            keyboardType="decimal-pad"
            style={styles.input}
          />
          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setShowAddItem(false);
                setForm({ name: "", description: "", price: "" });
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={validateAndCreate}>
              <Text style={styles.saveText}>Add Item</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <Text style={styles.emptyText}>Loading...</Text>
        ) : !data?.items.length ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No items yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap + to add your first menu item
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {data.items.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                {item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
                    <Text style={styles.itemImagePlaceholderText}>
                      {item.name.charAt(0)}
                    </Text>
                  </View>
                )}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.description && (
                    <Text style={styles.itemDesc} numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}
                  <Text style={styles.itemPrice}>
                    ₹{parseFloat(item.price).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity
                    onPress={() => toggleStatus(item)}
                    style={styles.toggleBtn}
                  >
                    {item.status === "ACTIVE" ? (
                      <ToggleRight size={22} color="#22c55e" />
                    ) : (
                      <ToggleLeft size={22} color="#9ca3af" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => router.push(`/(app)/menu-items/${item.id}`)}
                    style={styles.iconBtn}
                  >
                    <Edit2 size={15} color="#6b7280" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => confirmDelete(item)}
                    style={styles.iconBtn}
                  >
                    <Trash2 size={15} color="#ef4444" />
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
  headerBtn: { padding: 4 },
  addForm: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    gap: 10,
  },
  addFormTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#f9fafb",
  },
  formActions: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  cancelText: { color: "#6b7280", fontWeight: "600" },
  saveBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f97316",
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "600" },
  scroll: { flex: 1, padding: 16 },
  emptyText: { textAlign: "center", color: "#9ca3af", marginTop: 40, fontSize: 14 },
  emptyContainer: { alignItems: "center", marginTop: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#374151", marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: "#9ca3af", textAlign: "center" },
  list: { gap: 10 },
  itemCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  itemImagePlaceholder: {
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  itemImagePlaceholderText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#9ca3af",
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: "600", color: "#111827" },
  itemDesc: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: "700", color: "#f97316", marginTop: 4 },
  itemActions: { alignItems: "center", gap: 4 },
  toggleBtn: { padding: 4 },
  iconBtn: { padding: 6 },
});
