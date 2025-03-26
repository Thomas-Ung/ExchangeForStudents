import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig'; // Import Firebase services

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const router = useRouter(); // Use Expo Router's navigation

  const handleRegister = async () => {
    try {
        console.log("Register button clicked"); // Debugging: Check if the function is triggered
        // Reference to the "users" collection and document with a custom ID
        const userRef = doc(db, "Accounts", username);
        // Fetch the document to check if it already exists
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            // If the document exists, log a message and don't overwrite it
            console.log("User with this ID already exists:", username);
        } else {
            // If the document does not exist, create a new one
            const newUser = {
                name: username,
                password: password
            };
            try {
                // Set the document data at the specified document ID
                await setDoc(userRef, newUser);
                console.log("User created with ID:", username);
            } catch (e) {
                console.error("Error creating user: ", e);  // Error handling
            }
        }

      // Create a new user with Firebase Authentication
    //   const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    //   const user = userCredential.user;

    //   // Store user data in Firestore
    //   const userDocRef = doc(db, 'Accounts', user.uid); // Use the user's UID as the document ID
    //   await setDoc(userDocRef, {
    //     email: email,
    //     username: username,
    //     createdAt: new Date().toISOString(),
    //   });
    

      Alert.alert('Registration Successful', `Welcome, ${username}!`);
      router.push('/browse'); // Navigate to the Browse screen
    } catch (error) {
      Alert.alert('Registration Failed', error instanceof Error ? error.message : 'An unknown error occurred.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Register" onPress={handleRegister} />
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