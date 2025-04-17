import React from 'react';
import LoginScreen from '../screens/LoginScreen';
import { useRouter } from 'expo-router';

export default function Login() {
  const router = useRouter();

  const handleAuthSuccess = () => {
    console.log('Authentication successful');
    router.push('/tabs/browse'); // Navigate to the Browse screen after successful login
  };

  return <LoginScreen onAuthSuccess={handleAuthSuccess} />;
}