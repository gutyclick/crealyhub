import type { z } from "zod";

export type StructuredRequest<TSchema extends z.ZodType> = {
  operation: string;
  model: string;
  instructions: string;
  input: string;
  schema: TSchema;
  schemaName: string;
  webSearch?: boolean;
};

export type AIUsage = { inputTokens: number; outputTokens: number; model: string };
export type AIResult<T> = { data: T; usage: AIUsage };

export interface AIProvider {
  generateStructured<TSchema extends z.ZodType>(request: StructuredRequest<TSchema>): Promise<AIResult<z.infer<TSchema>>>;
}
