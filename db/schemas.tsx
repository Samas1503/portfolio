import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";

export const proyectos = sqliteTable("Proyectos", {
  id: integer("id"),
  titlo: text("titlo"),
  imagen: text("imagen"),
  urlGithub: text("url_github"),
  urlDemo: text("url_demo"),
  estado: integer({mode: "boolean"}),
});

export const skills = sqliteTable("Skills", {
    id: integer("id"),
    tipo: text("tipo"),
    nombre: text("nombre"),
    nivel: text("nivel"),
    valor: integer("valor"),
    estado: integer({mode: "boolean"}),
});

export const servicios = sqliteTable("Servicios", {
    id: integer("id"),
    tipo: text("tipo"),
    icono: text("icono"),
    nombre: text("nombre"),
    estado: integer({mode: "boolean"}),
});

export const experiencia = sqliteTable("Experiencia", {
  id: integer("id"),
  empresa: text("empresa"),
  cargo: text("cargo"),
  fecha_inicio: text("fecha_inicio"),
  fecha_fin: text("fecha_fin"),
  ubicacion: text("ubicacion"),
  latitud: real("latitud"),
  longitud: real("longitud"),
  nombreReferencia: text("nombre_referencia"),
  nroReferencia: integer("nro_referencia"),
  estado: integer({mode: "boolean"}),
});

export const contacto = sqliteTable("Contacto", {
  id: integer("id"),
  nombre: text("nombre"),
  titulo: text("titulo"),
  link: text("link"),
  icono: text("icono"),
  estado: integer({mode: "boolean"}),
});
