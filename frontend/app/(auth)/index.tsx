import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { onAuthStateChanged, setPersistence, browserSessionPersistence } from "firebase/auth";
import { auth } from "../../firebaseConfig";

export const options = {
  title: '',
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
          console.log("User is logged in:", user);
          setIsAuthenticated(true);
        } else {
          console.log("No user is logged in.");
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
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to Exchange for Students</Text>
        <Button title="Login" onPress={() => router.push("/(auth)/login")} />
        <Button title="Register" onPress={() => router.push("/(auth)/register")} />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

