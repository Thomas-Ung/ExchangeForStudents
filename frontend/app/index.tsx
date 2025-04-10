import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { onAuthStateChanged, setPersistence, browserSessionPersistence, signOut } from "firebase/auth";
import { auth } from "../firebaseConfig"; // Ensure this points to your Firebase config

export default function Index() {
  const [isLoading, setIsLoading] = useState(true); // Track loading state
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication state
  const router = useRouter();

  useEffect(() => {
    // Set Firebase Authentication persistence to session
    const configureAuthPersistence = async () => {
      try {
        await setPersistence(auth, browserSessionPersistence); // Use session persistence
        console.log("Firebase persistence set to session.");
      } catch (error) {
        console.error("Error setting Firebase persistence:", error);
      }
    };

    // Log out the user on app start
    const logoutUser = async () => {
      try {
        await signOut(auth);
        console.log("User logged out on app start.");
      } catch (error) {
        console.error("Error logging out user:", error);
      }
    };

    const initializeApp = async () => {
      await configureAuthPersistence();
      await logoutUser();

      // Listen for authentication state changes
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log("User is logged in:", user);
          setIsAuthenticated(true);
          router.replace("/tabs/browse"); // Redirect to the browse screen if authenticated
        } else {
          console.log("No user is logged in.");
          setIsAuthenticated(false);
        }
        setIsLoading(false); // Stop loading once the auth state is determined
      });

      // Cleanup the listener on unmount
      return () => unsubscribe();
    };

    initializeApp();
  }, []);

  if (isLoading) {
    // Show a loading indicator while checking authentication
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!isAuthenticated) {
    // If the user is not authenticated, show login/register options
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to Exchange for Students</Text>
        <Button title="Login" onPress={() => router.push("/login")} />
        <Button title="Register" onPress={() => router.push("/register")} />
      </View>
    );
  }

  // While redirecting, render nothing
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