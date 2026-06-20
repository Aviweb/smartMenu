import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { TrendingUp, Receipt, Clock, Star } from "lucide-react-native";
import { api } from "../../../../src/lib/api";
import { useAuthStore } from "../../../../src/store/auth";

interface DashboardData {
  todayRevenue: number;
  billsToday: number;
  recentInvoices: {
    id: string;
    invoiceNumber: string;
    totalAmount: string;
    createdAt: string;
  }[];
  mostSoldItems: {
    menuItemId: string;
    totalQuantity: number;
    menuItem?: { name: string; price: string };
  }[];
}

export default function DashboardScreen() {
  const { business } = useAuthStore();
  const { data, isLoading, refetch } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await api.get("/api/dashboard");
      return res.data;
    },
    refetchInterval: 60000,
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back!</Text>
            <Text style={styles.businessName}>{business?.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.createBillBtn}
            onPress={() => router.push("/(app)/billing/create")}
          >
            <Text style={styles.createBillText}>+ New Bill</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardPrimary]}>
            <TrendingUp size={20} color="#fff" />
            <Text style={styles.statLabelWhite}>Today&apos;s Revenue</Text>
            <Text style={styles.statValueWhite}>
              ₹{isLoading ? "—" : (data?.todayRevenue || 0).toFixed(2)}
            </Text>
          </View>
          <View style={[styles.statCard, styles.statCardSecondary]}>
            <Receipt size={20} color="#f97316" />
            <Text style={styles.statLabel}>Bills Today</Text>
            <Text style={styles.statValue}>{isLoading ? "—" : data?.billsToday || 0}</Text>
          </View>
        </View>

        {/* Recent Bills */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={16} color="#6b7280" />
            <Text style={styles.sectionTitle}>Recent Bills</Text>
          </View>
          {isLoading ? (
            <Text style={styles.emptyText}>Loading...</Text>
          ) : !data?.recentInvoices.length ? (
            <Text style={styles.emptyText}>No bills yet</Text>
          ) : (
            data.recentInvoices.slice(0, 5).map((inv) => (
              <TouchableOpacity
                key={inv.id}
                style={styles.invoiceRow}
                onPress={() => router.push(`/(app)/invoices/${inv.id}`)}
              >
                <View>
                  <Text style={styles.invoiceNumber}>{inv.invoiceNumber}</Text>
                  <Text style={styles.invoiceDate}>
                    {new Date(inv.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
                <Text style={styles.invoiceAmount}>
                  ₹{parseFloat(inv.totalAmount).toFixed(2)}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Most Sold Items */}
        {!!data?.mostSoldItems.length && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Star size={16} color="#6b7280" />
              <Text style={styles.sectionTitle}>Top Selling Items</Text>
            </View>
            {data.mostSoldItems.map((item, idx) => (
              <View key={item.menuItemId} style={styles.topItemRow}>
                <View style={styles.topItemRank}>
                  <Text style={styles.topItemRankText}>{idx + 1}</Text>
                </View>
                <Text style={styles.topItemName}>{item.menuItem?.name || "—"}</Text>
                <Text style={styles.topItemQty}>{item.totalQuantity} sold</Text>
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
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 24 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: { fontSize: 13, color: "#6b7280" },
  businessName: { fontSize: 20, fontWeight: "700", color: "#111827" },
  createBillBtn: {
    backgroundColor: "#f97316",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createBillText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statCardPrimary: { backgroundColor: "#f97316" },
  statCardSecondary: { backgroundColor: "#fff" },
  statLabel: { fontSize: 12, color: "#6b7280" },
  statLabelWhite: { fontSize: 12, color: "rgba(255,255,255,0.8)" },
  statValue: { fontSize: 24, fontWeight: "800", color: "#111827" },
  statValueWhite: { fontSize: 24, fontWeight: "800", color: "#fff" },
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
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#374151" },
  emptyText: { color: "#9ca3af", textAlign: "center", paddingVertical: 12, fontSize: 14 },
  invoiceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  invoiceNumber: { fontSize: 14, fontWeight: "600", color: "#111827" },
  invoiceDate: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  invoiceAmount: { fontSize: 15, fontWeight: "700", color: "#f97316" },
  topItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  topItemRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff7ed",
    alignItems: "center",
    justifyContent: "center",
  },
  topItemRankText: { fontSize: 12, fontWeight: "700", color: "#f97316" },
  topItemName: { flex: 1, fontSize: 14, color: "#374151" },
  topItemQty: { fontSize: 13, color: "#6b7280", fontWeight: "600" },
});
