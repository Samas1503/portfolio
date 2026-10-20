import { getSupabase } from "@/backend/db/supabase";
import { SchemaKeys, schemas } from "../data/schemas";

const postDataRepository = async (data: object, table: SchemaKeys) => {
  try {
    const { table: tableName, toColumns } = schemas[table];
    const { data: inserted, error } = await getSupabase()
      .from(tableName)
      .insert(toColumns(data))
      .select("id")
      .single();
    if (error) throw error;
    return inserted.id;
  } catch (error) {
    console.log("Error inserting data into database:", error);
  }
};

const repository = {
  postDataRepository,
};

export default repository;
