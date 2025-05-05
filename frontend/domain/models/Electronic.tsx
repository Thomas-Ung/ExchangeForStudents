import { Post } from "./Post";

export class Electronic extends Post {
  constructor(
    id: string,
    price: number,
    quality: string,
    seller: string,
    description: string,
    photo: string,
    postTime: Date,
    public model: string,
    public dimensions: string,
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
      "Electronic"
    );
  }
}
