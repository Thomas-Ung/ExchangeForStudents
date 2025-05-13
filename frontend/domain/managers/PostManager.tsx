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
import { CaptionGeneratorService } from "../services/CaptionGenerator";

export class PostManager {
  /**
   * Fetch posts by category.
   * If no category is provided, fetch all posts.
   */
  static async fetchPostsByCategory(category?: string): Promise<Post[]> {
    try {
      console.log(
        "PostManager: Starting fetch for category:",
        category || "all"
      );

      // Try multiple collection names to find the right one
      const possibleCollections = [
        "posts",
        "Posts",
        "products",
        "Products",
        "items",
        "Items",
      ];

      // First, find the correct collection
      let foundCollection = "";
      for (const collectionName of possibleCollections) {
        console.log(`Trying collection: "${collectionName}"`);
        const testSnapshot = await getDocs(collection(db, collectionName));

        if (testSnapshot.size > 0) {
          console.log(
            `Success! Found ${testSnapshot.size} documents in "${collectionName}"`
          );
          foundCollection = collectionName;
          break;
        }
      }

      if (foundCollection === "") {
        console.error("No documents found in any collection.");
        return [];
      }

      // Now, query with the category filter if needed
      const collectionRef = collection(db, foundCollection);
      let querySnapshot;

      if (category) {
        console.log(`Applying category filter: "${category}"`);
        const q = query(collectionRef, where("category", "==", category));
        querySnapshot = await getDocs(q);
      } else {
        querySnapshot = await getDocs(collectionRef);
      }

      console.log(
        `Query returned ${querySnapshot.size} documents after category filtering`
      );

      // Process the documents with improved field handling
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();

        // Log the full document data to debug
        console.log(`Document ${doc.id} raw data:`, JSON.stringify(data));

        // List all fields in the document
        console.log(`Document ${doc.id} fields:`, Object.keys(data));

        // Check for category-specific fields
        if (data.category) {
          console.log(`Document ${doc.id} is category: ${data.category}`);

          // Log specific fields based on category
          switch (data.category) {
            case "Furniture":
              console.log(
                `Furniture fields: color=${data.color}, dimensions=${data.dimensions}, weight=${data.weight}`
              );
              break;
            case "Book":
              console.log(
                `Book fields: title=${data.title}, courseNumber=${data.courseNumber}`
              );
              break;
            case "Clothing":
              console.log(
                `Clothing fields: size=${data.size}, color=${data.color}`
              );
              break;
            case "Electronic":
              console.log(
                `Electronic fields: model=${data.model}, dimensions=${data.dimensions}`
              );
              break;
            case "SportsGear":
              console.log(
                `SportsGear fields: type=${data.type}, weight=${data.weight}`
              );
              break;
          }
        }

        // Create a Post object with the common fields
        const post = new Post(
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

        // Add ALL additional fields to the Post object
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
            ].includes(key)
          ) {
            // @ts-ignore - Add dynamic properties
            post[key] = data[key];
          }
        });

        console.log(
          `Final Post object fields for ${doc.id}:`,
          Object.keys(post)
        );
        return post;
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
      return [];
    }
  }

  /**
   * Generate a caption for an image URL using AI
   */
  static async generateCaption(imageUrl: string): Promise<string> {
    return CaptionGeneratorService.generateCaption(imageUrl);
  }
  /**
 * Infer a category for an image using AI
 */
  static async inferCategory(imageUrl: string): Promise<string> {
    return CaptionGeneratorService.inferCategory(imageUrl);
  }


  /**
   * Upload an image and automatically generate a caption
   * Convenience method that combines uploadImage and generateCaption
   */
  static async uploadImageAndGenerateCaption(localPath: string): Promise<{
    imageUrl: string;
    caption: string;
    category: string;
  }> {
    try {
      // First upload the image
      const imageUrl = await this.uploadImage(localPath);

      // Generate caption and infer category in parallel for efficiency
      const [caption, category] = await Promise.all([
        CaptionGeneratorService.generateCaption(imageUrl),
        CaptionGeneratorService.inferCategory(imageUrl),
      ]);

      return { imageUrl, caption, category };
    } catch (error) {
      console.error("Error in uploadImageAndGenerateCaption:", error);
      throw error;
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
      status: string;
      photo: string;
      bio: string; // Include bio field
    },
    specificFields: Record<string, any>
  ): Promise<string> {
    try {
      const postRef = collection(db, "Posts");

      console.log("Creating post with category-specific fields:", {
        category,
        ...commonFields,
        ...specificFields,
      });

      // Create a document with all the fields
      const postDoc = await addDoc(postRef, {
        category,
        price: commonFields.price,
        quality: commonFields.quality,
        seller: commonFields.seller,
        description: commonFields.description,
        photo: commonFields.photo,
        bio: commonFields.bio, // Save bio to Firestore
        postTime: Timestamp.now(),
        status: commonFields.status,
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
