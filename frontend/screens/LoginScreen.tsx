import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Import Firebase services
import {doc, getDoc, collection, getDocs} from 'firebase/firestore';
import {db} from '../firebaseConfig';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter(); // Use Expo Router's navigation

  console.log("LoginScreen rendered");

  const handleLogin = async () => {
    console.log("Login button clicked"); // Debugging: Check if the function is triggered
    console.log("Email:", username); // Debugging: Check the email value
    console.log("Password:", password); // Debugging: Check the password value

    const userRef = doc(db, "Accounts", username);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        console.log("User Data:", userSnap.data());
        if (userSnap.data().password === password) {
            console.log("User logged in!");
            router.push('/browse'); // Navigate to the Browse screen
        }
    } else {
        console.log("No such user found!");
    }

    // // Validate email and password
    // if (!email || !password) {
    //   Alert.alert("Error", "Please enter both email and password.");
    //   return;
    // }

    // // Simple email validation
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if (!emailRegex.test(email)) {
    //   Alert.alert("Error", "Please enter a valid email address.");
    //   return;
    // }

    // try {
    //   const userCredential = await signInWithEmailAndPassword(auth, email, password);
    //   console.log("User logged in:", userCredential.user); // Debugging: Check the user object
    //   Alert.alert('Login Successful', `Welcome back!`);
    //   router.push('/browse'); // Navigate to the Browse screen
    // } catch (error) {
    //   console.error("Login error:", error); // Debugging: Log the error
    //   Alert.alert('Login Failed', error instanceof Error ? error.message : 'An unknown error occurred.');
    // }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={username} // Ensure this is bound to the state
        onChangeText={setUsername} // Updates the state when the input changes
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password} // Ensure this is bound to the state
        onChangeText={setPassword} // Updates the state when the input changes
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
});