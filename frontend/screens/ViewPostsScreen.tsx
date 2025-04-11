import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Install this library if not already installed
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, getDocs, query, where, updateDoc } from 'firebase/firestore';

const ViewPosts = () => {
  const [posts, setPosts] = useState<{ id: string; title?: string; status?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState<{ [key: string]: string }>({}); // Track statuses for each post

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          Alert.alert('Error', 'You must be logged in to view your posts.');
          console.log('No user is logged in.');
          return;
        }

        console.log('Fetching posts for user:', user.uid);

        // Reference to the user's document in the Accounts collection
        const userRef = doc(db, 'Accounts', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          Alert.alert('Error', 'User document does not exist.');
          console.log('User document does not exist in the Accounts collection.');
          return;
        }

        // Get the posts array from the user's document
        const userData = userSnap.data();
        console.log('User document data:', userData);

        const postIds = userData.posts || [];
        console.log('Post IDs from user document:', postIds);

        if (postIds.length === 0) {
          console.log('No posts found for this user.');
          setPosts([]); // No posts to display
          setLoading(false);
          return;
        }

        // Fetch the posts from the Posts collection
        const postsRef = collection(db, 'Posts');
        console.log('Fetching posts from Posts collection with IDs:', postIds);

        const q = query(postsRef, where('__name__', 'in', postIds)); // Use the post IDs to fetch posts
        const querySnapshot = await getDocs(q);

        console.log('Fetched posts snapshot:', querySnapshot.docs);

        const fetchedPosts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as { title?: string; status?: string; description?: string; photo?: string }),
        }));

        console.log('Fetched posts:', fetchedPosts);

        setPosts(fetchedPosts);

        // Initialize statuses for each post
        const initialStatuses: { [key: string]: string } = {};
        fetchedPosts.forEach((post) => {
          initialStatuses[post.id] = (post.status as string) || 'available';
        });
        setStatuses(initialStatuses);
      } catch (error) {
        console.error('Error fetching posts:', error);
        Alert.alert('Error', 'Failed to fetch posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, []);

  const updateStatus = async (postId: string, newStatus: string) => {
    try {
      const postRef = doc(db, 'Posts', postId);
      await updateDoc(postRef, { status: newStatus });
      setStatuses((prevStatuses) => ({
        ...prevStatuses,
        [postId]: newStatus,
      }));
      Alert.alert('Success', `Status updated to "${newStatus}"`);
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update status. Please try again.');
    }
  };

  const renderPost = ({ item }: any) => (
    <View style={styles.postCard}>
      <Image
        source={{ uri: item.photo }}
        style={styles.postImage}
        resizeMode="cover"
      />
      <Text style={styles.postTitle}>{item.description || 'Untitled Post'}</Text>
      <Text style={styles.postStatus}>Current Status: {statuses[item.id]}</Text>
      <Picker
        selectedValue={statuses[item.id]}
        onValueChange={(value) => updateStatus(item.id, value)}
        style={styles.picker}
      >
        <Picker.Item label="Available" value="available" />
        <Picker.Item label="On Hold" value="on hold" />
        <Picker.Item label="Sold" value="sold" />
      </Picker>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading your posts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Posts</Text>
      {posts.length === 0 ? (
        <Text>You have not uploaded any posts yet.</Text>
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
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginTop: 8,
  },
});

export default ViewPosts;