import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { auth } from "../firebaseConfig";
import { PostManager } from "../domain/managers/PostManager";

export default function PostScreen() {
  const [category, setCategory] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [condition, setCondition] = useState("Good");
  const [price, setPrice] = useState("");
  const [specificFields, setSpecificFields] = useState<Record<string, any>>({});
  const [isUploading, setIsUploading] = useState(false);

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

  const validateFields = (): boolean => {
    // Validate common fields
    if (!category) {
      Alert.alert("Error", "Please select a category.");
      return false;
    }

    if (!imageUri) {
      Alert.alert("Error", "Please select an image.");
      return false;
    }

    if (!caption.trim()) {
      Alert.alert("Error", "Please enter a caption.");
      return false;
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert("Error", "Please enter a valid price greater than 0.");
      return false;
    }

    if (!condition) {
      Alert.alert("Error", "Please select a condition.");
      return false;
    }

    // Validate category-specific fields
    switch (category) {
      case "Book":
        if (!specificFields.title || !specificFields.courseNumber) {
          Alert.alert(
            "Error",
            "Please fill out the title and course number for the book."
          );
          return false;
        }
        break;
      case "Clothing":
        if (!specificFields.color || !specificFields.size) {
          Alert.alert(
            "Error",
            "Please fill out the color and size for the clothing."
          );
          return false;
        }
        break;
      case "Furniture":
        if (
          !specificFields.color ||
          !specificFields.dimensions ||
          !specificFields.weight
        ) {
          Alert.alert(
            "Error",
            "Please fill out the color, dimensions, and weight for the furniture."
          );
          return false;
        }
        break;
      case "Electronic":
        if (
          !specificFields.model ||
          !specificFields.dimensions ||
          !specificFields.weight
        ) {
          Alert.alert(
            "Error",
            "Please fill out the model, dimensions, and weight for the electronic item."
          );
          return false;
        }
        break;
      case "SportsGear":
        if (!specificFields.type || !specificFields.weight) {
          Alert.alert(
            "Error",
            "Please fill out the type and weight for the sports gear."
          );
          return false;
        }
        break;
    }

    return true;
  };

  const uploadPost = async () => {
    if (!validateFields()) return;

    try {
      setIsUploading(true);
      const user = auth.currentUser;

      if (!user) {
        Alert.alert("Error", "You must be logged in to upload a post.");
        return;
      }

      const displayName = user.displayName || "Anonymous";

      // Upload the image using PostManager
      const downloadURL = await PostManager.uploadImage(imageUri as string);

      // Create the post with both common and specific fields
      const commonFields = {
        price: parseFloat(price),
        quality: condition,
        seller: displayName,
        description: caption,
        photo: downloadURL,
      };

      // Create the post using the PostManager
      await PostManager.createPost(
        user.uid,
        category as string,
        commonFields,
        specificFields
      );

      // Reset form after successful upload
      Alert.alert("Success", "Post uploaded successfully!");
      setImageUri(null);
      setCaption("");
      setCondition("Good");
      setPrice("");
      setCategory(null);
      setSpecificFields({});
    } catch (err) {
      console.error("Error uploading post:", err);
      Alert.alert("Error", "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
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
              onChangeText={(value) =>
                setSpecificFields({ ...specificFields, title: value })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Course Number"
              value={specificFields.courseNumber || ""}
              onChangeText={(value) =>
                setSpecificFields({ ...specificFields, courseNumber: value })
              }
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
              onChangeText={(value) =>
                setSpecificFields({ ...specificFields, color: value })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Size"
              value={specificFields.size || ""}
              onChangeText={(value) =>
                setSpecificFields({ ...specificFields, size: value })
              }
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
              onChangeText={(value) =>
                setSpecificFields({ ...specificFields, color: value })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Dimensions"
              value={specificFields.dimensions || ""}
              onChangeText={(value) =>
                setSpecificFields({ ...specificFields, dimensions: value })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Weight"
              keyboardType="numeric"
              value={specificFields.weight || ""}
              onChangeText={(value) =>
                setSpecificFields({ ...specificFields, weight: value })
              }
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
              onChangeText={(value) =>
                setSpecificFields({ ...specificFields, model: value })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Dimensions"
              value={specificFields.dimensions || ""}
              onChangeText={(value) =>
                setSpecificFields({ ...specificFields, dimensions: value })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Weight"
              keyboardType="numeric"
              value={specificFields.weight || ""}
              onChangeText={(value) =>
                setSpecificFields({ ...specificFields, weight: value })
              }
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
              onChangeText={(value) =>
                setSpecificFields({ ...specificFields, type: value })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Weight"
              keyboardType="numeric"
              value={specificFields.weight || ""}
              onChangeText={(value) =>
                setSpecificFields({ ...specificFields, weight: value })
              }
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
        <Picker
          selectedValue={category}
          onValueChange={(value) => setCategory(value)}
        >
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

        <Text style={styles.label}>Quality:</Text>
        <Picker
          selectedValue={condition}
          onValueChange={(value) => setCondition(value)}
        >
          <Picker.Item label="Great" value="Great" />
          <Picker.Item label="Good" value="Good" />
          <Picker.Item label="Fair" value="Fair" />
          <Picker.Item label="Bad" value="Bad" />
        </Picker>

        {renderSpecificFields()}

        <Button
          title={isUploading ? "Uploading..." : "Upload Post"}
          onPress={uploadPost}
          disabled={isUploading}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#f5f8fa', // soft off-white background
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 10,
    color: '#003366', // deep navy title
    textAlign: 'center',
  },
  input: {
    marginTop: 10,
    padding: 8,
    borderColor: '#d0d7de',
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  image: {
    width: '100%',
    height: 250,
    marginVertical: 15,
    borderRadius: 8,
  },
  label: {
    marginTop: 10,
    fontWeight: '600',
    color: '#003366', // navy labels
  },
});
