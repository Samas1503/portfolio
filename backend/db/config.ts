import "dotenv/config";

export const dbConfig = {
  host: process.env.CLEVER_CLOUD_DATABASE_HOST || "localhost",
  database: process.env.CLEVER_CLOUD_DATABASE_DATABASE || "default_database",
  user: process.env.CLEVER_CLOUD_DATABASE_USER || "default_user",
  password: process.env.CLEVER_CLOUD_DATABASE_PASSWORD || "default_password",
  port: process.env.CLEVER_CLOUD_DATABASE_PORT
    ? parseInt(process.env.CLEVER_CLOUD_DATABASE_PORT, 10)
    : 3306,
};
