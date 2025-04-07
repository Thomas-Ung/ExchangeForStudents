// Furniture.ts
import { Post } from "./Post";

export class Furniture extends Post {
  constructor(
    id: string,
    price: number,
    quality: string,
    seller: string,
    description: string,
    photo: string,
    postTime: Date,
    public color: string,
    public dimensions: string,
    public weight: number
  ) {
    super(id, price, quality, seller, description, photo, postTime, "Furniture");
  }
}
