// ClothingService.ts
import { BaseService } from "./BaseService";
import { Clothing } from "../models/Clothing";

export class ClothingService extends BaseService<Clothing> {
  constructor() {
    super("clothing");
  }
}
