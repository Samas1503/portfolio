import { getSupabase } from "@/backend/db/supabase";
import { SchemaKeys, schemas } from "../data/schemas";

const getAllDataRepository = async (table: SchemaKeys) => {
  const { table: tableName, select } = schemas[table];
  const { data, error } = await getSupabase()
    .from(tableName)
    .select(select)
    .order("id")
    .overrideTypes<Record<string, unknown>[], { merge: false }>();
  if (error) throw error;
  return data;
};

const getDataByIdRepository = async (id: number, table: SchemaKeys) => {
  const { table: tableName, select } = schemas[table];
  const { data, error } = await getSupabase()
    .from(tableName)
    .select(select)
    .eq("id", id)
    .maybeSingle<Record<string, unknown>>();
  if (error) throw error;
  return data ?? undefined;
};

const repository = {
  getAllDataRepository,
  getDataByIdRepository,
};

export default repository;
