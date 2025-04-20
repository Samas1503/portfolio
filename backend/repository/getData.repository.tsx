import { db } from "@/backend/db";
import { eq } from "drizzle-orm";
import { SchemaKeys, schemas } from "../data/schemas";

const getAllDataRepository = async (table: SchemaKeys) => {
  const data = await db.select().from(schemas[table].schema);
  return data;
};

const getDataByIdRepository = async (id: number, table: SchemaKeys) => {
  const data = await db.select().from(schemas[table].schema).where(eq(schemas[table].schema.id, id));
  return data;
};

const repository = {
  getAllDataRepository,
  getDataByIdRepository,
};

export default repository;
