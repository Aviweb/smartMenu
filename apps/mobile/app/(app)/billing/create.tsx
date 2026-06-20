import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import { useState } from "react";
import { Search, Plus, Minus, Trash2 } from "lucide-react-native";
import { api } from "../../../src/lib/api";

interface MenuItem {
  id: string;
  name: string;
  price: string;
  category: { name: string };
}

interface BillItem {
  menuItem: MenuItem;
  quantity: number;
}

export default function CreateBillScreen() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [billItems, setBillItems] = useState<BillItem[]>([]);

  const { data } = useQuery<{ items: MenuItem[] }>({
    queryKey: ["menu-items-active"],
    queryFn: async () => (await api.get("/api/menu-items?status=ACTIVE")).data,
  });

  const filteredItems = (data?.items || []).filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.name.toLowerCase().includes(search.toLowerCase())
  );

  const createMutation = useMutation({
    mutationFn: () =>
      api.post("/api/invoices", {
        items: billItems.map((bi) => ({
          menuItemId: bi.menuItem.id,
          quantity: bi.quantity,
          unitPrice: parseFloat(bi.menuItem.price),
        })),
      }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      router.replace(`/(app)/invoices/${res.data.invoice.id}`);
    },
    onError: (e: any) =>
      Alert.alert("Error", e.response?.data?.error || "Failed to create invoice"),
  });

  function addItem(item: MenuItem) {
    setBillItems((prev) => {
      const existing = prev.find((bi) => bi.menuItem.id === item.id);
      if (existing) {
        return prev.map((bi) =>
          bi.menuItem.id === item.id
            ? { ...bi, quantity: bi.quantity + 1 }
            : bi
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  }

  function changeQty(itemId: string, delta: number) {
    setBillItems((prev) =>
      prev
        .map((bi) =>
          bi.menuItem.id === itemId
            ? { ...bi, quantity: bi.quantity + delta }
            : bi
        )
        .filter((bi) => bi.quantity > 0)
    );
  }

  const grandTotal = billItems.reduce(
    (sum, bi) => sum + bi.quantity * parseFloat(bi.menuItem.price),
    0
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen options={{ title: "Create Bill" }} />

      <View style={styles.body}>
        {/* Left — Menu Items */}
        <View style={styles.menuPanel}>
          <View style={styles.searchBar}>
            <Search size={14} color="#9ca3af" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search items..."
              style={styles.searchText}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <FlatList
            data={filteredItems}
            keyExtractor={(i) => i.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => addItem(item)}
              >
                <View style={styles.menuItemInfo}>
                  <Text style={styles.menuItemName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.menuItemCat}>{item.category.name}</Text>
                </View>
                <View style={styles.menuItemRight}>
                  <Text style={styles.menuItemPrice}>
                    ₹{parseFloat(item.price).toFixed(0)}
                  </Text>
                  <View style={styles.addBtn}>
                    <Plus size={14} color="#fff" />
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No items found</Text>
            }
          />
        </View>

        {/* Right — Bill */}
        <View style={styles.billPanel}>
          <Text style={styles.billTitle}>Current Bill</Text>

          <ScrollView style={styles.billItems} showsVerticalScrollIndicator={false}>
            {billItems.length === 0 ? (
              <Text style={styles.billEmptyText}>Add items from the left</Text>
            ) : (
              billItems.map((bi) => (
                <View key={bi.menuItem.id} style={styles.billRow}>
                  <Text style={styles.billItemName} numberOfLines={2}>
                    {bi.menuItem.name}
                  </Text>
                  <View style={styles.billItemQty}>
                    <TouchableOpacity
                      onPress={() => changeQty(bi.menuItem.id, -1)}
                      style={styles.qtyBtn}
                    >
                      {bi.quantity === 1 ? (
                        <Trash2 size={12} color="#ef4444" />
                      ) : (
                        <Minus size={12} color="#6b7280" />
                      )}
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{bi.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => changeQty(bi.menuItem.id, 1)}
                      style={styles.qtyBtn}
                    >
                      <Plus size={12} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.billItemTotal}>
                    ₹{(bi.quantity * parseFloat(bi.menuItem.price)).toFixed(0)}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>

          <View style={styles.billFooter}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalAmount}>₹{grandTotal.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={[styles.generateBtn, billItems.length === 0 && styles.generateBtnDisabled]}
              onPress={() => {
                if (billItems.length === 0) return Alert.alert("Error", "Add at least one item");
                createMutation.mutate();
              }}
              disabled={createMutation.isPending || billItems.length === 0}
            >
              <Text style={styles.generateBtnText}>
                {createMutation.isPending ? "Saving..." : "Generate Bill"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  body: { flex: 1, flexDirection: "row" },
  menuPanel: { flex: 1, borderRightWidth: 1, borderRightColor: "#f3f4f6" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    margin: 10,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchText: { flex: 1, fontSize: 13, color: "#111827" },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    gap: 8,
  },
  menuItemInfo: { flex: 1 },
  menuItemName: { fontSize: 13, fontWeight: "600", color: "#111827" },
  menuItemCat: { fontSize: 11, color: "#9ca3af", marginTop: 1 },
  menuItemRight: { alignItems: "flex-end", gap: 4 },
  menuItemPrice: { fontSize: 13, fontWeight: "700", color: "#374151" },
  addBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#f97316",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: { textAlign: "center", color: "#9ca3af", marginTop: 24, fontSize: 13 },
  billPanel: { width: 160, backgroundColor: "#fff", padding: 10 },
  billTitle: { fontSize: 14, fontWeight: "700", color: "#111827", marginBottom: 10 },
  billItems: { flex: 1 },
  billEmptyText: { fontSize: 12, color: "#9ca3af", textAlign: "center", marginTop: 20 },
  billRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    gap: 4,
  },
  billItemName: { fontSize: 12, fontWeight: "600", color: "#374151" },
  billItemQty: { flexDirection: "row", alignItems: "center", gap: 6 },
  qtyBtn: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: { fontSize: 13, fontWeight: "700", color: "#111827", minWidth: 16, textAlign: "center" },
  billItemTotal: { fontSize: 12, fontWeight: "700", color: "#f97316" },
  billFooter: { gap: 8, paddingTop: 8 },
  totalRow: { flexDirection: "row", justifyContent: "space-between" },
  totalLabel: { fontSize: 12, color: "#6b7280", fontWeight: "600" },
  totalAmount: { fontSize: 14, fontWeight: "800", color: "#111827" },
  generateBtn: {
    backgroundColor: "#f97316",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  generateBtnDisabled: { backgroundColor: "#d1d5db" },
  generateBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});
