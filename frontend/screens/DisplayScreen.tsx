import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Alert } from 'react-native';
import { db, auth } from '../firebaseConfig'; // Import Firebase services
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore"; // Add this import

// Add this function to handle "I'm Interested" clicks
const handleInterestedClick = async (postId: string) => {
  try {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("You need to be logged in to express interest.");
      return;
    }

    const userName = user.displayName || "Anonymous"; // Get the user's name or fallback to "Anonymous"
    const postRef = doc(db, "Posts", postId); // Reference the specific post document
    const userRef = doc(db, "Accounts", user.uid); // Reference the user's document in the Accounts collection
    await updateDoc(postRef, {
      requesters: arrayUnion(userName), // Add the user's name to the requesters array
    });
    await updateDoc(userRef, {
      interested: arrayUnion(postId), // Add the post ID to the interested array
    })

    Alert.alert("Your interest has been recorded!");
  } catch (err) {
    Alert.alert("Failed to express interest", err instanceof Error ? err.message : "Unknown error");
  }
};

const DisplayScreen = () => {
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (typeof id === 'string') {
          const docRef = doc(db, 'Posts', id); // Reference the document by ID
          const docSnap = await getDoc(docRef); // Fetch the document
          if (docSnap.exists()) {
            setPost({ id: docRef.id, ...docSnap.data() }); // Explicitly set the ID
            console.log('Fetched post:', { id: docRef.id, ...docSnap.data() });
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
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
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
            if (
              !['id', 'photo', 'description', 'price', 'condition', 'category'].includes(key)
            ) {
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

          {/* "I'm Interested" Button */}
          <TouchableOpacity
            style={styles.interestButton}
            onPress={() => {
              const user = auth.currentUser;
              const userName = user?.displayName || "Anonymous"; // Get the user's name or fallback to "Anonymous"

              alert("You've been added to the queue!");
              handleInterestedClick(post.id);
              console.log('Current user:', auth.currentUser);
              console.log(`${userName} expressed interest in post with ID: ${post.id}`);
            }}
          >
            <Text style={styles.buttonText}>I'm Interested</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  interestButton: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DisplayScreen;
