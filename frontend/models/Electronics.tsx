// Electronics.ts
import { Product } from "./Product";

export class Electronics extends Product {
  constructor(
    title: string, // could be "type"
    description: string,
    price: number,
    imageUrl: string,
    public model: string,
    public dimension: string,
    public weight: number,
    public seller: string
  ) {
    super(title, description, price, imageUrl);
  }
}
