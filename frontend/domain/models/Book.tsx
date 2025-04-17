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
    super(id, price, quality, seller, description, photo, postTime, "Book");
  }
}
