import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, ActivityIndicator, Button, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const AccountScreen = () => {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (typeof userId === 'string') {
          const userRef = doc(db, 'Users', userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUser(userSnap.data());
          } else {
            console.warn('No user found with that ID.');
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleViewPosts = async () => {
    try {
      if (typeof userId === 'string') {
        const postsRef = collection(db, 'Posts');
        const q = query(postsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const userPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPosts(userPosts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleEditPost = (postId: string) => {
    router.push(`/editPost/${postId}`); // assuming you have an editPost screen
  };

  const handleViewQueue = (postId: string) => {
    router.push(`/viewQueue/${postId}`); // assuming you have a viewQueue screen
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>User not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Account Details</Text>
        </View>

        <View style={styles.card}>
          {user.profilePictureUrl ? (
            <Image
              source={{ uri: user.profilePictureUrl }}
              style={styles.image}
            />
          ) : (
            <Text>No Profile Picture</Text>
          )}
          <Text style={styles.name}>{user.username || 'Unnamed User'}</Text>
          <Text style={styles.info}>Email: {user.email || 'N/A'}</Text>
          <Text style={styles.info}>Bio: {user.bio || 'No bio provided.'}</Text>
        </View>

        {/* Button to view posts */}
        <View style={styles.buttonContainer}>
          <Button title="View My Posts" onPress={handleViewPosts} />
        </View>

        {/* List of user's posts */}
        {posts.length > 0 && (
          <View style={styles.postsContainer}>
            <Text style={styles.postsTitle}>My Posts:</Text>
            {posts.map((post) => (
              <View key={post.id} style={styles.postCard}>
                <Text style={styles.postCaption}>{post.caption || 'No caption'}</Text>
                <Text>Status: {post.status || 'Unknown'}</Text>
                <Button title="Edit Post" onPress={() => handleEditPost(post.id)} />
                <Button title="View Queue" onPress={() => handleViewQueue(post.id)} />
              </View>
            ))}
          </View>
        )}
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
    alignItems: 'center',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    resizeMode: 'cover',
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  info: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  postsContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  postsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  postCard: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  postCaption: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
});

export default AccountScreen;
