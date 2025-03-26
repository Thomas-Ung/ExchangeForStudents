import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function PostScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [condition, setCondition] = useState('Good');
  const [price, setPrice] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const selectedImageUri = result.assets[0].uri;
      setImageUri(selectedImageUri);
      console.log("Selected Image URI:", selectedImageUri); // Log the selected image URI
    }
  };

  const uploadFile = async (localPath: string, storagePath: string): Promise<string> => {
    console.log("Uploading file to Firebase Storage:", localPath, "->", storagePath);
    try {
      const response = await fetch(localPath); // Fetch the file from the local URI
      const blob = await response.blob(); // Convert the file to a binary blob

      const storage = getStorage(); // Initialize Firebase Storage
      const fileRef = ref(storage, storagePath); // Create a reference to the file in Firebase Storage

      // Upload the file to Firebase Storage
      await uploadBytes(fileRef, blob);

      // Get the download URL of the uploaded file
      const downloadUrl = await getDownloadURL(fileRef);
      console.log("File uploaded successfully:", downloadUrl);
      return downloadUrl;
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  };

  const uploadPost = async () => {
    if (!imageUri) {
      Alert.alert('No image selected');
      return;
    }

    if (!price || isNaN(Number(price))) {
      Alert.alert('Invalid price', 'Please enter a valid number.');
      return;
    }

    try {
      const filename = imageUri.substring(imageUri.lastIndexOf('/') + 1); // Extract the filename
      const storagePath = `DemoPosts/${filename}`; // Define the storage path in Firebase Storage

      // Upload the file and get the download URL
      const downloadURL = await uploadFile(imageUri, storagePath);

      const user = auth.currentUser;

      // Save the post details to Firestore
      await addDoc(collection(db, 'Posts'), {
        caption,
        condition,
        price: parseFloat(price),
        imageUrl: downloadURL,
        createdAt: Timestamp.now(),
        userId: user?.uid || 'anonymous',
      });

      Alert.alert('Post uploaded successfully!');
      setImageUri(null);
      setCaption('');
      setCondition('Good');
      setPrice('');
    } catch (err) {
      console.error(err);
      Alert.alert('Upload failed', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a Post</Text>
      <Button title="Pick an image" onPress={pickImage} />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

      <TextInput
        style={styles.input}
        placeholder="Caption"
        value={caption}
        onChangeText={setCaption}
      />

      <TextInput
        style={styles.input}
        placeholder="Price ($)"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />

      <Text style={styles.label}>Condition:</Text>
      <TextInput
        style={styles.input}
        placeholder="Condition (e.g., Good, Fair, Bad)"
        value={condition}
        onChangeText={setCondition}
      />

      <Button title="Upload Post" onPress={uploadPost} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    marginBottom: 10,
  },
  input: {
    marginTop: 10,
    padding: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
  },
  image: {
    width: '100%',
    height: 250,
    marginVertical: 15,
  },
  label: {
    marginTop: 10,
    fontWeight: 'bold',
  },
});