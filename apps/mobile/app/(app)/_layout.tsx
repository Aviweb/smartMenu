import { Stack, router } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "../../src/store/auth";

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, isLoading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="categories/[id]"
        options={{ headerShown: true, title: "Category" }}
      />
      <Stack.Screen
        name="menu-items/[id]"
        options={{ headerShown: true, title: "Menu Item" }}
      />
      <Stack.Screen
        name="billing/create"
        options={{ headerShown: true, title: "Create Bill" }}
      />
      <Stack.Screen
        name="invoices/[id]"
        options={{ headerShown: true, title: "Invoice Details" }}
      />
    </Stack>
  );
}
