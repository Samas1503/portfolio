import { db } from "@/backend/db";
import { SchemaKeys, schemas } from "../data/schemas";
import { eq } from "drizzle-orm";

const updateDataRepository = async (id: number,data: object, table: SchemaKeys) => {
  try {
    const result = await db.update(schemas[table].schema)
    .set(data)
    .where(eq(schemas[table].schema.id, id))
    .returning({ updatedId: schemas[table].schema.id });
    return result;
  } catch (error) {
    console.log("Error updating data repository", error);
  }
};

const repository = {
  updateDataRepository,
};

export default repository;
