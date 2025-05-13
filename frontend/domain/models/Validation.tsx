export interface ValidationResult {
  valid: boolean;
  message?: string;
  suggestions?: string[];
}

export interface ValidationRule {
  name: string;
  validate: (value: string) => ValidationResult;
}
