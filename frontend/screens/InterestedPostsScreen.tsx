import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';

const InterestedPosts = () => {
  const [posts, setPosts] = useState<{ id: string; title?: string; status?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const previousStatusesRef = useRef<{ [key: string]: string }>({}); // useRef instead of useState

  const fetchInterestedPosts = useCallback(async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;

      if (!user) {
        alert('Error: You must be logged in to view your interested posts.');
        console.log('No user is logged in.');
        setLoading(false);
        return;
      }

      console.log('Fetching interested posts for user:', user.uid);

      const userRef = doc(db, 'Accounts', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        alert('Error: User document does not exist.');
        console.log('User document does not exist in the Accounts collection.');
        setPosts([]);
        setLoading(false);
        return;
      }

      const userData = userSnap.data();
      const postIds = userData.interested || [];
      console.log('Post IDs from interested field:', postIds);

      if (postIds.length === 0) {
        console.log('No interested posts found for this user.');
        setPosts([]);
        setLoading(false);
        return;
      }

      const chunkedPostIds = [];
      for (let i = 0; i < postIds.length; i += 10) {
        chunkedPostIds.push(postIds.slice(i, i + 10));
      }

      const fetchedPosts: any[] = [];

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

      const newStatuses: { [key: string]: string } = {};
      const currentUser = auth.currentUser?.displayName || 'You';

      fetchedPosts.forEach((post) => {
        const previousStatus = previousStatusesRef.current[post.id];

        if (previousStatus && previousStatus !== post.status) {
          alert(
            `The status of the post "${post.description || 'Untitled Post'}" has changed to: ${post.status}`
          );
        }

        if (post.status === `Sold to: ${currentUser}`) {
          alert(
            `The post "${post.description || 'Untitled Post'}" has been sold to you!`
          );
        }

        newStatuses[post.id] = post.status || 'Unknown';
      });

      previousStatusesRef.current = newStatuses; // update ref only
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching interested posts:', error);
      alert('Error: Failed to fetch interested posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []); // empty dependency list

  useEffect(() => {
    fetchInterestedPosts();
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
    backgroundColor: '#f5f8fa', // soft off-white background
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#003366', // navy header
    textAlign: 'center',
  },
  postCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#d0d7de',
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
    color: '#003366', // navy title
  },
  postStatus: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 8,
  },
  refreshButton: {
    backgroundColor: '#003366', // deep navy button
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 16,
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});


export default InterestedPosts;
