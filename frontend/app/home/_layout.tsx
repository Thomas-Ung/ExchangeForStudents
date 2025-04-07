import React from 'react';
import { Drawer } from 'expo-router/drawer';

export default function DrawerLayout() {
  console.log("Rendering DrawerLayout");
  return (
    <Drawer>
      {/* Main Tabs */}
      <Drawer.Screen name="tabs" options={{ title: 'Home' }} />

      {/* Categories */}
      <Drawer.Screen name="book" options={{ title: 'Books' }} />
      <Drawer.Screen name="clothing" options={{ title: 'Clothing' }} />
      <Drawer.Screen name="electronics" options={{ title: 'Electronics' }} />
      <Drawer.Screen name="furniture" options={{ title: 'Furniture' }} />
      <Drawer.Screen name="sportsgear" options={{ title: 'Sports Gear' }} />
    </Drawer>
  );
}