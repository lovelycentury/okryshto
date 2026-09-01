import { z } from "zod";

/** Providers the backend knows how to instantiate. Adding one means extending `providers.ts`. */
export const providerSchema = z.enum(["google", "groq", "openrouter", "ollama"]);
export type Provider = z.infer<typeof providerSchema>;

export const modelInfoSchema = z.object({
  /** Stable public id — what the client sends and what URLs/analytics reference. */
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  provider: providerSchema,
  /** Provider-native model identifier, which often differs from our public `id`. */
  providerModel: z.string().min(1),
  contextWindow: z.number().int().positive(),
});

export type ModelInfo = z.infer<typeof modelInfoSchema>;

export const MODELS = [
  {
    id: "gemini-3.6-flash",
    name: "Gemini 3.6 Flash",
    description:
      "Google's fast multimodal model. Great all-round default with a 1M-token context window.",
    provider: "google",
    providerModel: "gemini-3.6-flash",
    contextWindow: 1_048_576,
  },
  {
    id: "gpt-oss-120b",
    name: "GPT-OSS 120B",
    description: "OpenAI's open-weight 120B model on Groq's LPUs — the fastest large model here.",
    provider: "groq",
    providerModel: "openai/gpt-oss-120b",
    contextWindow: 131_072,
  },
  {
    id: "minimax-m3",
    name: "MiniMax M3",
    description: "Strong general-purpose model with a 1M-token context, free via OpenRouter.",
    provider: "openrouter",
    providerModel: "minimax/minimax-m3:free",
    contextWindow: 1_048_576,
  },
  {
    id: "gemma-4-31b",
    name: "Gemma 4 31B",
    description: "Google's open-weight mid-size model, hosted on Ollama Cloud's free tier.",
    provider: "ollama",
    providerModel: "gemma4:31b",
    contextWindow: 262_144,
  },
] as const satisfies readonly ModelInfo[];

export type ModelId = (typeof MODELS)[number]["id"];

const MODELS_BY_ID = new Map<string, ModelInfo>(MODELS.map((model) => [model.id, model]));

/** Zod schema accepting only ids present in `MODELS` — reuse it in every request body. */
export const modelIdSchema = z.enum(MODELS.map((model) => model.id) as [ModelId, ...ModelId[]]);

export function getModel(id: string): ModelInfo | undefined {
  return MODELS_BY_ID.get(id);
}

export function listModels(): readonly ModelInfo[] {
  return MODELS;
}
