// Book.ts
import { Post } from "./Post";

export class Book extends Post {
  constructor(
    id: string,
    price: number,
    quality: string,
    seller: string,
    description: string,
    photo: string,
    postTime: Date,
    public title: string,
    public courseNumber: string
  ) {
    // The Post constructor expects a status parameter that's missing
    super(
      id,
      price,
      quality,
      seller,
      "available",
      description,
      photo,
      postTime,
      "Book"
    );
  }

  // Add any Book-specific methods here if needed
}
