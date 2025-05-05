import React, { useState } from 'react';
import {
  Text,
  TextInput,
  Image,
  Alert,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  collection,
  addDoc,
  Timestamp,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';
import { sharedStyles, gradientColors } from './theme';

export default function PostScreen() {
  const [category, setCategory] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [condition, setCondition] = useState('Good');
  const [price, setPrice] = useState('');
  const [specificFields, setSpecificFields] = useState<Record<string, any>>({});

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

  const uploadFile = async (localPath: string, storagePath: string): Promise<string> => {
    const response = await fetch(localPath);
    const blob = await response.blob();
    const storage = getStorage();
    const fileRef = ref(storage, storagePath);
    await uploadBytes(fileRef, blob);
    return await getDownloadURL(fileRef);
  };

  const uploadPost = async () => {
    if (!category) return alert('Please select a category.');
    if (!imageUri) return alert('Please select an image.');
    if (!caption.trim()) return alert('Please enter a caption.');
    if (!price || isNaN(Number(price)) || Number(price) <= 0) return alert('Please enter a valid price.');
    if (!condition) return alert('Please select a condition.');

    try {
      const filename = `${Date.now()}-${imageUri.substring(imageUri.lastIndexOf('/') + 1)}`;
      const storagePath = `Posts/${filename}`;
      const downloadURL = await uploadFile(imageUri, storagePath);

      const user = auth.currentUser;
      if (!user) return alert('You must be logged in to upload a post.');

      const displayName = user.displayName || 'Anonymous';
      const postRef = collection(db, 'Posts');

      const postDoc = await addDoc(postRef, {
        category,
        price: parseFloat(price),
        quality: condition,
        seller: displayName,
        description: caption,
        photo: downloadURL,
        postTime: Timestamp.now(),
        requesters: [],
        status: 'available',
        ...specificFields,
      });

      const postId = postDoc.id;
      const userRef = doc(db, 'Accounts', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return alert('User document does not exist.');

      await updateDoc(userRef, {
        posts: arrayUnion(postId),
      });

      alert('Success: Post uploaded!');
      setImageUri(null);
      setCaption('');
      setCondition('Good');
      setPrice('');
      setCategory(null);
      setSpecificFields({});
    } catch (err) {
      console.error('Error uploading post:', err);
      alert('Upload failed: Unknown error');
    }
  };

  const renderSpecificFields = () => {
    switch (category) {
      case 'Book':
        return (
          <>
            <TextInput
              style={sharedStyles.input}
              placeholder="Title"
              value={specificFields.title || ''}
              onChangeText={(value) => setSpecificFields({ ...specificFields, title: value })}
            />
            <TextInput
              style={sharedStyles.input}
              placeholder="Course Number"
              value={specificFields.courseNumber || ''}
              onChangeText={(value) => setSpecificFields({ ...specificFields, courseNumber: value })}
            />
          </>
        );
      case 'Clothing':
        return (
          <>
            <TextInput
              style={sharedStyles.input}
              placeholder="Color"
              value={specificFields.color || ''}
              onChangeText={(value) => setSpecificFields({ ...specificFields, color: value })}
            />
            <TextInput
              style={sharedStyles.input}
              placeholder="Size"
              value={specificFields.size || ''}
              onChangeText={(value) => setSpecificFields({ ...specificFields, size: value })}
            />
          </>
        );
      case 'Furniture':
        return (
          <>
            <TextInput
              style={sharedStyles.input}
              placeholder="Color"
              value={specificFields.color || ''}
              onChangeText={(value) => setSpecificFields({ ...specificFields, color: value })}
            />
            <TextInput
              style={sharedStyles.input}
              placeholder="Dimensions"
              value={specificFields.dimensions || ''}
              onChangeText={(value) => setSpecificFields({ ...specificFields, dimensions: value })}
            />
            <TextInput
              style={sharedStyles.input}
              placeholder="Weight"
              keyboardType="numeric"
              value={specificFields.weight || ''}
              onChangeText={(value) => setSpecificFields({ ...specificFields, weight: value })}
            />
          </>
        );
      case 'Electronic':
        return (
          <>
            <TextInput
              style={sharedStyles.input}
              placeholder="Model"
              value={specificFields.model || ''}
              onChangeText={(value) => setSpecificFields({ ...specificFields, model: value })}
            />
            <TextInput
              style={sharedStyles.input}
              placeholder="Dimensions"
              value={specificFields.dimensions || ''}
              onChangeText={(value) => setSpecificFields({ ...specificFields, dimensions: value })}
            />
            <TextInput
              style={sharedStyles.input}
              placeholder="Weight"
              keyboardType="numeric"
              value={specificFields.weight || ''}
              onChangeText={(value) => setSpecificFields({ ...specificFields, weight: value })}
            />
          </>
        );
      case 'SportsGear':
        return (
          <>
            <TextInput
              style={sharedStyles.input}
              placeholder="Type"
              value={specificFields.type || ''}
              onChangeText={(value) => setSpecificFields({ ...specificFields, type: value })}
            />
            <TextInput
              style={sharedStyles.input}
              placeholder="Weight"
              keyboardType="numeric"
              value={specificFields.weight || ''}
              onChangeText={(value) => setSpecificFields({ ...specificFields, weight: value })}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={sharedStyles.container}>
        <Text style={sharedStyles.title}>Create a Post</Text>

        <View style={sharedStyles.card}>
          <Picker selectedValue={category} onValueChange={(value) => setCategory(value)}>
            <Picker.Item label="Select Category" value={null} />
            <Picker.Item label="Book" value="Book" />
            <Picker.Item label="Clothing" value="Clothing" />
            <Picker.Item label="Furniture" value="Furniture" />
            <Picker.Item label="Electronic" value="Electronic" />
            <Picker.Item label="Sports Gear" value="SportsGear" />
          </Picker>
        </View>

        <TouchableOpacity style={sharedStyles.button} onPress={pickImage}>
          <Text style={sharedStyles.buttonText}>Pick an Image</Text>
        </TouchableOpacity>

        {imageUri && <Image source={{ uri: imageUri }} style={{ width: '100%', height: 250, marginVertical: 15 }} />}

        <TextInput
          style={sharedStyles.input}
          placeholder="Caption"
          value={caption}
          onChangeText={setCaption}
        />

        <TextInput
          style={sharedStyles.input}
          placeholder="Price ($)"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        <View style={sharedStyles.card}>
          <Picker selectedValue={condition} onValueChange={(value) => setCondition(value)}>
            <Picker.Item label="Good" value="Good" />
            <Picker.Item label="Fair" value="Fair" />
            <Picker.Item label="Bad" value="Bad" />
          </Picker>
        </View>

        {renderSpecificFields()}

        <TouchableOpacity style={sharedStyles.button} onPress={uploadPost}>
          <Text style={sharedStyles.buttonText}>Upload Post</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}