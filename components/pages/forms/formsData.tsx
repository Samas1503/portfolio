import { z } from "zod";

export const formsData = {
  contacto: {
    schema: z.object({
      id: z.number().optional(),
      username: z.string().min(2),
      email: z.string().email(),
      message: z.string(),
    }),
    fields: [
      {
        label: "Username",
        name: "username",
        placeholder: "Tu nombre",
        type: "text",
      },
      {
        label: "Email",
        name: "email",
        placeholder: "Tu correo",
        type: "email" as const,
      },
      {
        label: "Mensaje",
        name: "message",
        placeholder: "Tu mensaje",
        type: "textarea" as const,
      },
    ],
  },
  project: {
    schema: z.object({
      id: z.number().optional(),
      titulo: z.string(),
      image: z.string(),
      urlGithub: z.string(),
      urlDemo: z.string(),
    }),
    fields: [
      { label: "Titulo", name: "titulo", placeholder: "Titulo del Proyecto" },
      {
        label: "Imagen del Proyecto",
        name: "image",
        placeholder: "Imagen del Proyecto",
        accept: "image/*",
        type: "file" as const,
      },
      {
        label: "URL del Repositorio",
        name: "urlGithub",
        placeholder: "URL del Repositorio",
        type: "text" as const,
      },
      {
        label: "URL de la Demo  ",
        name: "urlDemo",
        placeholder: "URL de la demo",
        type: "text" as const,
      },
    ],
  },
  skills: {
    schema: z.object({
      id: z.number().optional(),
      tipo: z.enum([
        "Frontend Development",
        "Backend Development",
        "Database Management",
        "DevOps",
      ]),
      nombre: z.string(),
      nivel: z.enum(["Básico", "Intermedio", "Experimentado"]),
      valor: z.coerce.number(),
      resource: z.string().optional(),
    }),
    fields: [
      {
        label: "tipo",
        name: "tipo",
        placeholder: "Tipo de Habilidad",
        type: "dropdown",
        values: [
          "Frontend Development",
          "Backend Development",
          "Database Management",
          "DevOps",
        ],
      },
      {
        label: "nombre",
        name: "nombre",
        placeholder: "Nombre de la Habilidad",
        type: "text" as const,
      },
      {
        label: "nivel",
        name: "nivel",
        placeholder: "Nivel de la Habilidad",
        type: "dropdown" as const,
        values: ["Básico", "Intermedio", "Experimentado"],
      },
      {
        label: "valor",
        name: "valor",
        placeholder: "Valor del 1 al 100",
        type: "number" as const,
        max: "100",
        min: "1",
      },
    ],
  },
  experience: {
    schema: z.object({
      id: z.number().optional(),
      empresa: z.string(),
      cargo: z.string(),
      fecha_inicio: z.string(),
      fecha_fin: z.string(),
      ubicacion: z.string(),
      latitud: z.coerce.number(),
      longitud: z.coerce.number(),
      nombreReferencia: z.string(),
      nroReferencia: z.coerce.number(),
    }),
    fields: [
      {
        label: "Nombre de la Empresa",
        name: "empresa",
        placeholder: "Nombre de la Empresa",
        type: "text" as const,
      },
      {
        label: "Nombre del Cargo",
        name: "cargo",
        placeholder: "Nivel del Cargo",
        type: "text" as const,
      },
      {
        label: "Fecha de Inicio",
        name: "fecha_inicio",
        placeholder: "Inicio",
        type: "date" as const,
      },
      {
        label: "Fecha de Finalizacion",
        name: "fecha_fin",
        placeholder: "Fin",
        type: "date" as const,
      },
      {
        label: "Ubicacion",
        name: "ubicacion",
        placeholder: "Ubicacion del Trabajo",
        type: "text" as const,
      },
      {
        label: "Geolocalizacion",
        name: "geolocalizacion",
        placeholder: "geolocalizacion",
        type: "geolocalization" as const,
      },
      {
        label: "Latitud",
        name: "latitud",
        placeholder: "Latitud",
        type: "hidden" as const,
      },
      {
        label: "Longitud",
        name: "longitud",
        placeholder: "Longitud",
        type: "hidden" as const,
      },
      {
        label: "Nombre de Referencia",
        name: "nombreReferencia",
        placeholder: "Nombre de la Referencia",
        type: "text" as const,
      },
      {
        label: "Nro de Referencia",
        name: "nroReferencia",
        placeholder: "Nro de Referencia",
        type: "number" as const,
      },
    ],
  },
  mensajes: {
    schema: z.object({
      id: z.number().optional(),
      id_mensaje: z.string(),
      origen: z.string(),
      nombre: z.string(),
      destino: z.string(),
      mensaje: z.string(),
    }),
    fields: [
      {
        label: "id_mensaje",
        name: "id_mensaje",
        placeholder: "id_mensaje",
        type: "hidden",
      },
      {
        label: "origen",
        name: "origen",
        placeholder: "Correo electronico Emisor",
        type: "text",
      },
      {
        label: "nombre",
        name: "nombre",
        placeholder: "Nombre del Emisor",
        type: "text",
      },
      {
        label: "destino",
        name: "destino",
        placeholder: "Correo electronico Receptor",
        type: "text",
      },
      {
        label: "mensaje",
        name: "mensaje",
        placeholder: "Mensaje",
        type: "text",
      },
    ],
  },
};

export type FormType = keyof typeof formsData;
