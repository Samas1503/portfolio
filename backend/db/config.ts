import "dotenv/config";

export const databaseUrl =
  process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
