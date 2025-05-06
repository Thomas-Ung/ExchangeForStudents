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
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router"; // Add this import

export default function RegisterScreen({
  onAuthSuccess,
  onLoginClick, // Add new prop for login navigation
}: {
  onAuthSuccess?: () => void;
  onLoginClick?: () => void; // Add type for new prop
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const router = useRouter(); // Add router

  const handleRegister = async () => {
    try {
      // Validate inputs before attempting registration
      if (!username.trim()) {
        alert("Username cannot be empty");
        return;
      }

      if (!email.trim()) {
        alert("Email cannot be empty");
        return;
      }

      if (password.length < 6) {
        alert("Password must be at least 6 characters");
        return;
      }

      // Registration logic remains the same
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await updateProfile(user, { displayName: username });
      const userRef = doc(db, "Accounts", user.uid);
      await setDoc(userRef, {
        name: username,
        email,
        createdAt: new Date(),
        posts: [],
        interested: [],
      });
      alert(`Registration Successful: Welcome, ${username}!`);

      // Use provided callback or default navigation
      if (onAuthSuccess) {
        onAuthSuccess();
      } else {
        router.push("/tabs/browse"); // Default navigation after registration
      }
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      switch (err.code) {
        case "auth/email-already-in-use":
          alert("Email address is already in use by another account.");
          break;
        case "auth/invalid-email":
          alert("Invalid email format. Please check your email address.");
          break;
        case "auth/weak-password":
          alert("Password is too weak. Please use at least 6 characters.");
          break;
        case "auth/operation-not-allowed":
          alert("Account creation is disabled. Please contact support.");
          break;
        case "auth/network-request-failed":
          alert("Network error. Please check your internet connection.");
          break;
        case "auth/too-many-requests":
          alert("Too many unsuccessful attempts. Please try again later.");
          break;
        default:
          alert(
            `Registration Failed: ${err.message || "Unknown error occurred."}`
          );
          break;
      }
      console.error("Registration error:", err);
    }
  };

  // Handler for login link
  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      router.push("/"); // Default navigation to login screen
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
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        placeholderTextColor="#888"
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
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      {/* Update this to use the new handler */}
      <TouchableOpacity onPress={handleLoginClick}>
        <Text style={styles.linkText}>Already have an account? Login here</Text>
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
