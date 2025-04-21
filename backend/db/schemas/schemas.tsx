import { mysqlTable, int, text, boolean, float } from "drizzle-orm/mysql-core";
// import { mysqlTable, integer, text, real } from "drizzle-orm/sqlite-core";

export const proyectos = mysqlTable("Proyectos", {
  id: int().primaryKey().autoincrement().notNull(),
  titulo: text("titulo"),
  image: text("image"),
  urlGithub: text("url_github"),
  urlDemo: text("url_demo"),
  estado: boolean().default(true),
});

export const skills = mysqlTable("Skills", {
  id: int().primaryKey().autoincrement().notNull(),
  tipo: text("tipo"),
  nombre: text("nombre"),
  nivel: text("nivel"),
  valor: int("valor"),
  estado: boolean().default(true),
});

export const servicios = mysqlTable("Servicios", {
  id: int().primaryKey().autoincrement().notNull(),
  tipo: text("tipo"),
  icono: text("icono"),
  nombre: text("nombre"),
  estado: boolean().default(true),
});

export const experiencia = mysqlTable("Experiencia", {
  id: int().primaryKey().autoincrement().notNull(),
  empresa: text("empresa"),
  cargo: text("cargo"),
  fecha_inicio: text("fecha_inicio"),
  fecha_fin: text("fecha_fin"),
  ubicacion: text("ubicacion"),
  latitud: float("latitud"),
  longitud: float("longitud"),
  nombreReferencia: text("nombre_referencia"),
  nroReferencia: int("nro_referencia"),
  estado: boolean().default(true),
});

export const contacto = mysqlTable("Contacto", {
  id: int().primaryKey().autoincrement().notNull(),
  nombre: text("nombre"),
  titulo: text("titulo"),
  link: text("link"),
  icono: text("icono"),
  estado: boolean().default(true),
});

export const mensajes = mysqlTable("Mensajes", {
  id: int().primaryKey().autoincrement().notNull(),
  id_mensaje: text("id_mensaje"),
  origen: text("origen"),
  nombre: text("nombre"),
  destino: text("destino"),
  mensaje: text("mensaje"),
  estado: boolean().default(true),
});
