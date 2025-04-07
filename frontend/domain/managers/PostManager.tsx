import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { Post } from "../models/Post";

export class PostManager {
  /**
   * Fetch posts by category.
   * If no category is provided, fetch all posts.
   */
  static async fetchPostsByCategory(category: string): Promise<Post[]> {
    try {
      const postRef = collection(db, "Posts");
      const postsQuery = category === "all"
        ? postRef
        : query(postRef, where("category", "==", category));
      const querySnapshot = await getDocs(postsQuery);

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return new Post(
          doc.id,
          data.price,
          data.quality,
          data.seller,
          data.description,
          data.photo,
          data.postTime.toDate(),
          data.category
        );
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
      return [];
    }
  }

  /**
   * Create a new post in Firestore.
   */
  static async createPost(post: Post): Promise<void> {
    try {
      const postRef = collection(db, "Posts");
      await addDoc(postRef, {
        price: post.price,
        quality: post.quality,
        seller: post.seller,
        description: post.description,
        photo: post.photo,
        postTime: post.postTime,
        category: post.category,
      });
      console.log("Post created successfully");
    } catch (error) {
      console.error("Error creating post:", error);
    }
  }
}