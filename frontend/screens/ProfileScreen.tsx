import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { auth, db } from "../firebaseConfig"; // Import Firebase auth and Firestore
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";

const ProfileScreen = () => {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the user's name from Firebase Authentication
    const user = auth.currentUser;
    if (user) {
      setUserName(user.displayName || "Anonymous"); // Use displayName or fallback to "Anonymous"
    }
  }, []);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) return;

    const userRef = doc(db, "Accounts", user.uid);

    const fetchInterestedPosts = async () => {
      try {
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          console.error("User document does not exist.");
          return;
        }

        const userData = userSnap.data();
        const interestedPosts = userData?.interested || [];

        // Listen for changes to the status of each post
        interestedPosts.forEach((postId: string) => {
          const postRef = doc(db, "Posts", postId);

          onSnapshot(postRef, (postSnap) => {
            if (postSnap.exists()) {
              const postData = postSnap.data();
              alert(
                `Post Status Updated: The status of the post "${
                  postData?.description || "Untitled Post"
                }" has changed to: ${postData?.status}`
              );
            }
          });
        });
      } catch (error) {
        console.error("Error fetching interested posts:", error);
      }
    };

    fetchInterestedPosts();
  }, []);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); // Log out the user
      router.replace("/"); // Redirect to the login screen
      alert("Logged Out: You have been successfully logged out.");
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Error: Failed to log out. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {userName && <Text style={styles.userName}>{userName}</Text>}

      <TouchableOpacity onPress={pickImage}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Tap to add photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        placeholder="Write a short bio..."
        value={bio}
        onChangeText={setBio}
        style={styles.bioInput}
        multiline
      />

      <TouchableOpacity
        style={styles.viewPostsButton}
        onPress={() => router.push("/hidden/ViewPosts")}
      >
        <Text style={styles.viewPostsButtonText}>View My Posts</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.viewPostsButton}
        onPress={() => router.push("/hidden/InterestsPosts")}
      >
        <Text style={styles.viewPostsButtonText}>
          View Posts I'm Interested In
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    backgroundColor: "#f5f8fa", // soft off-white background
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#003366", // deep navy title
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: "#003366", // navy username
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#003366", // navy border around image
  },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#d0d7de", // light gray-blue
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  placeholderText: {
    color: "#666666",
    fontSize: 14,
  },
  bioInput: {
    width: "100%",
    height: 100,
    borderColor: "#d0d7de",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    textAlignVertical: "top",
    marginTop: 16,
    backgroundColor: "#ffffff",
  },
  viewPostsButton: {
    backgroundColor: "#003366", // deep navy button
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  viewPostsButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#FF5252",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ProfileScreen;
