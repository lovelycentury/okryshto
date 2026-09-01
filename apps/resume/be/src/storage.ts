import { LibSQLStore } from "@mastra/libsql";

import { prepareDbUrl } from "./config/db-url.js";
import { env } from "./config/env.js";

/**
 * Backs conversation threads and Mastra's own telemetry/eval tables. Kept in a separate
 * database from the vector index so that re-running `pnpm ingest` (which drops and
 * rebuilds the index) can never take chat history with it.
 */
export const storage = new LibSQLStore({
  id: "resume-storage",
  url: prepareDbUrl(env.STORAGE_DB_URL),
  authToken: env.STORAGE_DB_AUTH_TOKEN,
});
