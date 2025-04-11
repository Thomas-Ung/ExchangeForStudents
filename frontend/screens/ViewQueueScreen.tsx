import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

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
        // Fetch requesters logic here
      } catch (error) {
        console.error('Error fetching requesters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequesters();
  }, [postId]);

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
      <Text>Post ID: {postId}</Text>
      {/* Render the list of requesters here */}
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
});

export default ViewQueueScreen;