import { getSupabase } from "@/backend/db/supabase";
import { SchemaKeys, schemas } from "../data/schemas";

const deleteDataByIdRepository = async (id: number, table: SchemaKeys) => {
  const { error } = await getSupabase()
    .from(schemas[table].table)
    .delete()
    .eq("id", id);
  if (error) throw error;
  return id;
};

const repository = {
  deleteDataByIdRepository,
};

export default repository;
