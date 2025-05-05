import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, View, Text, Alert, TouchableOpacity, Image } from 'react-native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function RegisterScreen({ onAuthSuccess }: { onAuthSuccess?: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: username });

      await setDoc(doc(db, 'Accounts', user.uid), {
        name: username,
        email: email,
        createdAt: new Date(),
        posts: [],
        interested: [],
      });

      Alert.alert('Registration Successful', `Welcome, ${username}!`);
      onAuthSuccess && onAuthSuccess();
    } catch (error) {
      Alert.alert('Registration Failed', error instanceof Error ? error.message : 'An unknown error occurred.');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Create Account</Text>
      <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onAuthSuccess && onAuthSuccess()}>
        <Text style={styles.linkText}>Already have an account? Login here</Text>
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
