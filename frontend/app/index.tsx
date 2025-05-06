import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from "react-native";
import { useRouter } from "expo-router";
import { onAuthStateChanged, setPersistence, browserSessionPersistence } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { LinearGradient } from "expo-linear-gradient";

export const options = {
  headerShown: false,
};

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const configureAuthPersistence = async () => {
      try {
        await setPersistence(auth, browserSessionPersistence);
        console.log("Firebase persistence set to session.");
      } catch (error) {
        console.error("Error setting Firebase persistence:", error);
      }
    };

    const initializeApp = async () => {
      await configureAuthPersistence();
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
        setIsLoading(false);
      });
      return () => unsubscribe();
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/tabs/browse");
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <LinearGradient colors={['#6dd5fa', '#2980b9']} style={styles.container}>
        <Text style={styles.welcomeText}>Welcome to ExchangeForStudents</Text>
        <Image source={require('../assets/images/logo.png')} style={styles.logo} />
        <TouchableOpacity style={styles.button} onPress={() => router.push("/login")}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => router.push("/register")}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  logo: { width: 300, height: 300, resizeMode: "contain", marginBottom: 20 },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
    width: "70%",
  },
  welcomeText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonText: { color: "#2980b9", fontSize: 16, fontWeight: "bold" },
});


