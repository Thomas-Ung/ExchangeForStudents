import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import { signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router"; // Add this import

export default function LoginScreen({
  onAuthSuccess,
  onRegisterClick,
}: {
  onAuthSuccess?: () => void;
  onRegisterClick?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter(); // Add router

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userRef = doc(db, "Accounts", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.name)
          await updateProfile(user, { displayName: userData.name });
        alert(`Welcome back, ${userData.name || "User"}!`);

        // Use provided callback or default navigation
        if (onAuthSuccess) {
          onAuthSuccess();
        } else {
          router.push("/tabs/browse"); // Default navigation after login
        }
      } else {
        alert("Login Failed: No user data found.");
      }
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      switch (err.code) {
        case "auth/user-not-found":
          alert("No user found with this email.");
          break;
        case "auth/invalid-email":
          alert("Invalid email format.");
          break;
        case "auth/wrong-password":
          alert("Incorrect password.");
          break;
        default:
          alert("Login Failed: Invalid credentials.");
          break;
      }
    }
  };

  // Handler for register link
  const handleRegisterClick = () => {
    if (onRegisterClick) {
      onRegisterClick();
    } else {
      router.push("/register"); // Default navigation to register screen
    }
  };

  return (
    <LinearGradient colors={["#6dd5fa", "#2980b9"]} style={styles.container}>
      <Image
        source={require("../assets/images/logo.png")}
        style={styles.logo}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#888"
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleRegisterClick}>
        <Text style={styles.linkText}>
          Don't have an account? Register here
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  logo: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 12,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#2980b9", fontSize: 16, fontWeight: "bold" },
  linkText: {
    marginTop: 16,
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});
