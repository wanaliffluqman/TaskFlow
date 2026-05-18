import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation } from "@apollo/client/react";

import { LOGIN, SIGNUP } from "../graphql/todoQueries";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { loginUser } = useAuth();

  const [signup] = useMutation<any>(SIGNUP);
  const [login] = useMutation<any>(LOGIN);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Validation Error", "Please enter email and password.");
      return;
    }

    try {
      const result = isSignup
        ? await signup({ variables: { email, password } })
        : await login({ variables: { email, password } });

      const authData = isSignup ? result.data.signup : result.data.login;

      loginUser(authData.user);
      setEmail("");
      setPassword("");

      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, isDarkMode && styles.darkContainer]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <View style={styles.topActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setIsDarkMode(!isDarkMode)}
            >
              <Text style={styles.themeIconText}>
                {isDarkMode ? "☀️" : "🌙"}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.title, isDarkMode && styles.darkText]}>
            TaskFlow
          </Text>

          <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>
            Your tasks, all in one placer
          </Text>

          <Text style={[styles.label, isDarkMode && styles.darkText]}>
            Email
          </Text>
          <TextInput
            style={[styles.input, isDarkMode && styles.darkInput]}
            placeholder="Enter your email"
            placeholderTextColor={isDarkMode ? "#94a3b8" : "#64748b"}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={[styles.label, isDarkMode && styles.darkText]}>
            Password
          </Text>
          <TextInput
            style={[styles.input, isDarkMode && styles.darkInput]}
            placeholder="Enter your password"
            placeholderTextColor={isDarkMode ? "#94a3b8" : "#64748b"}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.primaryButton} onPress={handleAuth}>
            <Text style={styles.buttonText}>
              {isSignup ? "Sign Up" : "Login"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
            <Text style={styles.linkText}>
              {isSignup
                ? "Already have an account? Login"
                : "No account? Sign up"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef6ff",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  topActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 18,
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#7c3aed",
    alignItems: "center",
    justifyContent: "center",
  },
  themeIconText: {
    fontSize: 18,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748b",
    marginBottom: 22,
  },
  label: {
    fontSize: 13,
    fontWeight: "800",
    color: "#334155",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    marginBottom: 14,
    backgroundColor: "#ffffff",
    color: "#0f172a",
  },
  primaryButton: {
    backgroundColor: "#0f172a",
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  linkText: {
    color: "#2563eb",
    fontWeight: "700",
    marginTop: 18,
    textAlign: "center",
  },
  darkContainer: {
    backgroundColor: "#020617",
  },
  darkCard: {
    backgroundColor: "#0f172a",
  },
  darkText: {
    color: "#f8fafc",
  },
  darkSubtitle: {
    color: "#cbd5e1",
  },
  darkInput: {
    backgroundColor: "#020617",
    borderColor: "#475569",
    color: "#f8fafc",
  },
});
