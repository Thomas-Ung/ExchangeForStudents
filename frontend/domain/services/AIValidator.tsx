import { ValidationRule, ValidationResult } from "../models/Validation";
import { AIGeneratorService } from "./AIGenerator";

export class ValidationService {
  // Map of field types to their validation rules
  private static validationRules: Record<string, ValidationRule[]> = {
    color: [
      {
        name: "isValidColor",
        validate: (value: string) => {
          const validColors = [
            "red",
            "blue",
            "green",
            "yellow",
            "black",
            "white",
            "brown",
            "gray",
            "purple",
            "pink",
            "orange",
          ];
          return validColors.includes(value.toLowerCase())
            ? { valid: true }
            : {
                valid: false,
                message: `'${value}' is not a recognized color.`,
              };
        },
      },
    ],
    size: [
      {
        name: "isValidSize",
        validate: (value: string) => {
          const validSizes = [
            "small",
            "medium",
            "large",
            "xs",
            "s",
            "m",
            "l",
            "xl",
            "xxl",
          ];
          return validSizes.includes(value.toLowerCase())
            ? { valid: true }
            : { valid: false, message: `'${value}' is not a recognized size.` };
        },
      },
    ],
    price: [
      {
        name: "isValidPrice",
        validate: (value: string) => {
          const price = parseFloat(value);
          return !isNaN(price) && price >= 0
            ? { valid: true }
            : { valid: false, message: "Price must be a positive number." };
        },
      },
    ],
  };

  /**
   * Validates a field value based on its field type
   * @param fieldType The type of field (color, size, price, etc.)
   * @param value The value to validate
   * @returns Validation result with status and any error messages
   */
  static validateField(fieldType: string, value: string): ValidationResult {
    // If no rules exist for this field type, consider it valid
    if (!this.validationRules[fieldType]) {
      return { valid: true };
    }

    // Apply all validation rules for this field type
    for (const rule of this.validationRules[fieldType]) {
      const result = rule.validate(value);
      if (!result.valid) {
        return result;
      }
    }

    return { valid: true };
  }

  /**
   * Validates an entire form with multiple fields
   * @param fields Object containing field names and their values
   * @returns Object with validation results for each field
   */
  static validateForm(
    fields: Record<string, string>
  ): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {};

    for (const [fieldName, value] of Object.entries(fields)) {
      results[fieldName] = this.validateField(fieldName, value);
    }

    return results;
  }

  /**
   * Adds a custom validation rule for a specific field type
   * @param fieldType The type of field to add validation for
   * @param rule The validation rule to add
   */
  static addValidationRule(fieldType: string, rule: ValidationRule): void {
    if (!this.validationRules[fieldType]) {
      this.validationRules[fieldType] = [];
    }
    this.validationRules[fieldType].push(rule);
  }

  /**
   * Uses AI to suggest corrections for invalid field values
   * @param fieldType The type of field (color, size, etc.)
   * @param value The invalid value entered by the user
   * @returns Promise with suggestions for correction
   */
  static async getSuggestions(
    fieldType: string,
    value: string
  ): Promise<string[]> {
    try {
      const response = await AIGeneratorService.openaiClient.responses.create({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `The user entered "${value}" for a ${fieldType} field, which is invalid. Suggest 3 valid options for ${fieldType} that they might have meant. Only respond with the options separated by commas, no additional text.`,
              },
            ],
          },
        ],
      });

      const suggestions =
        response.output_text?.split(",").map((s) => s.trim()) || [];
      return suggestions;
    } catch (error) {
      console.error("Error getting suggestions:", error);
      return [];
    }
  }

  /**
   * Validates field entries against the actual image to catch mismatches
   * @param fieldType Type of field (color, size, etc.)
   * @param value User entered value
   * @param imageUrl URL of the uploaded product image
   * @returns Promise with validation result
   */
  static async validateFieldWithImage(
    fieldType: string,
    value: string,
    imageUrl: string
  ): Promise<ValidationResult> {
    try {
      let prompt: string;

      // Customize prompt based on field type
      switch (fieldType) {
        case "color":
          prompt = `The user described this item as "${value}" color. Is this accurate? If not, what color is it actually? Respond with "MATCH" if accurate, or "MISMATCH: [correct color]" if not.`;
          break;

        case "type":
          prompt = `The user described this as a "${value}". Is that accurate, or is it a different type of item? Respond with "MATCH" if accurate, or "MISMATCH: [correct type]" if not.`;
          break;

        default:
          // For field types without image validation
          return { valid: true };
      }

      const response = await AIGeneratorService.openaiClient.responses.create({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: prompt },
              { type: "input_image", image_url: imageUrl, detail: "auto" },
            ],
          },
        ],
      });

      const aiResponse = response.output_text?.trim() || "";

      // Process the AI's response
      if (aiResponse.startsWith("MATCH")) {
        return { valid: true };
      } else if (aiResponse.startsWith("MISMATCH:")) {
        // Extract the suggested correction
        const suggestion = aiResponse.substring(9).trim();
        return {
          valid: false,
          message: `This doesn't look ${value}. It appears to be ${suggestion}.`,
          suggestions: [suggestion],
        };
      }

      // Default to valid if we can't interpret the response
      return { valid: true };
    } catch (error) {
      console.error("Error validating field with image:", error);
      // Fall back to regular validation without image
      return this.validateField(fieldType, value);
    }
  }

  /**
   * Batch validates multiple fields against an image
   * @param fields Object with field names and values
   * @param imageUrl URL of the uploaded product image
   * @returns Promise with validation results for each field
   */
  static async validateFormWithImage(
    fields: Record<string, string>,
    imageUrl: string
  ): Promise<Record<string, ValidationResult>> {
    const results: Record<string, ValidationResult> = {};
    const validationPromises: Promise<void>[] = [];

    for (const [fieldName, value] of Object.entries(fields)) {
      // Skip empty fields
      if (!value?.trim()) {
        results[fieldName] = { valid: true };
        continue;
      }

      // Create a promise for each field validation
      const promise = this.validateFieldWithImage(
        fieldName,
        value,
        imageUrl
      ).then((result) => {
        results[fieldName] = result;
      });

      validationPromises.push(promise);
    }

    // Wait for all validations to complete
    await Promise.all(validationPromises);

    return results;
  }
}
