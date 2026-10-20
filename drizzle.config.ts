import { defineConfig } from "drizzle-kit";
import { databaseUrl } from "./backend/db/config";

export default defineConfig({
  dialect: "postgresql",
  schema: "./backend/db/schemas/schemas.tsx",
  out: "./drizzle",
  dbCredentials: { url: databaseUrl },
});
