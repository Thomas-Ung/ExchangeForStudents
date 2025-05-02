// app/(auth)/login.tsx
import React from 'react';
import LoginScreen from '../../screens/LoginScreen';
import { useRouter } from 'expo-router';

export const options = {
  title: '',
};

export default function Login() {
  const router = useRouter();

  const handleAuthSuccess = () => {
    console.log('Authentication successful');
    router.push('/tabs/browse');
  };

  return <LoginScreen onAuthSuccess={handleAuthSuccess} />;
}

