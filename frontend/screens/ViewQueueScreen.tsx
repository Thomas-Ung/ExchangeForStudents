import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const ViewQueueScreen = () => {
  const { postId } = useLocalSearchParams(); // Retrieve postId from the query string
  const [requesters, setRequesters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequesters = async () => {
      if (!postId) {
        console.error('No postId provided');
        return;
      }

      try {
        console.log('Fetching requesters for postId:', postId);

        // Fetch the post document from Firestore
        const postRef = doc(db, 'Posts', Array.isArray(postId) ? postId[0] : postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
          console.error('Post does not exist');
          return;
        }

        const postData = postSnap.data();
        console.log('Post data:', postData);

        // Extract the requesters field
        const requestersList = postData?.requesters || [];
        setRequesters(requestersList);
      } catch (error) {
        console.error('Error fetching requesters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequesters();
  }, [postId]);

  const handleAccept = async (buyer: string) => {
    try {
      const postRef = doc(db, 'Posts', Array.isArray(postId) ? postId[0] : postId);

      // Update the status field to "Sold to: {buyer's username}"
      await updateDoc(postRef, {
        status: `Sold to: ${buyer}`,
      });

      console.log('Accepted', `${buyer}'s request has been accepted. The post is now marked as sold.`);
    } catch (error) {
      console.error('Error accepting request:', error);
      Alert.alert('Error', 'Failed to accept the request.');
    }
  };

  const handleDeny = async (buyer: string) => {
    try {
      const postRef = doc(db, 'Posts', Array.isArray(postId) ? postId[0] : postId);

      // Remove the buyer from the requesters array in Firestore
      await updateDoc(postRef, {
        requesters: arrayRemove(buyer),
      });

      // Update the local state to reflect the change
      setRequesters((prevRequesters) => prevRequesters.filter((requester) => requester !== buyer));

      Alert.alert('Denied', `${buyer}'s request has been denied.`);
    } catch (error) {
      console.error('Error denying request:', error);
      Alert.alert('Error', 'Failed to deny the request.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading requesters...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Interested Buyers</Text>
      {requesters.length === 0 ? (
        <Text>No interested buyers for this post.</Text>
      ) : (
        <FlatList
          data={requesters}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.requesterCard}>
              <Text style={styles.requesterName}>{item}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => handleAccept(item)}
                >
                  <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.denyButton}
                  onPress={() => handleDeny(item)}
                >
                  <Text style={styles.buttonText}>Deny</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
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
  requesterCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requesterName: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  denyButton: {
    backgroundColor: '#FF5252',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ViewQueueScreen;