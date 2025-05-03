import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  arrayUnion,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { Post } from "../models/Post";
import { createPostObject } from "../services/PostFactory";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export class PostManager {
  /**
   * Fetch posts by category.
   * If no category is provided, fetch all posts.
   */
  static async fetchPostsByCategory(category?: string): Promise<Post[]> {
    try {
      const postRef = collection(db, "Posts");
      const postsQuery = category
        ? query(postRef, where("category", "==", category))
        : postRef;
      const querySnapshot = await getDocs(postsQuery);

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();

        // Get common fields
        const commonFields = {
          id: doc.id,
          price: data.price || 0,
          quality: data.quality || "",
          seller: data.seller || "",
          description: data.description || "",
          photo: data.photo || "",
          postTime: data.postTime?.toDate() || new Date(),
        };

        // Get specific fields based on category
        const specificFields: Record<string, any> = {};

        // Collect all fields that aren't common
        Object.keys(data).forEach((key) => {
          if (
            ![
              "id",
              "price",
              "quality",
              "seller",
              "status",
              "description",
              "photo",
              "postTime",
              "category",
              "requesters",
            ].includes(key)
          ) {
            specificFields[key] = data[key];
          }
        });

        // If there's a category, use createPostObject
        if (data.category) {
          try {
            return createPostObject(
              data.category,
              commonFields,
              specificFields
            );
          } catch (e) {
            console.log(`Error creating ${data.category} object:`, e);
          }
        }

        // Fallback to basic Post
        return new Post(
          doc.id,
          data.price || 0,
          data.quality || "",
          data.seller || "",
          data.status || "available",
          data.description || "",
          data.photo || "",
          data.postTime?.toDate() || new Date(),
          data.category || ""
        );
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
      return [];
    }
  }

  /**
   * Upload an image file to Firebase Storage
   */
  static async uploadImage(localPath: string): Promise<string> {
    const response = await fetch(localPath);
    const blob = await response.blob();
    const filename = `${Date.now()}-${localPath.substring(
      localPath.lastIndexOf("/") + 1
    )}`;
    const storagePath = `Posts/${filename}`;

    const storage = getStorage();
    const fileRef = ref(storage, storagePath);
    await uploadBytes(fileRef, blob);
    return await getDownloadURL(fileRef);
  }

  /**
   * Create a new post in Firestore with proper category-specific fields
   */
  static async createPost(
    userId: string,
    category: string,
    commonFields: {
      price: number;
      quality: string;
      seller: string;
      description: string;
      photo: string;
    },
    specificFields: Record<string, any>
  ): Promise<string> {
    try {
      const postRef = collection(db, "Posts");

      // Create a document with all the fields
      const postDoc = await addDoc(postRef, {
        category,
        price: commonFields.price,
        quality: commonFields.quality,
        seller: commonFields.seller,
        description: commonFields.description,
        photo: commonFields.photo,
        postTime: Timestamp.now(),
        status: "available",
        requesters: [],
        ...specificFields, // Add category-specific fields
      });

      // Get the post ID
      const postId = postDoc.id;

      // Update the user's document to include the post ID
      const userRef = doc(db, "Accounts", userId);
      await updateDoc(userRef, {
        posts: arrayUnion(postId),
      });

      console.log("Post created successfully with ID:", postId);
      return postId;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error; // Re-throw to handle in the UI
    }
  }
}
