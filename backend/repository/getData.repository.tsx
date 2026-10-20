import { getSupabase } from "@/backend/db/supabase";
import { SchemaKeys, schemas } from "../data/schemas";

const PAGE_SIZE = 1000;

const getAllDataRepository = async (table: SchemaKeys) => {
  const { table: tableName, select } = schemas[table];
  const rows: Record<string, unknown>[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await getSupabase()
      .from(tableName)
      .select(select)
      .order("id")
      .range(from, from + PAGE_SIZE - 1)
      .overrideTypes<Record<string, unknown>[], { merge: false }>();
    if (error) throw error;
    rows.push(...data);
    if (data.length < PAGE_SIZE) return rows;
  }
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
