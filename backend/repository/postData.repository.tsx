import { db } from "@/backend/db";
import { SchemaKeys, schemas } from "../data/schemas";

const postDataRepository = async (data: object, table: SchemaKeys) => {
  try {
    const result = (await db.insert(schemas[table].schema).values(data)).lastInsertRowid;
    return result;
  } catch (error) {
    console.log("Error inserting data into database:", error);
    
  }
};

const repository = {
  postDataRepository,
};

export default repository;
