import type { z } from "zod";

export type StructuredRequest<TSchema extends z.ZodType> = {
  operation: string;
  model: string;
  instructions: string;
  input: string;
  schema: TSchema;
  schemaName: string;
};

export interface AIProvider {
  generateStructured<TSchema extends z.ZodType>(request: StructuredRequest<TSchema>): Promise<z.infer<TSchema>>;
}
