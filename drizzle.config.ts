import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./backend/db/schemas/schemas.tsx",
  out: "./drizzle",
  dbCredentials: {
    url: "./backend/db/sqlite.db"
  },
});
