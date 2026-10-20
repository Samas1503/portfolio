import { z } from "zod";
import type { Database } from "@/backend/db/database.types";

type TableName = keyof Database["public"]["Tables"];

const text = z.string().nullable();
const int4 = z.number().int().min(-2147483648).max(2147483647);
const int = int4.nullable();
const bigint = z
  .number()
  .int()
  .min(Number.MIN_SAFE_INTEGER)
  .max(Number.MAX_SAFE_INTEGER)
  .nullable();
const double = z.number().nullable();
const bool = z.boolean().nullable();

// API keys are camelCase; `columns` maps the ones that differ from the DB column name.
function defineTable<T extends z.ZodRawShape>(
  table: TableName,
  fields: T,
  columns: Partial<Record<keyof T, string>> = {}
) {
  const columnOf = (key: string) =>
    (columns as Record<string, string | undefined>)[key] ?? key;

  const select = ["id", ...Object.keys(fields)]
    .map((key) => (columnOf(key) === key ? key : `${key}:${columnOf(key)}`))
    .join(",");

  const toColumns = (data: object) =>
    Object.fromEntries(
      Object.entries(data).map(([key, value]) => [columnOf(key), value])
    );

  const create = z
    .object({ id: int4.optional() })
    .extend(fields)
    .partial();

  return { table, select, toColumns, create, update: create };
}

export const schemas = {
  project: defineTable(
    "Proyectos",
    { titulo: text, image: text, urlGithub: text, urlDemo: text, estado: bool },
    { urlGithub: "url_github", urlDemo: "url_demo" }
  ),
  skills: defineTable("Skills", {
    tipo: text,
    nombre: text,
    nivel: text,
    valor: int,
    estado: bool,
  }),
  servicios: defineTable("Servicios", {
    tipo: text,
    icono: text,
    nombre: text,
    estado: bool,
  }),
  experience: defineTable(
    "Experiencia",
    {
      empresa: text,
      cargo: text,
      fecha_inicio: text,
      fecha_fin: text,
      ubicacion: text,
      latitud: double,
      longitud: double,
      nombreReferencia: text,
      nroReferencia: bigint,
      estado: bool,
    },
    { nombreReferencia: "nombre_referencia", nroReferencia: "nro_referencia" }
  ),
  contacto: defineTable("Contacto", {
    nombre: text,
    titulo: text,
    link: text,
    icono: text,
    estado: bool,
  }),
  mensajes: defineTable("Mensajes", {
    id_mensaje: text,
    origen: text,
    nombre: text,
    destino: text,
    mensaje: text,
    estado: bool,
  }),
};

export type SchemaKeys = keyof typeof schemas;
export type SchemasModes = "create" | "update";
