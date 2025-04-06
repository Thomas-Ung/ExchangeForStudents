import React from 'react';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  console.log("Rendering TabsLayout");
  return (
    <Tabs>
      <Tabs.Screen name="browse" options={{ title: 'Browse Items' }} />
      <Tabs.Screen name="post" options={{ title: 'Create Post' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
