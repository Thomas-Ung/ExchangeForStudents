// ElectronicsService.ts
import { BaseService } from "./BaseService";
import { Electronics } from "../models/Electronics";
export class ElectronicsService extends BaseService<Electronics> {
  constructor() {
    super("electronics");
  }
}