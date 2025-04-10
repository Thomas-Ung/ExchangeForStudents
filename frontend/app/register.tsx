import React from 'react';
import RegisterScreen from '../screens/RegisterScreen';
import { useRouter } from 'expo-router';

export default function Register() {
  const router = useRouter();

  const handleAuthSuccess = () => {
    console.log('Registration successful');
    router.push('/tabs/browse'); // Navigate to the Browse screen after successful registration
  };

  return <RegisterScreen onAuthSuccess={handleAuthSuccess} />;
}