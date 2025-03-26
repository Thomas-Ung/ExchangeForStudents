import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, View, Text, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig'; // Import Firebase services

interface RegisterScreenProps {
  onAuthSuccess: () => void;
}

export default function RegisterScreen({ onAuthSuccess }: RegisterScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const router = useRouter(); // Use Expo Router's navigation

  const handleRegister = async () => {
    try {
      const userRef = doc(db, "Accounts", username);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        Alert.alert("Error", "User with this username already exists.");
      } else {
        const newUser = {
          name: username,
          password: password,
        };
        await setDoc(userRef, newUser);
        Alert.alert('Registration Successful', `Welcome, ${username}!`);
        onAuthSuccess(); // Notify parent component of successful registration
        router.push('./tabs');
      }
    } catch (error) {
      console.error("Error during registration:", error);
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
      <TouchableOpacity onPress={() => router.push('/login')}>
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