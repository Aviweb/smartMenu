import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Search, ChevronDown } from "lucide-react-native";
import { router } from "expo-router";
import { api } from "../../../../src/lib/api";

interface Invoice {
  id: string;
  invoiceNumber: string;
  totalAmount: string;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    unitPrice: string;
    lineTotal: string;
    menuItem: { name: string };
  }[];
}

export default function InvoicesScreen() {
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery<{ invoices: Invoice[]; total: number }>({
    queryKey: ["invoices", search, from, to],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const res = await api.get(`/api/invoices?${params}`);
      return res.data;
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>Invoices</Text>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => router.push("/(app)/billing/create")}
        >
          <Text style={styles.createBtnText}>+ New Bill</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <View style={styles.searchInput}>
          <Search size={16} color="#9ca3af" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search invoice number..."
            style={styles.searchText}
            placeholderTextColor="#9ca3af"
          />
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, showFilters && styles.filterBtnActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <ChevronDown size={16} color={showFilters ? "#f97316" : "#6b7280"} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filters}>
          <View style={styles.filterRow}>
            <View style={styles.filterField}>
              <Text style={styles.filterLabel}>From</Text>
              <TextInput
                value={from}
                onChangeText={setFrom}
                placeholder="YYYY-MM-DD"
                style={styles.filterInput}
                placeholderTextColor="#9ca3af"
              />
            </View>
            <View style={styles.filterField}>
              <Text style={styles.filterLabel}>To</Text>
              <TextInput
                value={to}
                onChangeText={setTo}
                placeholder="YYYY-MM-DD"
                style={styles.filterInput}
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
        </View>
      )}

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <Text style={styles.emptyText}>Loading...</Text>
        ) : !data?.invoices.length ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No invoices found</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {data.invoices.map((inv) => (
              <TouchableOpacity
                key={inv.id}
                style={styles.invoiceCard}
                onPress={() => router.push(`/(app)/invoices/${inv.id}`)}
              >
                <View style={styles.invoiceTop}>
                  <Text style={styles.invoiceNumber}>{inv.invoiceNumber}</Text>
                  <Text style={styles.invoiceAmount}>
                    ₹{parseFloat(inv.totalAmount).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.invoiceBottom}>
                  <Text style={styles.invoiceDate}>
                    {new Date(inv.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                  <Text style={styles.invoiceItems}>
                    {inv.items.length} item{inv.items.length !== 1 ? "s" : ""}
                  </Text>
                </View>
              </TouchableOpacity>
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
  createBtn: {
    backgroundColor: "#f97316",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  searchBar: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  searchInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  searchText: { flex: 1, fontSize: 14, color: "#111827" },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  filterBtnActive: { borderColor: "#f97316", backgroundColor: "#fff7ed" },
  filters: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  filterRow: { flexDirection: "row", gap: 10 },
  filterField: { flex: 1 },
  filterLabel: { fontSize: 11, color: "#6b7280", marginBottom: 4, fontWeight: "600" },
  filterInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: "#111827",
  },
  scroll: { flex: 1, padding: 16 },
  emptyText: { textAlign: "center", color: "#9ca3af", marginTop: 40, fontSize: 14 },
  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyTitle: { fontSize: 16, color: "#374151", fontWeight: "600" },
  list: { gap: 10 },
  invoiceCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  invoiceTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  invoiceNumber: { fontSize: 15, fontWeight: "700", color: "#111827" },
  invoiceAmount: { fontSize: 16, fontWeight: "800", color: "#f97316" },
  invoiceBottom: { flexDirection: "row", justifyContent: "space-between" },
  invoiceDate: { fontSize: 12, color: "#9ca3af" },
  invoiceItems: { fontSize: 12, color: "#9ca3af" },
});
