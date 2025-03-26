import React, { useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track login/registration status
  const router = useRouter();

  // Function to handle login/registration success
  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

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

  // If the user is authenticated, navigate to the main app (e.g., Tabs)
  router.push("./tabs");
  return null; // Prevent rendering anything while redirecting
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
});