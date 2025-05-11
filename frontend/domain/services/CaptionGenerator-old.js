import OpenAI from "openai";
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

// Fix: Properly configure dotenv with correct path
dotenv.config();

export class CaptionGeneratorService {
  static openaiClient = new OpenAI({
    // Access API key directly without relying on process.cwd
    apiKey: process.env.OPENAI_API_KEY,
  });

  /**
   * Generate a caption for a product image using AI
   */
  static async generateCaption(imageUrl) {
    try {
      const response = await this.openaiClient.responses.create({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "user",
            content: [
              { 
                type: "input_text", 
                text: "Provide a descriptive caption for this product image in approximately 30 words" 
              },
              { 
                type: "input_image", 
                image_url: imageUrl 
              }
            ],
          },
        ],
      });
      
      return response.output_text;
    } catch (error) {
      console.error("Error generating caption:", error);
      throw error;
    }
  }
}