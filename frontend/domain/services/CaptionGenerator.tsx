import OpenAI from "openai";

// React Native doesn't handle process.env the same way Node.js does
// Store API key directly for now (better to use react-native-dotenv in the future)
const OPENAI_API_KEY = "API Key"; // Replace with your actual key or use dotenv

export class CaptionGeneratorService {
  static openaiClient = new OpenAI({
    apiKey: OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  /**
   * Generate a caption for a product image using AI
   */
  static async generateCaption(imageUrl: string): Promise<string> {
    try {
      console.log(
        "Generating caption for image:",
        imageUrl.substring(0, 30) + "..."
      );

      const response = await this.openaiClient.responses.create({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: "Provide a descriptive bio for this product image in approximately 30 words",
              },
              {
                type: "input_image",
                image_url: imageUrl,
                detail: "auto",
              },
            ],
          },
        ],
      });

      return response.output_text || "A product for sale";
    } catch (error: any) {
      console.error("Error generating caption:", error.message);
      return "A product for sale";
    }
  }

  /**
   * Infer the category of a product from its image using AI
   * @param imageUrl URL of the product image
   * @returns Promise containing the inferred category
   */
  static async inferCategory(imageUrl: string): Promise<string> {
    try {
      console.log(
        "Inferring category for image:",
        imageUrl.substring(0, 30) + "..."
      );

      const response = await this.openaiClient.responses.create({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: "Determine which category this product belongs to. Only respond with ONE of the following categories: Electronic, Clothing, Book, Furniture, SportsGear. Just return the category name with no other text.",
              },
              {
                type: "input_image",
                image_url: imageUrl,
                detail: "auto",
              },
            ],
          },
        ],
      });

      const inferredCategory = response.output_text?.trim() || "Other";
      console.log("Inferred category:", inferredCategory);
      return inferredCategory;
    } catch (error: any) {
      console.error("Error inferring category:", error.message);
      return "Other"; // Default category if inference fails
    }
  }

  /**
   * Estimate a price for a product image using AI
   * @param imageUrl URL of the product image
   * @returns Promise containing the inferred price as a string
   */
  static async generatePrice(imageUrl: string): Promise<string> {
    try {
      console.log(
        "Generating price for image:",
        imageUrl.substring(0, 30) + "..."
      );

      const response = await this.openaiClient.responses.create({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text:
                  "Estimate a fair market resale price in USD for this item, assuming it is used and in good condition. Only return the numeric price without a dollar sign.",
              },
              {
                type: "input_image",
                image_url: imageUrl,
                detail: "auto",
              },
            ],
          },
        ],
      });

      const priceString = response.output_text?.trim() || "0";
      console.log("Generated price:", priceString);
      return priceString;
    } catch (error: any) {
      console.error("Error generating price:", error.message);
      return "0";
    }
  }
}
