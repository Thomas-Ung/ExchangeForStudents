import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image, Animated, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { onAuthStateChanged, setPersistence, browserSessionPersistence } from "firebase/auth";
import { auth } from "../../firebaseConfig";

export const options = {
  title: '',
};

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
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
        setIsAuthenticated(!!user);
        setIsLoading(false);
      });

      return () => unsubscribe();
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/tabs/browse");
    } else if (!isLoading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <LinearGradient colors={['#a1c4fd', '#c2e9fb']} style={styles.gradient}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <Animated.Image
            source={require('../../assets/images/logo.png')}
            style={[styles.logo, { transform: [{ scale: pulseAnim }] }]}
          />
          <Text style={styles.title}>Welcome to Exchange for Students</Text>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && { transform: [{ scale: 0.95 }] },
            ]}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.buttonText}>Login</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && { transform: [{ scale: 0.95 }] },
            ]}
            onPress={() => router.push("/(auth)/register")}
          >
            <Text style={styles.buttonText}>Register</Text>
          </Pressable>
        </Animated.View>
      </LinearGradient>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f4f8",
  },
  logo: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#4f46e5",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginVertical: 10,
    width: "60%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});


