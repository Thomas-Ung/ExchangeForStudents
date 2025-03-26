import React from 'react';
import LoginScreen from '../screens/LoginScreen';

export default function Login() {
  return <LoginScreen onAuthSuccess={() => console.log('Authentication successful')} />;
}