import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { db, auth } from '../firebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { sharedStyles, gradientColors } from './theme';

const DisplayScreen = () => {
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const handleInterestedClick = async (postId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('You need to be logged in to express interest.');
        return;
      }
      const userName = user.displayName || 'Anonymous';
      const postRef = doc(db, 'Posts', postId);
      const userRef = doc(db, 'Accounts', user.uid);
      await updateDoc(postRef, { requesters: arrayUnion(userName) });
      await updateDoc(userRef, { interested: arrayUnion(postId) });
      alert('Your interest has been recorded!');
    } catch {
      alert('Failed to express interest.');
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (typeof id === 'string') {
          const docRef = doc(db, 'Posts', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setPost({ id: docRef.id, ...docSnap.data() });
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <View style={sharedStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={sharedStyles.loadingContainer}>
        <Text>Post not found.</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}>
          <Text style={sharedStyles.title}>Post Details</Text>
          <View style={sharedStyles.card}>
            {post.photo ? (
              <Image source={{ uri: post.photo }} style={{ width: '100%', height: 200, borderRadius: 8 }} />
            ) : (
              <Text>No Image Available</Text>
            )}
            <Text style={sharedStyles.caption}>{post.description || 'No Description'}</Text>
            <Text style={{ marginVertical: 4 }}>Price: ${post.price || 'N/A'}</Text>
            <Text style={{ marginVertical: 4 }}>Condition: {post.condition || 'N/A'}</Text>
            <Text style={{ marginVertical: 4 }}>Category: {post.category || 'N/A'}</Text>
            {Object.keys(post).map((key) => {
              if (!['id', 'photo', 'description', 'price', 'condition', 'category'].includes(key)) {
                const value = post[key];
                if (value?.seconds) {
                  const date = new Date(value.seconds * 1000);
                  return (
                    <Text key={key} style={{ marginVertical: 4 }}>
                      {key}: {date.toLocaleString()}
                    </Text>
                  );
                }
                return (
                  <Text key={key} style={{ marginVertical: 4 }}>
                    {key}: {value}
                  </Text>
                );
              }
              return null;
            })}
            <TouchableOpacity
              style={sharedStyles.button}
              onPress={() => handleInterestedClick(post.id)}
            >
              <Text style={sharedStyles.buttonText}>I'm Interested</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default DisplayScreen;
