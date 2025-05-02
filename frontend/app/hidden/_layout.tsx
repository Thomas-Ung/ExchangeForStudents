import React from 'react';
import { Stack } from 'expo-router';

export default function HiddenLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Explicitly define the edit screen */}
      <Stack.Screen 
        name="edit" 
        options={{ 
          headerShown: true,
          title: 'Edit Post'
        }} 
      />
      {/* You can add other screens in the hidden folder here if needed */}
      <Stack.Screen name="ViewPosts" />
      <Stack.Screen name="display" />
      <Stack.Screen name="InterestsPosts" />
      <Stack.Screen name="ViewQueue" />
    </Stack>
  );
}