import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, getDocs, query, where, updateDoc, deleteDoc, arrayRemove } from 'firebase/firestore';
import { useRouter } from 'expo-router';

const ViewPosts = () => {
  const [posts, setPosts] = useState<{ id: string; title?: string; status?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  const fetchUserPosts = async () => {
    try {
      setLoading(true); // Show loading indicator while fetching data
      const user = auth.currentUser;

      if (!user) {
        Alert.alert('Error', 'You must be logged in to view your posts.');
        console.log('No user is logged in.');
        return;
      }

      console.log('Fetching posts for user:', user.uid);

      const userRef = doc(db, 'Accounts', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        Alert.alert('Error', 'User document does not exist.');
        console.log('User document does not exist in the Accounts collection.');
        return;
      }

      const userData = userSnap.data();
      const postIds = userData.posts || [];
      console.log('Post IDs from user document:', postIds);

      if (postIds.length === 0) {
        console.log('No posts found for this user.');
        setPosts([]);
        setLoading(false);
        return;
      }

      const postsRef = collection(db, 'Posts');
      const q = query(postsRef, where('__name__', 'in', postIds));
      const querySnapshot = await getDocs(q);

      const fetchedPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as { title?: string; status?: string; description?: string; photo?: string }),
      }));

      console.log('Fetched posts:', fetchedPosts);

      setPosts(fetchedPosts);

      const initialStatuses: { [key: string]: string } = {};
      fetchedPosts.forEach((post) => {
        initialStatuses[post.id] = (post.status as string) || 'available';
      });
      setStatuses(initialStatuses);
    } catch (error) {
      console.error('Error fetching posts:', error);
      Alert.alert('Error', 'Failed to fetch posts. Please try again later.');
    } finally {
      setLoading(false); // Stop loading in all cases
    }
  };

  useEffect(() => {
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

  const handleDeletePost = async (postId: string) => {
    try {
      Alert.alert(
        'Confirm Delete',
        'Are you sure you want to delete this post?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              const postRef = doc(db, 'Posts', postId);
              const user = auth.currentUser;

              if (!user) {
                Alert.alert('Error', 'You must be logged in to delete a post.');
                return;
              }

              // Delete the post from Firestore
              await deleteDoc(postRef);

              // Remove the post ID from the user's "posts" array
              const userRef = doc(db, 'Accounts', user.uid);
              await updateDoc(userRef, {
                posts: arrayRemove(postId),
              });

              // Update the UI
              setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
              Alert.alert('Success', 'Post deleted successfully.');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error deleting post:', error);
      Alert.alert('Error', 'Failed to delete the post. Please try again.');
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
      </Picker>
      <TouchableOpacity
        style={styles.viewBuyersButton}
        onPress={() => router.push(`/hidden/ViewQueue?postId=${item.id}`)}
      >
        <Text style={styles.viewBuyersButtonText}>View Interested Buyers</Text>
      </TouchableOpacity>

      {/* Edit Button */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => router.push(`/hidden/display?postId=${item.id}`)} // Navigate to an edit screen
      >
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>

      {/* Delete Button */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeletePost(item.id)} // Call the delete function
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
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
      <TouchableOpacity style={styles.refreshButton} onPress={fetchUserPosts}>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
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
  viewBuyersButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  viewBuyersButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  editButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FFA500', // Orange color for edit
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FF0000', // Red color for delete
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ViewPosts;