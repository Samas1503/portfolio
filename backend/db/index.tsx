import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import path from "path";

const dbPath = path.join(process.cwd(), "backend", "db", "sqlite.db");
const sqlite = new Database(dbPath);
export const db:BetterSQLite3Database = drizzle({ client: sqlite });
