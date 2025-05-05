import React, { useState } from 'react';
import { StyleSheet, TextInput, View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export default function LoginScreen({ onAuthSuccess }: { onAuthSuccess?: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userRef = doc(db, 'Accounts', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.name) {
          await updateProfile(user, { displayName: userData.name });
        }
        Alert.alert('Login Successful', `Welcome back, ${userData.name || 'User'}!`);
        onAuthSuccess && onAuthSuccess();
      } else {
        Alert.alert('Login Failed', 'No user data found. Please contact support.');
      }
    } catch (error: unknown) {
      const messages: { [key: string]: string } = {
        'auth/user-not-found': 'No user found with this email.',
        'auth/invalid-email': 'The email address is invalid.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/invalid-credential': 'Invalid credentials.',
      };

      if (typeof error === 'object' && error !== null && 'code' in error && typeof (error as any).code === 'string') {
        const code = (error as any).code;
        Alert.alert('Login Failed', messages[code] || 'An unknown error occurred.');
      } else {
        Alert.alert('Login Failed', 'An unexpected error occurred.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Welcome Back</Text>
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
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onAuthSuccess && onAuthSuccess()}>
        <Text style={styles.linkText}>Don't Have an Account? Register here</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f0f4f8' },
  logo: { width: 300, height: 300, resizeMode: 'contain', alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  input: { height: 48, borderColor: '#ccc', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, marginBottom: 16, backgroundColor: '#fff' },
  button: { backgroundColor: '#4f46e5', padding: 15, borderRadius: 25, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkText: { marginTop: 16, color: '#4f46e5', textAlign: 'center', fontSize: 16 },
});
