import React from 'react';
import RegisterScreen from '../screens/RegisterScreen';

export default function Register() {
  return <RegisterScreen onAuthSuccess={() => console.log('Authentication successful')} />;
}