import { registerApiRoute } from "@mastra/core/server";

import { env } from "../../config/env.js";
import { listModels } from "../../config/models.js";
import { isProviderConfigured } from "../../config/providers.js";

/**
 * Feeds the model picker in the `fe` app. `available` reflects whether the provider's
 * key is actually set, so the UI can disable a model instead of letting a visitor
 * pick one that will fail on send.
 */
export const modelsRoute = registerApiRoute("/models", {
  method: "GET",
  handler: (c) =>
    c.json({
      defaultModelId: env.DEFAULT_MODEL_ID,
      models: listModels().map((model) => ({
        id: model.id,
        name: model.name,
        description: model.description,
        provider: model.provider,
        contextWindow: model.contextWindow,
        available: isProviderConfigured(model.provider),
      })),
    }),
});
