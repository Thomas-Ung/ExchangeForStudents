import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { db, auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth'; // Import the listener
import { PostManager } from '../domain/managers/PostManager';

const BrowseScreen = ({ category }: { category?: string }) => {
  const [products, setProducts] = useState<
    { id: string; photo?: string; description?: string; category?: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null); // Track the authenticated user
  const router = useRouter();

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('Authenticated user:', {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Anonymous',
        });
        setCurrentUser(user); // Set the authenticated user
      } else {
        console.log('No user is currently authenticated.');
        setCurrentUser(null); // Clear the user state
      }
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const fetchedProducts = await PostManager.fetchPostsByCategory(category);
      console.log('Fetched products:', fetchedProducts);
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{category ? `${category} Products` : 'All Products'}</Text>
        {currentUser && (
          <Text style={styles.userInfo}>
            Logged in as: {currentUser.displayName || currentUser.email || 'Anonymous'}
          </Text>
        )}
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              router.push({
                pathname: '/hidden/display',
                params: {
                  id: item.id, // Pass the post ID to the DisplayScreen
                },
              });
              console.log('Navigating to DisplayScreen with ID:', item.id);
            }}
          >
            {item.photo ? (
              <Image source={{ uri: item.photo }} style={styles.image} />
            ) : (
              <Text>No Image</Text>
            )}
            <Text style={styles.caption}>{item.description || 'No Description'}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.grid}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  userInfo: {
    marginTop: 8,
    fontSize: 14,
    color: '#555',
  },
  grid: {
    paddingHorizontal: 12,
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    padding: 10,
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  caption: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BrowseScreen;