import { getSupabase } from "@/backend/db/supabase";
import { SchemaKeys, schemas } from "../data/schemas";

const updateDataRepository = async (
  id: number,
  data: object,
  table: SchemaKeys
) => {
  try {
    const { table: tableName, toColumns } = schemas[table];
    const { error } = await getSupabase()
      .from(tableName)
      .update(toColumns(data) as never)
      .eq("id", id);
    if (error) throw error;
    return id;
  } catch (error) {
    console.log("Error updating data repository", error);
  }
};

const repository = {
  updateDataRepository,
};

export default repository;
