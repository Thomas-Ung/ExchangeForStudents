import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { sharedStyles, gradientColors } from './theme';

const InterestedPosts = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const previousStatusesRef = useRef<{ [key: string]: string }>({});

  const fetchInterestedPosts = useCallback(async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;

      if (!user) {
        alert('You must be logged in to view your interested posts.');
        setLoading(false);
        return;
      }

      const userRef = doc(db, 'Accounts', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        alert('User document does not exist.');
        setPosts([]);
        setLoading(false);
        return;
      }

      const postIds = userSnap.data()?.interested || [];
      const chunkedIds = [];
      for (let i = 0; i < postIds.length; i += 10) {
        chunkedIds.push(postIds.slice(i, i + 10));
      }

      const fetchedPosts: any[] = [];
      for (const chunk of chunkedIds) {
        const q = query(collection(db, 'Posts'), where('__name__', 'in', chunk));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          fetchedPosts.push({ id: doc.id, ...doc.data() });
        });
      }

      setPosts(fetchedPosts);
      setLoading(false);
    } catch (err) {
      alert('Failed to fetch posts.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterestedPosts();
  }, [fetchInterestedPosts]);

  const renderPost = ({ item }: any) => (
    <View style={sharedStyles.card}>
      <Image
        source={{ uri: item.photo }}
        style={{ width: '100%', height: 150, borderRadius: 8 }}
      />
      <Text style={sharedStyles.caption}>{item.description || 'Untitled Post'}</Text>
      <Text style={{ marginVertical: 4 }}>
        Current Status: {item.status || 'Unknown'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={sharedStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <Text style={sharedStyles.title}>Posts I'm Interested In</Text>
        <TouchableOpacity style={sharedStyles.button} onPress={fetchInterestedPosts}>
          <Text style={sharedStyles.buttonText}>Refresh</Text>
        </TouchableOpacity>
        {posts.length === 0 ? (
          <Text style={{ marginTop: 20 }}>You have not expressed interest in any posts yet.</Text>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={renderPost}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>
    </LinearGradient>
  );
};

export default InterestedPosts;

