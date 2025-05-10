import OpenAI from "openai";
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Clear any existing OPENAI_API_KEY from environment
delete process.env.OPENAI_API_KEY;

// Load environment variables
dotenv.config();

// Check if key loaded correctly
console.log("API Key prefix Again:", process.env.OPENAI_API_KEY?.substring(0, 10) + "...");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


const response = await openai.responses.create({
  model: "gpt-4.1-mini",
  input: [
    {
      role: "user",
      content: [
        { type: "input_text", text: "Provide a description of the image in approximately 50 words" },
        {
          type: "input_image",
          image_url:
            "https://firebasestorage.googleapis.com/v0/b/exchange-for-students.firebasestorage.app/o/Posts%2F1744057071089-2Q%3D%3D?alt=media&token=204c42a9-c9ec-4352-9ef1-a5be4e1167e3",
        },
      ],
    },
  ],
});
console.log(response.output_text);