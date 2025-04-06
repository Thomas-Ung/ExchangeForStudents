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
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useRouter } from 'expo-router';

const BrowseScreen = ({ category }: { category?: string }) => {
  const [products, setProducts] = useState<
    { id: string; imageUrl?: string; caption?: string; price?: number; condition?: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      const baseQuery = collection(db, 'Posts');

      // If a category is provided, filter by category
      const productsQuery = category
        ? query(baseQuery, where('category', '==', category))
        : baseQuery;

      const querySnapshot = await getDocs(productsQuery);
      const fetchedProducts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(`Fetched products for category "${category || 'all'}":`, fetchedProducts);
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
        <Text style={styles.title}>
          {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Products` : 'Browse Products'}
        </Text>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              console.log('Navigating with item:', item);
              router.push({
                pathname: '/home/display',
                params: {
                  id: item.id,
                },
              });
            }}
          >
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
            ) : (
              <Text>No Image</Text>
            )}
            <Text style={styles.caption}>{item.caption || 'No Caption'}</Text>
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