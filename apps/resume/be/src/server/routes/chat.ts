import { registerApiRoute } from "@mastra/core/server";
import { RequestContext } from "@mastra/core/request-context";
import { z } from "zod";

import { MODEL_ID_KEY } from "../../agents/resume-agent.js";
import { env } from "../../config/env.js";
import { modelIdSchema } from "../../config/models.js";
import { ModelUnavailableError } from "../../config/providers.js";
import { RESUME_SEARCH_TOOL_ID } from "../../tools/resume-search.js";
import { type ChatEvent, encodeSse } from "../sse.js";

/**
 * A visitor-facing endpoint, so the limits are deliberately tight: long inputs cost
 * tokens and are never a genuine question about a CV.
 */
const chatRequestSchema = z.object({
  message: z.string().trim().min(1, "Message cannot be empty.").max(2000),
  /** Groups messages into a conversation. The client generates and persists it. */
  threadId: z.string().min(1).max(128),
  modelId: modelIdSchema.optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const chatRoute = registerApiRoute("/chat", {
  method: "POST",
  handler: async (c) => {
    const body = await c.req.json().catch(() => null);
    const parsed = chatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({ error: "Invalid request", issues: z.treeifyError(parsed.error) }, 400);
    }

    const { message, threadId, modelId } = parsed.data;
    const mastra = c.get("mastra");
    const logger = mastra.getLogger();
    const agent = mastra.getAgent("resume");

    // The agent's `model` factory reads this key to pick the provider for this request.
    const requestContext = new RequestContext();
    requestContext.set(MODEL_ID_KEY, modelId ?? env.DEFAULT_MODEL_ID);

    let stream;
    try {
      stream = await agent.stream(message, {
        requestContext,
        // Single-visitor site: every thread belongs to the same conceptual resource.
        memory: { thread: threadId, resource: "site-visitor" },
      });
    } catch (error) {
      // Failures available before the first byte are returned as normal JSON, so the
      // client can show a real error instead of an empty stream that just stops.
      if (error instanceof ModelUnavailableError) {
        return c.json({ error: error.message, modelId: error.modelId }, error.status);
      }

      logger?.error("Chat request failed to start", { error, threadId, modelId });
      return c.json({ error: "The model could not be reached. Try again or pick another." }, 502);
    }

    const sse = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (event: ChatEvent) => controller.enqueue(encodeSse(event));

        try {
          for await (const chunk of stream.fullStream) {
            switch (chunk.type) {
              case "text-delta":
                send({ type: "delta", text: chunk.payload.text });
                break;

              // Surfaced so the UI can show "searching the CV…" while retrieval runs,
              // which is most of the perceived latency on the first message.
              case "tool-call":
                if (chunk.payload.toolName === RESUME_SEARCH_TOOL_ID) {
                  send({ type: "searching" });
                }
                break;

              // Citations are derived server-side: the client should show the sources
              // that were actually retrieved, not ones the model claims it used.
              case "tool-result": {
                if (chunk.payload.toolName !== RESUME_SEARCH_TOOL_ID) break;

                const sources = extractSources(chunk.payload.result);
                if (sources.length > 0) send({ type: "sources", sources });
                break;
              }

              case "error":
                logger?.error("Chat stream errored", { error: chunk.payload.error, threadId });
                send({ type: "error", message: "The model stopped unexpectedly." });
                break;

              default:
                break;
            }
          }

          send({ type: "done" });
        } catch (error) {
          logger?.error("Chat stream aborted", { error, threadId, modelId });
          send({ type: "error", message: "The model stopped unexpectedly." });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(sse, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        // Tells nginx/Caddy not to buffer the response into whole chunks.
        "X-Accel-Buffering": "no",
      },
    });
  },
});

/** Tool output crosses an `unknown` boundary, so pull citations back out defensively. */
function extractSources(result: unknown): string[] {
  const shape = z.object({ results: z.array(z.object({ title: z.string() })) });
  const parsed = shape.safeParse(result);

  if (!parsed.success) return [];

  return [...new Set(parsed.data.results.map((entry) => entry.title))];
}
