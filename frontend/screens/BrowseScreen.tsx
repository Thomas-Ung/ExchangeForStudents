import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { db, auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { PostManager } from '../domain/managers/PostManager';
import { LinearGradient } from 'expo-linear-gradient';
import { sharedStyles, gradientColors } from './theme';

const BrowseScreen = ({ category }: { category?: string }) => {
  const [products, setProducts] = useState<
    { id: string; photo?: string; description?: string; category?: string; status?: string; seller?: string }[]
  >([]);
  const [filteredProducts, setFilteredProducts] = useState<typeof products>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const fetchedProducts = await PostManager.fetchPostsByCategory(category);
      const availableProducts = fetchedProducts.filter(
        (product) =>
          !product.status?.toLowerCase().includes('sold to') &&
          product.seller !== currentUser?.displayName
      );
      setProducts(availableProducts);
      setFilteredProducts(availableProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchProducts();
    }
  }, [currentUser, category]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = products.filter((product) =>
      product.description?.toLowerCase().includes(query)
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  if (loading) {
    return (
      <View style={sharedStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
          <Text style={sharedStyles.title}>
            {category ? `${category} Products` : 'All Products'}
          </Text>
          {currentUser && (
            <Text style={{ textAlign: 'center', marginBottom: 10, color: '#333' }}>
              Logged in as: {currentUser.displayName || currentUser.email || 'Anonymous'}
            </Text>
          )}
          <TextInput
            style={sharedStyles.input}
            placeholder="Search products..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={sharedStyles.button} onPress={fetchProducts}>
            <Text style={sharedStyles.buttonText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={sharedStyles.card}
              onPress={() => {
                router.push({
                  pathname: '/hidden/display',
                  params: { id: item.id },
                });
              }}
            >
              {item.photo ? (
                <Image source={{ uri: item.photo }} style={{ width: '100%', height: 120, borderRadius: 8 }} />
              ) : (
                <Text>No Image</Text>
              )}
              <Text style={{ marginTop: 8, fontWeight: '500', textAlign: 'center' }}>
                {item.description || 'No Description'}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

export default BrowseScreen;
