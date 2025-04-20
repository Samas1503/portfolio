import { db } from "@/backend/db";
import { eq } from "drizzle-orm";
import { SchemaKeys, schemas } from "../data/schemas";

const getAllDataRepository = async (table: SchemaKeys) => {
  const data = await db.select().from(schemas[table].schema);
  return data;
};

const getDataByIdRepository = async (id: number, table: SchemaKeys) => {
  const tableSchema = schemas[table].schema;
  const data = await db
    .select()
    .from(tableSchema)
    .where(eq(tableSchema.id, id));
  return data[0];
};

const repository = {
  getAllDataRepository,
  getDataByIdRepository,
};

export default repository;
