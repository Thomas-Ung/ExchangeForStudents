import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView } from 'react-native';
import { useLocalSearchParams } from 'expo-router'; // Import useLocalSearchParams to retrieve route parameters

const DisplayScreen = () => {
  const { imageUrl, caption, price, condition } = useLocalSearchParams(); // Retrieve post data from route parameters

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Post Details</Text>
      </View>

      {/* Post Details */}
      <View style={styles.card}>
        {typeof imageUrl === 'string' && (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        )}
        <Text style={styles.caption}>{caption || 'No Caption'}</Text>
        <Text style={styles.info}>Price: ${price || 'N/A'}</Text>
        <Text style={styles.info}>Condition: {condition || 'N/A'}</Text>
      </View>
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
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
    marginBottom: 8,
  },
  caption: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  info: {
    fontSize: 14,
    color: '#555',
  },
});

export default DisplayScreen;