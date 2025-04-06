// Clothing.ts
import { Product } from "./Product";

export class Clothing extends Product {
  constructor(
    title: string, // could be "type"
    description: string,
    price: number,
    imageUrl: string,
    public color: string,
    public size: string,
    public seller: string
  ) {
    super(title, description, price, imageUrl);
  }
}
