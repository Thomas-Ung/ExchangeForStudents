import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const DisplayScreen = () => {
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (typeof id === 'string') {
          const docRef = doc(db, 'Posts', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setPost(docSnap.data());
            console.log('Fetched post:', docSnap.data());
          } else {
            console.warn('No post found with that ID.');
          }
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Post not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Post Details</Text>
      </View>

      <View style={styles.card}>
        {post.photo ? (
          <Image
            source={{ uri: post.photo }}
            style={styles.image}
            onError={(error) =>
              console.error('Image failed to load:', error.nativeEvent.error)
            }
          />
        ) : (
          <Text>No Image Available</Text>
        )}
        <Text style={styles.caption}>{post.description || 'No Description'}</Text>
        <Text style={styles.info}>Price: ${post.price || 'N/A'}</Text>
        <Text style={styles.info}>Condition: {post.condition || 'N/A'}</Text>
        <Text style={styles.info}>Category: {post.category || 'N/A'}</Text>

        {/* Dynamically render additional attributes */}
        {Object.keys(post).map((key) => {
          if (!['id', 'photo', 'description', 'price', 'condition', 'category'].includes(key)) {
            const value = post[key];

            // Check if the value is a Firestore Timestamp
            if (value && value.seconds && value.nanoseconds) {
              const date = new Date(value.seconds * 1000); // Convert seconds to milliseconds
              return (
                <Text key={key} style={styles.info}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}: {date.toLocaleString()}
                </Text>
              );
            }

            // Render other values as strings
            return (
              <Text key={key} style={styles.info}>
                {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
              </Text>
            );
          }
          return null;
        })}
      </View>
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
  card: {
    margin: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    padding: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
    marginBottom: 8,
  },
  caption: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  info: {
    fontSize: 14,
    color: '#555',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DisplayScreen;