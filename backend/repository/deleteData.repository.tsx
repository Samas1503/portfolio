import { db } from "@/backend/db";
import { eq } from "drizzle-orm";
import { SchemaKeys, schemas } from "../data/schemas";

const deleteDataByIdRepository = async (id: number, table: SchemaKeys) => {
  const data = await db.delete(schemas[table].schema).where(eq(schemas[table].schema.id, id));
  return data;
};

const repository = {
  deleteDataByIdRepository,
};

export default repository;
