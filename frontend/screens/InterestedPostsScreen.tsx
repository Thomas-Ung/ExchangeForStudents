import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';

const InterestedPosts = () => {
  const [posts, setPosts] = useState<{ id: string; title?: string; status?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInterestedPosts = useCallback(async () => {
    try {
      setLoading(true); // Show loading indicator while fetching data
      const user = auth.currentUser;

      if (!user) {
        Alert.alert('Error', 'You must be logged in to view your interested posts.');
        console.log('No user is logged in.');
        setLoading(false); // Stop loading if no user is logged in
        return;
      }

      console.log('Fetching interested posts for user:', user.uid);

      // Reference to the user's document in the Accounts collection
      const userRef = doc(db, 'Accounts', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        Alert.alert('Error', 'User document does not exist.');
        console.log('User document does not exist in the Accounts collection.');
        setPosts([]);
        setLoading(false);
        return;
      }

      // Get the interested array from the user's document
      const userData = userSnap.data();
      const postIds = userData.interested || []; // Fetch the interested field
      console.log('Post IDs from interested field:', postIds);

      if (postIds.length === 0) {
        console.log('No interested posts found for this user.');
        setPosts([]);
        setLoading(false);
        return;
      }

      // Split the postIds array into chunks of 10 (Firestore limitation)
      const chunkedPostIds = [];
      for (let i = 0; i < postIds.length; i += 10) {
        chunkedPostIds.push(postIds.slice(i, i + 10));
      }

      const fetchedPosts: any[] = [];

      // Fetch posts for each chunk of post IDs
      for (const chunk of chunkedPostIds) {
        const postsRef = collection(db, 'Posts');
        const q = query(postsRef, where('__name__', 'in', chunk));
        const querySnapshot = await getDocs(q);

        querySnapshot.docs.forEach((doc) => {
          fetchedPosts.push({
            id: doc.id,
            ...(doc.data() as { title?: string; status?: string; description?: string; photo?: string }),
          });
        });
      }

      console.log('Fetched posts:', fetchedPosts);

      // Update the posts
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching interested posts:', error);
      Alert.alert('Error', 'Failed to fetch interested posts. Please try again later.');
    } finally {
      setLoading(false); // Ensure loading is stopped in all cases
    }
  }, []);

  useEffect(() => {
    fetchInterestedPosts(); // Fetch posts on component mount
  }, [fetchInterestedPosts]);

  const renderPost = ({ item }: any) => (
    <View style={styles.postCard}>
      <Image
        source={{ uri: item.photo }}
        style={styles.postImage}
        resizeMode="cover"
      />
      <Text style={styles.postTitle}>{item.description || 'Untitled Post'}</Text>
      <Text style={styles.postStatus}>Current Status: {item.status || 'Unknown'}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading your interested posts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Posts I'm Interested In</Text>
      <TouchableOpacity style={styles.refreshButton} onPress={fetchInterestedPosts}>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
      {posts.length === 0 ? (
        <Text>You have not expressed interest in any posts yet.</Text>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  postCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 8,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  postStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  refreshButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 16,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default InterestedPosts;