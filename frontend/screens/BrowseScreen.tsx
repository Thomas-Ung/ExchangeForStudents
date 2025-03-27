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
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Import Firestore configuration
import { useRouter } from 'expo-router'; // Import useRouter for navigation

const BrowseScreen = () => {
  const [products, setProducts] = useState<{ id: string; imageUrl?: string; caption?: string; price?: number; condition?: string }[]>([]); // State to store products
  const [loading, setLoading] = useState(true); // State to manage loading state
  const router = useRouter(); // Initialize router for navigation

  // Fetch products from Firestore
  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'Posts')); // Fetch all documents from the 'Posts' collection
      const fetchedProducts = querySnapshot.docs.map((doc) => ({
        id: doc.id, // Use the document ID as the product ID
        ...doc.data(), // Spread the document data (e.g., imageUrl, caption, etc.)
      }));
      setProducts(fetchedProducts); // Update the state with fetched products
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false); // Stop the loading spinner
    }
  };

  // Fetch products when the component mounts
  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Browse Products</Text>
      </View>

      {/* Grid */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: '/display',
                params: {
                  imageUrl: item.imageUrl,
                  caption: item.caption,
                  price: item.price,
                  condition: item.condition,
                },
              })
            }
          >
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
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