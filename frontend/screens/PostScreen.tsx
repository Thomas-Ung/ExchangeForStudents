import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker'; // 👈 Add this for dropdown
import { useRouter } from 'expo-router';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, storage } from '../firebaseConfig'; // Import Firebase services

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
      setImageUri(result.assets[0].uri);
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
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const filename = imageUri.substring(imageUri.lastIndexOf('/') + 1);
      const imageRef = ref(storage, `images/${filename}`);
      await uploadBytes(imageRef, blob);

      const downloadURL = await getDownloadURL(imageRef);
      const user = auth.currentUser;

      await addDoc(collection(db, 'Posts'), {
        caption,
        condition,
        price: parseFloat(price),
        imageUrl: downloadURL,
        createdAt: Timestamp.now(),
        userId: user?.uid || 'anonymous',
      });

      Alert.alert('Post uploaded!');
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
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={condition}
          onValueChange={(itemValue) => setCondition(itemValue)}
        >
          <Picker.Item label="Good" value="Good" />
          <Picker.Item label="Fair" value="Fair" />
          <Picker.Item label="Bad" value="Bad" />
        </Picker>
      </View>

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
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginTop: 5,
    marginBottom: 20,
  },
});