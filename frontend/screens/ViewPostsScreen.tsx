import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { auth, db } from "../firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  arrayRemove,
} from "firebase/firestore";
import { useRouter } from "expo-router";

const ViewPosts = () => {
  const [posts, setPosts] = useState<
    { id: string; title?: string; status?: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  const fetchUserPosts = async () => {
    try {
      setLoading(true); // Show loading indicator while fetching data
      const user = auth.currentUser;

      if (!user) {
        alert("Error: You must be logged in to view your posts.");
        console.log("No user is logged in.");
        return;
      }

      console.log("Fetching posts for user:", user.uid);

      const userRef = doc(db, "Accounts", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        alert("Error: User document does not exist.");
        console.log("User document does not exist in the Accounts collection.");
        return;
      }

      const userData = userSnap.data();
      const postIds = userData.posts || [];
      console.log("Post IDs from user document:", postIds);

      if (postIds.length === 0) {
        console.log("No posts found for this user.");
        setPosts([]);
        setLoading(false);
        return;
      }

      const postsRef = collection(db, "Posts");
      const q = query(postsRef, where("__name__", "in", postIds));
      const querySnapshot = await getDocs(q);

      const fetchedPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as {
          title?: string;
          status?: string;
          description?: string;
          photo?: string;
        }),
      }));

      console.log("Fetched posts:", fetchedPosts);

      setPosts(fetchedPosts);

      const initialStatuses: { [key: string]: string } = {};
      fetchedPosts.forEach((post) => {
        initialStatuses[post.id] = (post.status as string) || "available";
      });
      setStatuses(initialStatuses);
    } catch (error) {
      console.error("Error fetching posts:", error);
      alert("Error: Failed to fetch posts. Please try again later.");
    } finally {
      setLoading(false); // Stop loading in all cases
    }
  };

  useEffect(() => {
    fetchUserPosts();
  }, []);

  const updateStatus = async (postId: string, newStatus: string) => {
    try {
      const postRef = doc(db, "Posts", postId);
      await updateDoc(postRef, { status: newStatus });
      setStatuses((prevStatuses) => ({
        ...prevStatuses,
        [postId]: newStatus,
      }));
      alert(`Success: Status updated to "${newStatus}"`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error: Failed to update status. Please try again.");
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const confirmed = confirm("Are you sure you want to delete this post?");
      if (!confirmed) return;

      const postRef = doc(db, "Posts", postId);
      const user = auth.currentUser;

      if (!user) {
        alert("You must be logged in to delete a post.");
        return;
      }

      // Delete the post from Firestore
      await deleteDoc(postRef);

      // Remove the post ID from the user's "posts" array
      const userRef = doc(db, "Accounts", user.uid);
      await updateDoc(userRef, {
        posts: arrayRemove(postId),
      });

      // Update the UI
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      alert("Post deleted successfully.");
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete the post. Please try again.");
    }
  };

  const renderPost = ({ item }: any) => {
    const isSold = statuses[item.id]?.startsWith("Sold to: ");

    return (
      <View style={styles.postCard}>
        <Image
          source={{ uri: item.photo }}
          style={styles.postImage}
          resizeMode="cover"
        />
        <Text style={styles.postTitle}>
          {item.description || "Untitled Post"}
        </Text>
        <Text style={styles.postStatus}>
          Current Status: {statuses[item.id]}
        </Text>

        {isSold ? (
          // Display disabled status for sold items
          <View style={styles.soldStatusContainer}>
            <Text style={styles.soldStatusText}>
              This item has been sold and status cannot be changed
            </Text>
          </View>
        ) : (
          // Normal picker for unsold items
          <Picker
            selectedValue={statuses[item.id]}
            onValueChange={(value) => updateStatus(item.id, value)}
            style={styles.picker}
          >
            <Picker.Item label="Available" value="available" />
            <Picker.Item label="On Hold" value="on hold" />
          </Picker>
        )}

        {/* View Interested Buyers Button */}
        <TouchableOpacity
          style={[styles.viewBuyersButton, isSold && styles.disabledButton]}
          disabled={isSold}
          onPress={() => {
            if (!isSold) {
              router.push(`/hidden/ViewQueue?postId=${item.id}`);
            }
          }}
        >
          <Text
            style={[
              styles.viewBuyersButtonText,
              isSold && { opacity: 0.7 }, // Optional: make text appear disabled too
            ]}
          >
            {isSold ? "Item Sold - No Buyers" : "View Interested Buyers"}
          </Text>
        </TouchableOpacity>

        {/* Edit Button */}
        <TouchableOpacity
          style={[styles.editButton, isSold && styles.disabledButton]}
          disabled={isSold}
          onPress={() => {
            if (!isSold) {
              router.push({
                pathname: "/hidden/edit",
                params: { id: item.id },
              });
              console.log("Navigating to EditScreen with ID:", item.id);
            }
          }}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeletePost(item.id)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading your posts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Posts</Text>
      <TouchableOpacity style={styles.refreshButton} onPress={fetchUserPosts}>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
      {posts.length === 0 ? (
        <Text>You have not uploaded any posts yet.</Text>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f8fa", // soft off-white background
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#003366", // deep navy title
    textAlign: "center",
  },
  postCard: {
    backgroundColor: "#ffffff", // white card
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 8,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    color: "#003366",
  },
  postStatus: {
    fontSize: 14,
    color: "#555555",
    marginBottom: 8,
  },
  picker: {
    height: 50,
    width: "100%",
    backgroundColor: "#e6ecf0", // light gray-blue picker background
    borderRadius: 8,
    marginTop: 8,
  },
  viewBuyersButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#003366", // navy button
    borderRadius: 8,
    alignItems: "center",
  },
  viewBuyersButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  refreshButton: {
    backgroundColor: "#003366",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "center",
    marginBottom: 16,
  },
  refreshButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  editButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#FFA500", // orange for edit
    borderRadius: 8,
    alignItems: "center",
  },
  editButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#FF5252", // slightly softened red for delete
    borderRadius: 8,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  soldStatusContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#d0d7de", // subtle light gray-blue
    borderRadius: 8,
    alignItems: "center",
  },
  soldStatusText: {
    color: "#555555",
    fontSize: 14,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#A9A9A9", // gray for disabled state
  },
});

export default ViewPosts;
