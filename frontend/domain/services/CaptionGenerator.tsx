import OpenAI from "openai";

// React Native doesn't handle process.env the same way Node.js does
// Store API key directly for now (better to use react-native-dotenv in the future)
const OPENAI_API_KEY = "KEY_HERE";

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
                text: "Provide a descriptive caption for this product image in approximately 30 words",
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
      // Return a default caption when the API fails
      return "A product for sale";
    }
  }
}
