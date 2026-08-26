import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { env } from "@/lib/env";
import type { AIProvider, StructuredRequest } from "@/lib/ai/types";
import type { z } from "zod";

export class OpenAIProvider implements AIProvider {
  private readonly client: OpenAI;
  constructor(apiKey = env.OPENAI_API_KEY) {
    if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");
    this.client = new OpenAI({ apiKey, timeout: env.OPENAI_REQUEST_TIMEOUT_MS, maxRetries: 2 });
  }

  async generateStructured<TSchema extends z.ZodType>(request: StructuredRequest<TSchema>) {
    const response = await this.client.responses.parse({
      model: request.model,
      instructions: request.instructions,
      input: request.input,
      text: { format: zodTextFormat(request.schema, request.schemaName) },
    });
    if (!response.output_parsed) throw new Error(`OpenAI returned no structured result for ${request.operation}.`);
    return request.schema.parse(response.output_parsed);
  }
}
