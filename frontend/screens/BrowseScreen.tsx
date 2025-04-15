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
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { db, auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { PostManager } from '../domain/managers/PostManager';

const BrowseScreen = ({ category }: { category?: string }) => {
  const [products, setProducts] = useState<
    { id: string; photo?: string; description?: string; category?: string; status?: string }[]
  >([]);
  const [filteredProducts, setFilteredProducts] = useState<typeof products>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('Authenticated user:', {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Anonymous',
        });
        setCurrentUser(user);
      } else {
        console.log('No user is currently authenticated.');
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const fetchedProducts = await PostManager.fetchPostsByCategory(category);

      // Filter out products with "Sold to" in the status field
      const availableProducts = fetchedProducts.filter(
        (product) => !product.status?.includes('Sold to:')
      );

      console.log('Filtered products:', availableProducts);
      setProducts(availableProducts);
      setFilteredProducts(availableProducts); // Set initially
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = products.filter((product) =>
      product.description?.toLowerCase().includes(query)
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

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
        <Text style={styles.title}>
          {category ? `${category} Products` : 'All Products'}
        </Text>
        {currentUser && (
          <Text style={styles.userInfo}>
            Logged in as: {currentUser.displayName || currentUser.email || 'Anonymous'}
          </Text>
        )}

        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              router.push({
                pathname: '/hidden/display',
                params: { id: item.id },
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
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  userInfo: {
    marginTop: 8,
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  searchBarContainer: {
    marginTop: 12,
    paddingHorizontal: 8,
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    width: '100%',
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
