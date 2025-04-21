import { defineConfig } from "drizzle-kit";
import { dbConfig } from "./backend/db/config"; // Ruta al archivo de configuración

export default defineConfig({
  dialect: "mysql",
  schema: "./backend/db/schemas/schemas.tsx",
  out: "./drizzle",
  dbCredentials: dbConfig,
});
