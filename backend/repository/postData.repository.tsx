import { db } from "@/backend/db";
import { SchemaKeys, schemas } from "../data/schemas";

const postDataRepository = async (data: object, table: SchemaKeys) => {
  try {
    const tableSchema = schemas[table].schema;
    const [result] = await db
      .insert(tableSchema)
      .values(data)
      .returning({ id: tableSchema.id });
    return result.id;
  } catch (error) {
    console.log("Error inserting data into database:", error);
    
  }
};

const repository = {
  postDataRepository,
};

export default repository;
