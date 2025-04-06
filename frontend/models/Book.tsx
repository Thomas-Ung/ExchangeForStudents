// Book.ts
import { Product } from "./Product";

export class Book extends Product {
  constructor(
    title: string,
    description: string,
    price: number,
    imageUrl: string,
    public edition: string,
    public courseNumber: string,
    public seller: string
  ) {
    super(title, description, price, imageUrl);
  }
}
