import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, View, Text, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Import Firebase services
import {doc, getDoc, collection, getDocs} from 'firebase/firestore';
import {db} from '../firebaseConfig';

export default function LoginScreen({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const userRef = doc(db, "Accounts", email);
      const userSnap = await getDoc(userRef);
      console.log(userSnap.data());
      if (userSnap.exists() && userSnap.data().password === password) {
        Alert.alert('Login Successful', `Welcome back, ${userSnap.data().name}!`);
        onAuthSuccess(); // Notify parent component of successful login
        router.push('/tabs/browse');
      } else {
        Alert.alert('Login Failed', 'Invalid email or password.');
      }
    } catch (error) {
      console.error("Login error:", error);
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
      <TouchableOpacity onPress={() => router.push('/register')}>
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