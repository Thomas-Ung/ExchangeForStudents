// FurnitureService.ts
import { BaseService } from "./BaseService";
import { Furniture } from "../models/Furniture";

export class FurnitureService extends BaseService<Furniture> {
  constructor() {
    super("furniture");
  }
}