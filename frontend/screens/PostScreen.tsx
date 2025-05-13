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
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { auth } from "../firebaseConfig";
import { PostManager } from "../domain/managers/PostManager";
import { ValidationService } from "../domain/services/AIValidator";
import { ValidationResult } from "../domain/models/Validation"; // Create this file if needed

export default function PostScreen() {
  const [category, setCategory] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState(""); // Keep this for manual input
  const [condition, setCondition] = useState("Good");
  const [price, setPrice] = useState("");
  const [specificFields, setSpecificFields] = useState<Record<string, any>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [bio, setBio] = useState(""); // State for bio
  const [isGenerating, setIsGenerating] = useState(false); // For generating ai response
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [fieldSuggestions, setFieldSuggestions] = useState<
    Record<string, string[]>
  >({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {}
  );

  const handleImageSelect = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      setIsUploading(true);

      try {
        const imageUrl = await PostManager.uploadImage(uri);
        setUploadedImageUrl(imageUrl);

        // Auto-infer category
        const inferredCategory = await PostManager.inferCategory(imageUrl);
        setCategory(inferredCategory);

        // Auto-generate price
        const estimatedPrice = await PostManager.generatePrice(imageUrl);
        setPrice(estimatedPrice);
      } catch (error) {
        console.error("Error:", error);
        Alert.alert("Error", "Failed to process image");
      } finally {
        setIsUploading(false);
      }
    }
  };

  /**
   * Validates the entered fields against the uploaded image
   */
  const validateFieldsWithImage = async () => {
    if (!uploadedImageUrl) {
      Alert.alert("Error", "Please upload an image first");
      return;
    }

    // Collect field values to validate
    const fieldsToValidate: Record<string, string> = {};

    // Add category-specific fields
    switch (category) {
      case "Clothing":
        if (specificFields.color)
          fieldsToValidate["color"] = specificFields.color;
        if (specificFields.size) fieldsToValidate["size"] = specificFields.size;
        break;
      case "Furniture":
        if (specificFields.material)
          fieldsToValidate["material"] = specificFields.material;
        if (specificFields.color)
          fieldsToValidate["color"] = specificFields.color;
        break;
      // Add other categories as needed
    }

    // Don't validate empty fields
    Object.keys(fieldsToValidate).forEach((key) => {
      if (!fieldsToValidate[key]?.trim()) {
        delete fieldsToValidate[key];
      }
    });

    // If no fields to validate, return
    if (Object.keys(fieldsToValidate).length === 0) {
      return;
    }

    // Show loading indicator
    setIsGenerating(true);

    try {
      // Validate all fields against the image
      const results = await ValidationService.validateFormWithImage(
        fieldsToValidate,
        uploadedImageUrl
      );

      // Process results
      let hasErrors = false;
      const newErrors = { ...fieldErrors };
      const newSuggestions = { ...fieldSuggestions };

      for (const [fieldName, result] of Object.entries(results)) {
        if (!result.valid) {
          hasErrors = true;

          // Map to the correct state field name
          let stateFieldName = fieldName;
          if (fieldName !== "condition") {
            stateFieldName = `specificFields.${fieldName}`;
          }

          newErrors[stateFieldName] = result.message || `Invalid ${fieldName}`;
          if (result.suggestions && result.suggestions.length > 0) {
            newSuggestions[stateFieldName] = result.suggestions;
          }
        }
      }

      setFieldErrors(newErrors);
      setFieldSuggestions(newSuggestions);

      if (hasErrors) {
        Alert.alert(
          "Possible inaccuracies detected",
          "Some of your descriptions don't seem to match the image. Please review the highlighted fields."
        );
      }
    } catch (error) {
      console.error("Error validating with image:", error);
      Alert.alert(
        "Validation Error",
        "Could not validate fields against the image. Please check your inputs manually."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCaptionManually = async () => {
    if (!uploadedImageUrl) {
      Alert.alert("Error", "Please upload an image first.");
      return;
    }
    try {
      setIsGenerating(true); // use separate state
      const generated = await PostManager.generateCaption(uploadedImageUrl);
      setBio(generated);
    } catch (error) {
      console.error("Error generating caption:", error);
      Alert.alert("Error", "Failed to generate caption.");
    } finally {
      setIsGenerating(false);
    }
  };

  const validateFields = (): boolean => {
    // Validate common fields
    if (!category) {
      alert("Error: Please select a category.");
      return false;
    }

    if (!imageUri) {
      alert("Error: Please select an image.");
      return false;
    }

    if (!caption.trim()) {
      alert("Error: Please enter a caption.");
      return false;
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      alert("Error: Please enter a valid price greater than 0.");
      return false;
    }

    if (!condition) {
      alert("Error: Please select a condition.");
      return false;
    }

    // Validate category-specific fields
    switch (category) {
      case "Book":
        if (!specificFields.title || !specificFields.courseNumber) {
          alert(
            "Error: Please fill out the title and course number for the book."
          );
          return false;
        }
        break;
      case "Clothing":
        if (!specificFields.color || !specificFields.size) {
          alert("Error: Please fill out the color and size for the clothing.");
          return false;
        }
        break;
      case "Furniture":
        if (
          !specificFields.color ||
          !specificFields.dimensions ||
          !specificFields.weight
        ) {
          alert(
            "Error: Please fill out the color, dimensions, and weight for the furniture."
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
          alert(
            "Error: Please fill out the model, dimensions, and weight for the electronic item."
          );
          return false;
        }
        break;
      case "SportsGear":
        if (!specificFields.type || !specificFields.weight) {
          alert(
            "Error: Please fill out the type and weight for the sports gear."
          );
          return false;
        }
        break;
    }

    return true;
  };

  const validateField = async (
    fieldType: string,
    value: string,
    fieldName: string
  ) => {
    // Mark the field as touched
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));

    // Only validate touched fields
    if (!touchedFields[fieldName]) return;

    const result = ValidationService.validateField(fieldType, value);

    if (!result.valid) {
      // Set the error
      setFieldErrors((prev) => ({
        ...prev,
        [fieldName]: result.message || "Invalid input",
      }));

      // Get AI suggestions
      const suggestions = await ValidationService.getSuggestions(
        fieldType,
        value
      );
      setFieldSuggestions((prev) => ({ ...prev, [fieldName]: suggestions }));
    } else {
      // Clear errors and suggestions
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      setFieldSuggestions((prev) => {
        const newSuggestions = { ...prev };
        delete newSuggestions[fieldName];
        return newSuggestions;
      });
    }
  };

  const applySuggestion = (fieldName: string, suggestion: string) => {
    if (fieldName.includes("specificFields.")) {
      const actualField = fieldName.split(".")[1];
      setSpecificFields((prev) => ({
        ...prev,
        [actualField]: suggestion,
      }));
    } else {
      // Handle regular fields
      switch (fieldName) {
        case "price":
          setPrice(suggestion);
          break;
        case "caption":
          setCaption(suggestion);
          break;
        // Add other fields as needed
      }
    }

    // Clear suggestions after applying
    setFieldSuggestions((prev) => {
      const newSuggestions = { ...prev };
      delete newSuggestions[fieldName];
      return newSuggestions;
    });
  };

  const uploadPost = async () => {
    if (!validateFields()) return;

    try {
      setIsUploading(true);
      const user = auth.currentUser;

      if (!user) {
        alert("Error: You must be logged in to upload a post.");
        return;
      }

      const displayName = user.displayName || "Anonymous";

      // Upload the image using PostManager
      const downloadURL = await PostManager.uploadImage(imageUri as string);

      // Generate a bio using AI
      const generatedBio = await PostManager.generateCaption(downloadURL);

      // Create the post with both common and specific fields
      const commonFields = {
        price: parseFloat(price),
        quality: condition,
        seller: displayName,
        description: caption, // Keep the manually entered description
        photo: downloadURL,
        status: "available", // Default status
        bio: generatedBio, // Use the AI-generated bio
      };

      // Create the post using the PostManager
      await PostManager.createPost(
        user.uid,
        category as string,
        commonFields,
        specificFields
      );

      // Reset form after successful upload
      alert("Success: Post uploaded successfully!");
      setImageUri(null);
      setCaption("");
      setCondition("Good");
      setPrice("");
      setCategory(null);
      setSpecificFields({});
      setBio(""); // Reset bio
    } catch (err) {
      console.error("Error uploading post:", err);
      alert("Error: Upload failed. Please try again.");
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
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  fieldErrors["specificFields.color"]
                    ? styles.inputError
                    : null,
                ]}
                placeholder="Color"
                value={specificFields.color || ""}
                onChangeText={(value) => {
                  setSpecificFields({ ...specificFields, color: value });
                  validateField("color", value, "specificFields.color");
                }}
                onBlur={() =>
                  validateField(
                    "color",
                    specificFields.color || "",
                    "specificFields.color"
                  )
                }
              />
              {fieldErrors["specificFields.color"] && (
                <Text style={styles.errorText}>
                  {fieldErrors["specificFields.color"]}
                </Text>
              )}
              {fieldSuggestions["specificFields.color"] &&
                fieldSuggestions["specificFields.color"].length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    <Text style={styles.suggestionsTitle}>Did you mean:</Text>
                    {fieldSuggestions["specificFields.color"].map(
                      (suggestion, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() =>
                            applySuggestion("specificFields.color", suggestion)
                          }
                          style={styles.suggestionButton}
                        >
                          <Text style={styles.suggestionText}>
                            {suggestion}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                )}
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  fieldErrors["specificFields.size"] ? styles.inputError : null,
                ]}
                placeholder="Size"
                value={specificFields.size || ""}
                onChangeText={(value) => {
                  setSpecificFields({ ...specificFields, size: value });
                  validateField("size", value, "specificFields.size");
                }}
                onBlur={() =>
                  validateField(
                    "size",
                    specificFields.size || "",
                    "specificFields.size"
                  )
                }
              />
              {fieldErrors["specificFields.size"] && (
                <Text style={styles.errorText}>
                  {fieldErrors["specificFields.size"]}
                </Text>
              )}
              {fieldSuggestions["specificFields.size"] &&
                fieldSuggestions["specificFields.size"].length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    <Text style={styles.suggestionsTitle}>Did you mean:</Text>
                    {fieldSuggestions["specificFields.size"].map(
                      (suggestion, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() =>
                            applySuggestion("specificFields.size", suggestion)
                          }
                          style={styles.suggestionButton}
                        >
                          <Text style={styles.suggestionText}>
                            {suggestion}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                )}
            </View>
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

        <Button title="Pick an image" onPress={handleImageSelect} />
        {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

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

        <TextInput
          style={styles.input}
          placeholder="Bio"
          value={bio}
          onChangeText={setBio}
        />

        {uploadedImageUrl && (
          <View style={{ marginTop: 12, marginBottom: 6 }}>
            <Button
              title={isGenerating ? "Checking..." : "Verify Against Image"}
              onPress={validateFieldsWithImage}
              disabled={isGenerating}
            />
          </View>
        )}

        {/* Add loading indicator if needed */}
        {isGenerating && (
          <View style={styles.loadingContainer}>
            <Text>AI is analyzing your image...</Text>
          </View>
        )}

        <View style={{ marginTop: 12, marginBottom: 6 }}>
          <Button
            title={isGenerating ? "Generating..." : "Generate Response"}
            onPress={generateCaptionManually}
            disabled={!uploadedImageUrl || isGenerating}
          />
        </View>

        <View style={{ marginTop: 6 }}>
          <Button
            title={isUploading ? "Uploading..." : "Upload Post"}
            onPress={uploadPost}
            disabled={isUploading}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: "#f5f8fa", // soft off-white background
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 10,
    color: "#003366", // deep navy title
    textAlign: "center",
  },
  input: {
    marginTop: 10,
    padding: 8,
    borderColor: "#d0d7de",
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: "#ffffff",
  },
  image: {
    width: "100%",
    height: 250,
    marginVertical: 15,
    borderRadius: 8,
  },
  label: {
    marginTop: 10,
    fontWeight: "600",
    color: "#003366", // navy labels
  },
  aiButton: {
    marginTop: 10,
    paddingVertical: 12,
    backgroundColor: "#0077cc", // custom blue
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10, // adds space before next button
  },
  aiButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 5,
  },
  suggestionsContainer: {
    marginTop: 5,
    padding: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 5,
  },
  suggestionsTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  suggestionButton: {
    paddingVertical: 5,
  },
  suggestionText: {
    color: "blue",
  },
  validationButton: {
    backgroundColor: "#4a90e2",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingContainer: {
    paddingVertical: 10,
    alignItems: "center",
  },
});
