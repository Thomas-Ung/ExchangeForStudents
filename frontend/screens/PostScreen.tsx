// screens/PostScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

// Firebase config
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

// Firebase setup
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);
const auth = getAuth(app);

export default function PostScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadPost = async () => {
    if (!imageUri) {
      Alert.alert('No image selected');
      return;
    }

    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const filename = imageUri.substring(imageUri.lastIndexOf('/') + 1);
      const imageRef = ref(storage, `images/${filename}`);
      await uploadBytes(imageRef, blob);

      const downloadURL = await getDownloadURL(imageRef);
      const user = auth.currentUser;

      await addDoc(collection(db, 'Posts'), {
        caption,
        imageUrl: downloadURL,
        createdAt: Timestamp.now(),
        userId: user?.uid || 'anonymous',
      });

      Alert.alert('Post uploaded!');
      setImageUri(null);
      setCaption('');
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
});
