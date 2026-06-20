import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { TextInput, Button } from "react-native-paper";
import { Link } from "expo-router";
import { useAuthStore } from "../../src/store/auth";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen() {
  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    mobile: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();

  function update(key: keyof typeof form) {
    return (value: string) => setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleRegister() {
    if (Object.values(form).some((v) => !v)) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (form.password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);
      await register(form);
    } catch (error: any) {
      Alert.alert(
        "Registration Failed",
        error.response?.data?.error || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start your digital menu journey</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Business Name"
              value={form.businessName}
              onChangeText={update("businessName")}
              mode="outlined"
              style={styles.input}
              outlineColor="#e5e7eb"
              activeOutlineColor="#f97316"
            />
            <TextInput
              label="Owner Name"
              value={form.ownerName}
              onChangeText={update("ownerName")}
              mode="outlined"
              style={styles.input}
              outlineColor="#e5e7eb"
              activeOutlineColor="#f97316"
            />
            <TextInput
              label="Mobile Number"
              value={form.mobile}
              onChangeText={update("mobile")}
              keyboardType="phone-pad"
              mode="outlined"
              style={styles.input}
              outlineColor="#e5e7eb"
              activeOutlineColor="#f97316"
            />
            <TextInput
              label="Email"
              value={form.email}
              onChangeText={update("email")}
              keyboardType="email-address"
              autoCapitalize="none"
              mode="outlined"
              style={styles.input}
              outlineColor="#e5e7eb"
              activeOutlineColor="#f97316"
            />
            <TextInput
              label="Password (min 8 characters)"
              value={form.password}
              onChangeText={update("password")}
              secureTextEntry={!showPassword}
              mode="outlined"
              style={styles.input}
              outlineColor="#e5e7eb"
              activeOutlineColor="#f97316"
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.button}
              contentStyle={styles.buttonContent}
              buttonColor="#f97316"
            >
              Create Account
            </Button>

            <View style={styles.linkContainer}>
              <Text style={styles.linkText}>Already have an account? </Text>
              <Link href="/(auth)/login" style={styles.link}>
                Sign In
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: { alignItems: "center", marginBottom: 32 },
  title: { fontSize: 28, fontWeight: "700", color: "#111827", marginBottom: 4 },
  subtitle: { fontSize: 15, color: "#6b7280" },
  form: { gap: 12 },
  input: { backgroundColor: "#fff" },
  button: { marginTop: 8, borderRadius: 12 },
  buttonContent: { paddingVertical: 6 },
  linkContainer: { flexDirection: "row", justifyContent: "center", marginTop: 8 },
  linkText: { color: "#6b7280", fontSize: 14 },
  link: { color: "#f97316", fontWeight: "600", fontSize: 14 },
});
