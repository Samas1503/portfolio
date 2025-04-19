import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./db/schemas.tsx",
  out: "./drizzle",
  dbCredentials: {
    url: "./db/sqlite.db"
  },
});
