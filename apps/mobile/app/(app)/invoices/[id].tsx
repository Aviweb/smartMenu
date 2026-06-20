import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, Stack } from "expo-router";
import { Share } from "react-native";
import { Share2 } from "lucide-react-native";
import { api } from "../../../src/lib/api";
import { useAuthStore } from "../../../src/store/auth";

interface InvoiceItem {
  id: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  menuItem: { name: string; imageUrl: string | null };
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  totalAmount: string;
  createdAt: string;
  items: InvoiceItem[];
}

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { business } = useAuthStore();

  const { data, isLoading } = useQuery<{ invoice: Invoice }>({
    queryKey: ["invoice", id],
    queryFn: async () => (await api.get(`/api/invoices/${id}`)).data,
    enabled: !!id,
  });

  const invoice = data?.invoice;

  async function shareInvoice() {
    if (!invoice) return;
    const itemsText = invoice.items
      .map(
        (it) =>
          `${it.menuItem.name} x${it.quantity} = ₹${parseFloat(it.lineTotal).toFixed(2)}`
      )
      .join("\n");
    const message = `Invoice: ${invoice.invoiceNumber}\n${business?.name}\n\n${itemsText}\n\nTotal: ₹${parseFloat(invoice.totalAmount).toFixed(2)}`;
    await Share.share({ message });
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!invoice) {
    return (
      <View style={styles.center}>
        <Text>Invoice not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: invoice.invoiceNumber,
          headerRight: () => (
            <TouchableOpacity onPress={shareInvoice} style={styles.shareBtn}>
              <Share2 size={18} color="#f97316" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
            <Text style={styles.businessName}>{business?.name}</Text>
            <Text style={styles.date}>
              {new Date(invoice.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>

        {/* Items */}
        <View style={styles.itemsCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.col, styles.colItem]}>Item</Text>
            <Text style={[styles.col, styles.colQty]}>Qty</Text>
            <Text style={[styles.col, styles.colPrice]}>Price</Text>
            <Text style={[styles.col, styles.colTotal]}>Total</Text>
          </View>

          {invoice.items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.col, styles.colItem, styles.itemName]}>
                {item.menuItem.name}
              </Text>
              <Text style={[styles.col, styles.colQty, styles.cellText]}>
                {item.quantity}
              </Text>
              <Text style={[styles.col, styles.colPrice, styles.cellText]}>
                ₹{parseFloat(item.unitPrice).toFixed(2)}
              </Text>
              <Text style={[styles.col, styles.colTotal, styles.cellText, styles.lineTotal]}>
                ₹{parseFloat(item.lineTotal).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Total */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Grand Total</Text>
          <Text style={styles.totalAmount}>
            ₹{parseFloat(invoice.totalAmount).toFixed(2)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { color: "#9ca3af" },
  shareBtn: { padding: 4 },
  scroll: { flex: 1, padding: 16 },
  header: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  invoiceNumber: { fontSize: 20, fontWeight: "800", color: "#111827" },
  businessName: { fontSize: 14, color: "#6b7280", marginTop: 2 },
  date: { fontSize: 13, color: "#9ca3af", marginTop: 4 },
  itemsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: "row",
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#f3f4f6",
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f9fafb",
    alignItems: "center",
  },
  col: { fontSize: 13 },
  colItem: { flex: 2, color: "#374151", fontWeight: "700" },
  colQty: { flex: 0.5, textAlign: "center", color: "#374151", fontWeight: "700" },
  colPrice: { flex: 1, textAlign: "right", color: "#374151", fontWeight: "700" },
  colTotal: { flex: 1, textAlign: "right", color: "#374151", fontWeight: "700" },
  itemName: { fontWeight: "500" },
  cellText: { fontWeight: "400" },
  lineTotal: { fontWeight: "600", color: "#111827" },
  totalCard: {
    backgroundColor: "#f97316",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
    shadowColor: "#f97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  totalLabel: { fontSize: 16, fontWeight: "700", color: "rgba(255,255,255,0.85)" },
  totalAmount: { fontSize: 24, fontWeight: "800", color: "#fff" },
});
