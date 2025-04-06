// Furniture.ts
import { Product } from "./Product";

export class Furniture extends Product {
  constructor(
    title: string, // could be "type"
    description: string,
    price: number,
    imageUrl: string,
    public color: string,
    public dimension: string,
    public weight: number,
    public seller: string
  ) {
    super(title, description, price, imageUrl);
  }
}
