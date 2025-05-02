import React from 'react';
import { Drawer } from 'expo-router/drawer';

export default function DrawerLayout() {
  return (
    <Drawer>
      <Drawer.Screen name="tabs" options={{ title: 'Home' }} />
      <Drawer.Screen name="categories/book" options={{ title: 'Books' }} />
      <Drawer.Screen name="categories/clothing" options={{ title: 'Clothing' }} />
      <Drawer.Screen name="categories/electronics" options={{ title: 'Electronics' }} />
      <Drawer.Screen name="categories/furniture" options={{ title: 'Furniture' }} />
      <Drawer.Screen name="categories/sportsgear" options={{ title: 'Sports Gear' }} />
      <Drawer.Screen
        name="hidden"
        options={{ drawerItemStyle: { display: 'none' }, title: 'Home' }}
      />
      <Drawer.Screen
        name="(auth)"
        options={{ drawerItemStyle: { display: 'none' }, headerShown: false }}
      />
    </Drawer>
  );
}
