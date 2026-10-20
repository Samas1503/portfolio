import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { databaseUrl } from "./config";

const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof postgres> | undefined;
};

// prepare: false is required by Supabase's transaction pooler (port 6543)
const client =
  globalForDb.client ?? postgres(databaseUrl, { prepare: false, max: 5 });

if (process.env.NODE_ENV !== "production") {
  globalForDb.client = client;
}

export const db = drizzle(client);
