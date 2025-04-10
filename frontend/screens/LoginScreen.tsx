import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, View, Text, Alert, TouchableOpacity } from 'react-native';
import { signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Import Firebase services
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface LoginScreenProps {
  onAuthSuccess?: () => void; // Optional callback for successful authentication
}

export default function LoginScreen({ onAuthSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      // Authenticate the user with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('User authenticated:', user);

      // Fetch additional user details from Firestore
      const userRef = doc(db, 'Accounts', user.uid); // Use UID as the document ID
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        console.log('User data from Firestore:', userData);

        // Optionally update the displayName in Firebase Authentication
        if (userData.name) {
          await updateProfile(user, { displayName: userData.name });
          console.log('Display name updated to:', userData.name);
        }

        Alert.alert('Login Successful', `Welcome back, ${userData.name || 'User'}!`);

        // Trigger the onAuthSuccess callback if provided
        if (onAuthSuccess) {
          onAuthSuccess();
        }
      } else {
        console.error('No user data found in Firestore.');
        Alert.alert('Login Failed', 'No user data found. Please contact support.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'An unknown error occurred.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
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
      <Button title="Login" onPress={handleLogin} />
      <TouchableOpacity onPress={() => onAuthSuccess && onAuthSuccess()}>
        <Text style={styles.loginText}>Don't Have an Account? Register here </Text>
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