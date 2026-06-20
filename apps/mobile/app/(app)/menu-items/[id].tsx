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
import { useLocalSearchParams, router, Stack } from "expo-router";
import { useState, useEffect } from "react";
import { Save } from "lucide-react-native";
import { api } from "../../../src/lib/api";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  status: "ACTIVE" | "OUT_OF_STOCK" | "ARCHIVED";
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
}

export default function MenuItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
  });

  const { data: itemData } = useQuery<{ items: MenuItem[] }>({
    queryKey: ["menu-items-all"],
    queryFn: async () => (await api.get("/api/menu-items?status=ALL")).data,
    enabled: !!id,
  });

  const { data: catData } = useQuery<{ categories: Category[] }>({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/api/categories")).data,
  });

  const item = itemData?.items.find((i) => i.id === id);

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name,
        description: item.description || "",
        price: parseFloat(item.price).toFixed(2),
        categoryId: item.categoryId,
      });
    }
  }, [item]);

  const updateMutation = useMutation({
    mutationFn: () =>
      api.put(`/api/menu-items/${id}`, {
        name: form.name,
        description: form.description || null,
        price: parseFloat(form.price),
        categoryId: form.categoryId,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menu-items"] });
      qc.invalidateQueries({ queryKey: ["menu-items-all"] });
      Alert.alert("Success", "Item updated successfully");
      router.back();
    },
    onError: (e: any) =>
      Alert.alert("Error", e.response?.data?.error || "Failed to update item"),
  });

  function validate() {
    if (!form.name.trim()) return Alert.alert("Error", "Name is required");
    if (!form.price || isNaN(parseFloat(form.price)))
      return Alert.alert("Error", "Please enter a valid price");
    updateMutation.mutate();
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Edit Item",
          headerRight: () => (
            <TouchableOpacity onPress={validate} style={styles.headerSaveBtn}>
              <Save size={16} color="#f97316" />
              <Text style={styles.headerSaveText}>Save</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Item Name *</Text>
            <TextInput
              value={form.name}
              onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
              style={styles.input}
              placeholder="e.g. Masala Dosa"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              value={form.description}
              onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
              style={[styles.input, styles.inputMultiline]}
              placeholder="Short description (optional)"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Price (₹) *</Text>
            <TextInput
              value={form.price}
              onChangeText={(v) => setForm((f) => ({ ...f, price: v }))}
              style={styles.input}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.categoryList}>
              {catData?.categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setForm((f) => ({ ...f, categoryId: cat.id }))}
                  style={[
                    styles.categoryChip,
                    form.categoryId === cat.id && styles.categoryChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      form.categoryId === cat.id && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  headerSaveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#fff7ed",
  },
  headerSaveText: { color: "#f97316", fontWeight: "700", fontSize: 13 },
  scroll: { flex: 1 },
  form: { padding: 16, gap: 16 },
  field: {},
  label: { fontSize: 13, fontWeight: "600", color: "#6b7280", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#fff",
  },
  inputMultiline: { minHeight: 80, textAlignVertical: "top" },
  categoryList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  categoryChipActive: {
    borderColor: "#f97316",
    backgroundColor: "#fff7ed",
  },
  categoryChipText: { fontSize: 13, color: "#6b7280", fontWeight: "500" },
  categoryChipTextActive: { color: "#f97316", fontWeight: "700" },
});
