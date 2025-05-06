import React from 'react';
import { Drawer } from 'expo-router/drawer';

export default function DrawerLayout() {
  return (
    <Drawer>
      {/* Home screen for accessing the tab navigation */}
      <Drawer.Screen
        name="tabs"
        options={{
          title: 'Home',
        }}
      />

      {/* Categories */}
      <Drawer.Screen name="categories/book" options={{ title: 'Books' }} />
      <Drawer.Screen name="categories/clothing" options={{ title: 'Clothing' }} />
      <Drawer.Screen name="categories/electronics" options={{ title: 'Electronics' }} />
      <Drawer.Screen name="categories/furniture" options={{ title: 'Furniture' }} />
      <Drawer.Screen name="categories/sportsgear" options={{ title: 'Sports Gear' }} />

      {/* Explicitly hide these screens */}
      <Drawer.Screen
        name="index"
        options={{
          drawerItemStyle: { display: 'none' },
          headerShown: false, // Hides header title for index
        }}
      />
      <Drawer.Screen
        name="login"
        options={{
          drawerItemStyle: { display: 'none' },
          headerShown: false, // Hides header title for login
        }}
      />
      <Drawer.Screen
        name="hidden"
        options={{
          drawerItemStyle: { display: 'none' },
          headerShown: true, // Hides header title for hidden
          title: '' 
        }}
      />
      <Drawer.Screen
        name="register"
        options={{
          drawerItemStyle: { display: 'none' },
          headerShown: false, // Hides header title for register
        }}
      />
    </Drawer>
  );
}
