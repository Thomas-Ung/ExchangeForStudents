import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { db } from '../firebaseConfig';
import { sharedStyles, gradientColors } from './theme';

const ViewQueueScreen = () => {
  const { postId } = useLocalSearchParams();
  const [requesters, setRequesters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequesters = useCallback(async () => {
    if (!postId) {
      console.error('No postId provided');
      return;
    }

    try {
      setLoading(true);
      const postRef = doc(db, 'Posts', Array.isArray(postId) ? postId[0] : postId);
      const postSnap = await getDoc(postRef);

      if (!postSnap.exists()) {
        console.error('Post does not exist');
        setRequesters([]);
        return;
      }

      const postData = postSnap.data();
      setRequesters(postData?.requesters || []);
    } catch (error) {
      console.error('Error fetching requesters:', error);
      Alert.alert('Error', 'Failed to fetch requesters.');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchRequesters();
  }, [fetchRequesters]);

  const handleAccept = async (buyer: string) => {
    try {
      const postRef = doc(db, 'Posts', Array.isArray(postId) ? postId[0] : postId);
      await updateDoc(postRef, { status: `Sold to: ${buyer}` });
      Alert.alert('Accepted', `${buyer}'s request has been accepted.`);
      fetchRequesters();
    } catch (error) {
      Alert.alert('Error', 'Failed to accept the request.');
    }
  };

  const handleDeny = async (buyer: string) => {
    try {
      const postRef = doc(db, 'Posts', Array.isArray(postId) ? postId[0] : postId);
      await updateDoc(postRef, { requesters: arrayRemove(buyer) });
      Alert.alert('Denied', `${buyer}'s request has been denied.`);
      fetchRequesters();
    } catch (error) {
      Alert.alert('Error', 'Failed to deny the request.');
    }
  };

  return (
    <LinearGradient colors={gradientColors} style={{ flex: 1, padding: 16 }}>
      <Text style={sharedStyles.title}>Interested Buyers</Text>
      <TouchableOpacity style={sharedStyles.button} onPress={fetchRequesters}>
        <Text style={sharedStyles.buttonText}>Refresh</Text>
      </TouchableOpacity>

      {loading ? (
        <Text>Loading requesters...</Text>
      ) : requesters.length === 0 ? (
        <Text>No interested buyers for this post.</Text>
      ) : (
        <FlatList
          data={requesters}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={sharedStyles.card}>
              <Text style={sharedStyles.caption}>{item}</Text>
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <TouchableOpacity
                  style={[sharedStyles.button, { marginRight: 10 }]}
                  onPress={() => handleAccept(item)}
                >
                  <Text style={sharedStyles.buttonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[sharedStyles.button, { backgroundColor: '#FF5252' }]}
                  onPress={() => handleDeny(item)}
                >
                  <Text style={sharedStyles.buttonText}>Deny</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </LinearGradient>
  );
};

export default ViewQueueScreen;
