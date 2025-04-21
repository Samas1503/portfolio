import "dotenv/config"; // Asegúrate de que dotenv esté cargado
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const connection = await mysql.createConnection({
  host: process.env.CLEVER_CLOUD_DATABASE_HOST,
  database: process.env.CLEVER_CLOUD_DATABASE_DATABASE,
  user: process.env.CLEVER_CLOUD_DATABASE_USER,
  password: process.env.CLEVER_CLOUD_DATABASE_PASSWORD,
  port: process.env.CLEVER_CLOUD_DATABASE_PORT ? parseInt(process.env.CLEVER_CLOUD_DATABASE_PORT, 10) : 3306,
});

export const db = drizzle({ client: connection });
