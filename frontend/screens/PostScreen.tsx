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
import { collection, addDoc, Timestamp, doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
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
    // Validation for required fields
    if (!category) {
      alert("Error Please select a category.");
      return;
    }

    if (!imageUri) {
      alert("Error: Please select an image.");
      return;
    }

    if (!caption.trim()) {
      alert("Error: Please enter a caption.");
      return;
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      alert("Error: Please enter a valid price greater than 0.");
      return;
    }

    if (!condition) {
      alert("Error: Please select a condition.");
      return;
    }

    // Additional validation for specific fields based on category
    if (category === "Book" && (!specificFields.title || !specificFields.courseNumber)) {
      alert("Error: Please fill out the title and course number for the book.");
      return;
    }

    if (category === "Clothing" && (!specificFields.color || !specificFields.size)) {
      alert("Error: Please fill out the color and size for the clothing.");
      return;
    }

    if (category === "Furniture" && (!specificFields.color || !specificFields.dimensions || !specificFields.weight)) {
      alert("Error: Please fill out the color, dimensions, and weight for the furniture.");
      return;
    }

    if (category === "Electronic" && (!specificFields.model || !specificFields.dimensions || !specificFields.weight)) {
      alert("Error: Please fill out the model, dimensions, and weight for the electronic item.");
      return;
    }

    if (category === "SportsGear" && (!specificFields.type || !specificFields.weight)) {
      alert("Error: Please fill out the type and weight for the sports gear.");
      return;
    }

    try {
      const filename = `${Date.now()}-${imageUri.substring(imageUri.lastIndexOf("/") + 1)}`;
      const storagePath = `Posts/${filename}`;
      const downloadURL = await uploadFile(imageUri, storagePath);

      const user = auth.currentUser;

      if (!user) {
        alert("Error: You must be logged in to upload a post.");
        return;
      }

      const displayName = user.displayName || "Anonymous";

      const postRef = collection(db, "Posts");

      // Add the post to the "Posts" collection
      const postDoc = await addDoc(postRef, {
        category,
        price: parseFloat(price),
        quality: condition,
        seller: displayName, // Use the user's display name
        description: caption,
        photo: downloadURL,
        postTime: Timestamp.now(),
        requesters: [], // Initialize with an empty array
        status: "available", // Add the "status" field with a default value of "available"
        ...specificFields, // Include category-specific fields
      });

      // Get the post ID
      const postId = postDoc.id;

      // Reference to the user's document
      const userRef = doc(db, "Accounts", user.uid);

      // Check if the user's document exists
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.error("User document does not exist. Ensure it is created during registration.");
        alert("Error: User document does not exist. Please contact support.");
        return;
      }

      // Update the user's document to include the post ID in the "posts" array
      await updateDoc(userRef, {
        posts: arrayUnion(postId), // Add the post ID to the "posts" array
      });

      // Clear the fields after a successful upload
      alert("Success: Post uploaded successfully!");
      setImageUri(null);
      setCaption("");
      setCondition("Good");
      setPrice("");
      setCategory(null);
      setSpecificFields({});
    } catch (err) {
      console.error("Error uploading post:", err);
      alert("Upload failed: Unknown error");
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
        <Picker
          selectedValue={condition}
          onValueChange={(value) => setCondition(value)}
        >
          <Picker.Item label="Good" value="Good" />
          <Picker.Item label="Fair" value="Fair" />
          <Picker.Item label="Bad" value="Bad" />
        </Picker>

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