import { registerApiRoute } from "@mastra/core/server";

import { RESUME_INDEX } from "../../rag/constants.js";
import { vectorStore } from "../../rag/vector-store.js";

/**
 * Reports whether the vector index exists and holds anything. A freshly cloned
 * checkout answers questions with a confident "I don't know" until `pnpm ingest`
 * has run, and this is the endpoint that explains why.
 */
export const healthRoute = registerApiRoute("/status", {
  method: "GET",
  handler: async (c) => {
    try {
      const indexes = await vectorStore.listIndexes();

      if (!indexes.includes(RESUME_INDEX)) {
        return c.json(
          { status: "degraded", knowledgeBase: "missing", hint: "Run `pnpm ingest`." },
          503,
        );
      }

      const stats = await vectorStore.describeIndex({ indexName: RESUME_INDEX });

      if (stats.count === 0) {
        return c.json(
          { status: "degraded", knowledgeBase: "empty", hint: "Run `pnpm ingest`." },
          503,
        );
      }

      return c.json({ status: "ok", knowledgeBase: "ready", vectors: stats.count });
    } catch (error) {
      return c.json(
        { status: "error", message: error instanceof Error ? error.message : "Unknown error" },
        503,
      );
    }
  },
});
