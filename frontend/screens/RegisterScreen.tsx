import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, View, Text, Alert, TouchableOpacity } from 'react-native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig'; // Import Firebase services

interface RegisterScreenProps {
  onAuthSuccess?: () => void; // Optional callback for successful registration
}

export default function RegisterScreen({ onAuthSuccess }: RegisterScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleRegister = async () => {
    try {
      // Create a new user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('User registered:', user);

      // Update the user's displayName in Firebase Authentication
      await updateProfile(user, { displayName: username });
      console.log('Display name updated to:', username);

      // Store additional user details in Firestore
      const userRef = doc(db, 'Accounts', user.uid); // Use UID as the document ID
      await setDoc(userRef, {
        name: username,
        email: email,
        createdAt: new Date(),
        posts: [], // Initialize with an empty array for posts
        interested: [], // Initialize with an empty array for interested posts
      });

      console.log('User data saved to Firestore.');

      Alert.alert('Registration Successful', `Welcome, ${username}!`);

      // Trigger the onAuthSuccess callback if provided
      if (onAuthSuccess) {
        onAuthSuccess();
      }
    } catch (error) {
      console.error('Error during registration:', error);
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
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
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
      <TouchableOpacity onPress={() => onAuthSuccess && onAuthSuccess()}>
        <Text style={styles.loginText}>Already have an account? Login here</Text>
      </TouchableOpacity>
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
  loginText: {
    marginTop: 16,
    color: '#007BFF',
    textAlign: 'center',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});