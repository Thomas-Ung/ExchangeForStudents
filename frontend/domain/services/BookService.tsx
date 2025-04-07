// BookService.ts
import { BaseService } from "./BaseService";
import { Book } from "../models/Book";

export class BookService extends BaseService<Book> {
  constructor() {
    super("books");
  }
}
