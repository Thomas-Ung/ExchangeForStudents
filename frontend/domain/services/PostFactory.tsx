import { Book } from "../models/Book";
import { Clothing } from "../models/Clothing";
import { Furniture } from "../models/Furniture";
import { Electronic } from "../models/Electronic";
import { SportsGear } from "../models/SportsGear";
import { Post } from "../models/Post";

export function createPostObject(
  category: string,
  commonFields: {
    id: string;
    price: number;
    quality: string;
    seller: string;
    description: string;
    photo: string;
    postTime: Date;
  },
  specificFields: Record<string, any>
): Post {
  switch (category) {
    case "Book":
      return new Book(
        commonFields.id,
        commonFields.price,
        commonFields.quality,
        commonFields.seller,
        commonFields.description,
        commonFields.photo,
        commonFields.postTime,
        specificFields.title,
        specificFields.courseNumber
      );
    case "Clothing":
      return new Clothing(
        commonFields.id,
        commonFields.price,
        commonFields.quality,
        commonFields.seller,
        commonFields.description,
        commonFields.photo,
        commonFields.postTime,
        specificFields.color,
        specificFields.size
      );
    case "Furniture":
      return new Furniture(
        commonFields.id,
        commonFields.price,
        commonFields.quality,
        commonFields.seller,
        commonFields.description,
        commonFields.photo,
        commonFields.postTime,
        specificFields.color,
        specificFields.dimensions,
        specificFields.weight
      );
    case "Electronic":
      return new Electronic(
        commonFields.id,
        commonFields.price,
        commonFields.quality,
        commonFields.seller,
        commonFields.description,
        commonFields.photo,
        commonFields.postTime,
        specificFields.model,
        specificFields.dimensions,
        specificFields.weight
      );
    case "SportsGear":
      return new SportsGear(
        commonFields.id,
        commonFields.price,
        commonFields.quality,
        commonFields.seller,
        commonFields.description,
        commonFields.photo,
        commonFields.postTime,
        specificFields.type,
        specificFields.weight
      );
    default:
      throw new Error(`Unknown category: ${category}`);
  }
}