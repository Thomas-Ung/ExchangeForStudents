import { Post } from "./Post";

export class SportsGear extends Post {
  constructor(
    id: string,
    price: number,
    quality: string,
    seller: string,
    description: string,
    photo: string,
    postTime: Date,
    public type: string,
    public weight: number
  ) {
    super(
      id,
      price,
      quality,
      seller,
      "available",
      description,
      photo,
      postTime,
      "SportsGear"
    );
  }
}
