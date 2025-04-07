// Clothing.ts
import { Post } from "./Post";

export class Clothing extends Post {
  constructor(
    id: string,
    price: number,
    quality: string,
    seller: string,
    description: string,
    photo: string,
    postTime: Date,
    public color: string,
    public size: string
  ) {
    super(id, price, quality, seller, description, photo, postTime, "Clothing");
  }
}
