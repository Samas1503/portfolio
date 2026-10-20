import {
  pgTable,
  integer,
  bigint,
  text,
  boolean,
  doublePrecision,
} from "drizzle-orm/pg-core";

export const project = pgTable("Proyectos", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  titulo: text("titulo"),
  image: text("image"),
  urlGithub: text("url_github"),
  urlDemo: text("url_demo"),
  estado: boolean().default(true),
}).enableRLS();

export const skills = pgTable("Skills", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  tipo: text("tipo"),
  nombre: text("nombre"),
  nivel: text("nivel"),
  valor: integer("valor"),
  estado: boolean().default(true),
}).enableRLS();

export const servicios = pgTable("Servicios", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  tipo: text("tipo"),
  icono: text("icono"),
  nombre: text("nombre"),
  estado: boolean().default(true),
}).enableRLS();

export const experience = pgTable("Experiencia", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  empresa: text("empresa"),
  cargo: text("cargo"),
  fecha_inicio: text("fecha_inicio"),
  fecha_fin: text("fecha_fin"),
  ubicacion: text("ubicacion"),
  latitud: doublePrecision("latitud"),
  longitud: doublePrecision("longitud"),
  nombreReferencia: text("nombre_referencia"),
  nroReferencia: bigint("nro_referencia", { mode: "number" }),
  estado: boolean().default(true),
}).enableRLS();

export const contacto = pgTable("Contacto", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  nombre: text("nombre"),
  titulo: text("titulo"),
  link: text("link"),
  icono: text("icono"),
  estado: boolean().default(true),
}).enableRLS();

export const mensajes = pgTable("Mensajes", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  id_mensaje: text("id_mensaje"),
  origen: text("origen"),
  nombre: text("nombre"),
  destino: text("destino"),
  mensaje: text("mensaje"),
  estado: boolean().default(true),
}).enableRLS();
