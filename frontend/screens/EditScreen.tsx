import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db } from '../firebaseConfig'; // Import Firebase services
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';

const EditScreen = () => {
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [category, setCategory] = useState('');
  const router = useRouter();

  // Debugging
  console.log('EditScreen: ID parameter received:', id);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        console.log('Fetching post with ID:', id);
        if (typeof id === 'string') {
          const docRef = doc(db, 'Posts', id); // Reference the document by ID
          const docSnap = await getDoc(docRef); // Fetch the document
          if (docSnap.exists()) {
            const postData = docSnap.data();
            console.log('Fetched post data:', postData);
            setPost({ id: docRef.id, ...postData }); // Explicitly set the ID
            setDescription(postData.description || '');
            setPrice(postData.price?.toString() || '');
            setCondition(postData.condition || '');
            setCategory(postData.category || '');
          } else {
            console.warn('No post found with that ID.');
          }
        } else {
          console.error('Invalid ID parameter:', id);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleSaveChanges = async () => {
    try {
      // Add debugging to see what values we're checking
      console.log("Validation values:", {
        description: description,
        price: price,
        condition: condition,
        category: category
      });

      // Improved validation logic
      let errors = [];
      if (!description || !description.trim()) errors.push("description");
      if (!price || !price.trim()) errors.push("price");
      if (!condition) errors.push("condition");
      if (!category) errors.push("category");

      if (errors.length > 0) {
        console.log("Missing fields:", errors);
        alert(`Error: Please fill out all fields before saving. Missing: ${errors.join(", ")}`);
        return;
      }

      const docRef = doc(db, 'Posts', id as string); // Reference the document by ID
      await updateDoc(docRef, {
        description,
        price: parseFloat(price),
        condition,
        category,
      });

      alert('Post updated successfully!');
      router.back();
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update the post. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Post not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Edit Post</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Description:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter description"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={styles.label}>Price ($):</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter price"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />

          <Text style={styles.label}>Condition:</Text>
          <Picker
            selectedValue={condition}
            onValueChange={(value) => setCondition(value)}
            style={styles.picker}
          >
            <Picker.Item label="Good" value="Good" />
            <Picker.Item label="Fair" value="Fair" />
            <Picker.Item label="Bad" value="Bad" />
          </Picker>

          <Text style={styles.label}>Category:</Text>
          <Picker
            selectedValue={category}
            onValueChange={(value) => setCategory(value)}
            style={styles.picker}
          >
            <Picker.Item label="Book" value="Book" />
            <Picker.Item label="Clothing" value="Clothing" />
            <Picker.Item label="Furniture" value="Furniture" />
            <Picker.Item label="Electronic" value="Electronic" />
            <Picker.Item label="Sports Gear" value="SportsGear" />
          </Picker>

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    marginBottom: 12,
    padding: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
  },
  picker: {
    marginBottom: 12,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
  },
  saveButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EditScreen;
