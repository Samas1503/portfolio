import { db } from "@/backend/db";
import { eq } from "drizzle-orm";
import { SchemaKeys, schemas } from "../data/schemas";

const deleteDataByIdRepository = async (id: number, table: SchemaKeys) => {
  await db.delete(schemas[table].schema).where(eq(schemas[table].schema.id, id));
  return id;
};

const repository = {
  deleteDataByIdRepository,
};

export default repository;
