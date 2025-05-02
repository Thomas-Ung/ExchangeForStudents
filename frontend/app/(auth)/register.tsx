// app/(auth)/register.tsx
import React from 'react';
import RegisterScreen from '../../screens/RegisterScreen';
import { useRouter } from 'expo-router';

export const options = {
  title: '',
};

export default function Register() {
  const router = useRouter();

  const handleAuthSuccess = () => {
    console.log('Registration successful');
    router.push('/tabs/browse');
  };

  return <RegisterScreen onAuthSuccess={handleAuthSuccess} />;
}
