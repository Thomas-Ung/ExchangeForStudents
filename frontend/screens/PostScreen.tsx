import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  Alert,
  StyleSheet,
  ScrollView
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { createPostObject } from "../domain/services/PostFactory";

export default function PostScreen() {
  const [category, setCategory] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [condition, setCondition] = useState("Good");
  const [price, setPrice] = useState("");
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
    if (!category) {
      Alert.alert("Please select a category");
      return;
    }

    if (!imageUri) {
      Alert.alert("No image selected");
      return;
    }

    if (!price || isNaN(Number(price))) {
      Alert.alert("Invalid price", "Please enter a valid number.");
      return;
    }

    try {
      const filename = `${Date.now()}-${imageUri.substring(imageUri.lastIndexOf("/") + 1)}`;
      const storagePath = `Posts/${filename}`;
      const downloadURL = await uploadFile(imageUri, storagePath);

      const user = auth.currentUser;
      const postRef = collection(db, "Posts");

      await addDoc(postRef, {
        category,
        price: parseFloat(price),
        quality: condition,
        seller: user?.uid || "anonymous",
        description: caption,
        photo: downloadURL,
        postTime: Timestamp.now(),
        requesters: [], // Initialize with an empty array
        ...specificFields, // Include category-specific fields
      });

      Alert.alert("Post uploaded successfully!");
      setImageUri(null);
      setCaption("");
      setCondition("Good");
      setPrice("");
      setCategory(null);
      setSpecificFields({});
    } catch (err) {
      Alert.alert("Upload failed", err instanceof Error ? err.message : "Unknown error");
    }
  };

  const renderSpecificFields = () => {
    switch (category) {
      case "Book":
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={specificFields.title || ""}
              onChangeText={(value) => setSpecificFields({ ...specificFields, title: value })}
            />
            <TextInput
              style={styles.input}
              placeholder="Course Number"
              value={specificFields.courseNumber || ""}
              onChangeText={(value) => setSpecificFields({ ...specificFields, courseNumber: value })}
            />
          </>
        );
      case "Clothing":
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder="Color"
              value={specificFields.color || ""}
              onChangeText={(value) => setSpecificFields({ ...specificFields, color: value })}
            />
            <TextInput
              style={styles.input}
              placeholder="Size"
              value={specificFields.size || ""}
              onChangeText={(value) => setSpecificFields({ ...specificFields, size: value })}
            />
          </>
        );
      case "Furniture":
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder="Color"
              value={specificFields.color || ""}
              onChangeText={(value) => setSpecificFields({ ...specificFields, color: value })}
            />
            <TextInput
              style={styles.input}
              placeholder="Dimensions"
              value={specificFields.dimensions || ""}
              onChangeText={(value) => setSpecificFields({ ...specificFields, dimensions: value })}
            />
            <TextInput
              style={styles.input}
              placeholder="Weight"
              keyboardType="numeric"
              value={specificFields.weight || ""}
              onChangeText={(value) => setSpecificFields({ ...specificFields, weight: value })}
            />
          </>
        );
      case "Electronic":
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder="Model"
              value={specificFields.model || ""}
              onChangeText={(value) => setSpecificFields({ ...specificFields, model: value })}
            />
            <TextInput
              style={styles.input}
              placeholder="Dimensions"
              value={specificFields.dimensions || ""}
              onChangeText={(value) => setSpecificFields({ ...specificFields, dimensions: value })}
            />
            <TextInput
              style={styles.input}
              placeholder="Weight"
              keyboardType="numeric"
              value={specificFields.weight || ""}
              onChangeText={(value) => setSpecificFields({ ...specificFields, weight: value })}
            />
          </>
        );
      case "SportsGear":
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder="Type"
              value={specificFields.type || ""}
              onChangeText={(value) => setSpecificFields({ ...specificFields, type: value })}
            />
            <TextInput
              style={styles.input}
              placeholder="Weight"
              keyboardType="numeric"
              value={specificFields.weight || ""}
              onChangeText={(value) => setSpecificFields({ ...specificFields, weight: value })}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
    <View style={styles.container}>
      <Text style={styles.title}>Create a Post</Text>
      <Picker selectedValue={category} onValueChange={(value) => setCategory(value)}>
        <Picker.Item label="Select Category" value={null} />
        <Picker.Item label="Book" value="Book" />
        <Picker.Item label="Clothing" value="Clothing" />
        <Picker.Item label="Furniture" value="Furniture" />
        <Picker.Item label="Electronic" value="Electronic" />
        <Picker.Item label="Sports Gear" value="SportsGear" />
      </Picker>

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

      {renderSpecificFields()}

      <Button title="Upload Post" onPress={uploadPost} />
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    marginBottom: 10,
  },
  input: {
    marginTop: 10,
    padding: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
  },
  image: {
    width: "100%",
    height: 250,
    marginVertical: 15,
  },
  label: {
    marginTop: 10,
    fontWeight: "bold",
  },
});