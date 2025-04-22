import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const globalForDb = globalThis as unknown as {
  pool: ReturnType<typeof mysql.createPool> | undefined;
};

const pool =
  globalForDb.pool ??
  mysql.createPool({
    host: process.env.CLEVER_CLOUD_DATABASE_HOST,
    database: process.env.CLEVER_CLOUD_DATABASE_DATABASE,
    user: process.env.CLEVER_CLOUD_DATABASE_USER,
    password: process.env.CLEVER_CLOUD_DATABASE_PASSWORD,
    port: process.env.CLEVER_CLOUD_DATABASE_PORT
      ? parseInt(process.env.CLEVER_CLOUD_DATABASE_PORT, 10)
      : 3306,
    waitForConnections: true,
    connectionLimit: 5,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

// Inicializamos Drizzle con el pool
export const db = drizzle(pool);
