// ElectronicsService.ts
import { BaseService } from "./BaseService";
import { Electronic } from "../models/Electronic";
export class ElectronicsService extends BaseService<Electronic> {
  constructor() {
    super("electronics");
  }
}