import { z } from "zod";
import { CONTACT_ICONS } from "@/components/shared/contact-icon";

export const PROJECT_CATEGORIES = [
  "Frontend",
  "Frontend Demo",
  "Backend",
  "Fullstack",
  "Web3",
  "Mobile",
  "Desktop",
  "Otro",
];

export const SERVICE_ICONS = [
  "PanelsTopLeft",
  "Server",
  "Database",
  "Blocks",
  "Code",
  "Brush",
  "BellPlus",
];

export const PERFIL_HEADER_FIELDS = ["nombre", "rol", "alias", "resumen", "cvUrl"];
export const PERFIL_ABOUT_FIELDS = [
  "descripcion",
  "experiencia",
  "clientes",
  "proyectos",
  "telefono",
];

export const toFormValues = (row: object) =>
  Object.fromEntries(Object.entries(row).map(([k, v]) => [k, v ?? ""]));

export const formsData = {
  contacto: {
    schema: z.object({
      id: z.number().optional(),
      nombre: z.string().min(1),
      titulo: z.string(),
      link: z.string().min(1),
      icono: z.string(),
    }),
    fields: [
      { label: "Nombre", name: "nombre", placeholder: "Ej: LinkedIn", type: "text" as const },
      {
        label: "Texto visible",
        name: "titulo",
        placeholder: "Ej: linkedin.com/in/usuario",
        type: "text" as const,
      },
      {
        label: "Link (https://…, mailto:… o tel:…)",
        name: "link",
        placeholder: "https://linkedin.com/in/usuario",
        type: "text" as const,
      },
      {
        label: "Ícono",
        name: "icono",
        placeholder: "Elegí un ícono",
        type: "dropdown" as const,
        values: Object.keys(CONTACT_ICONS),
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
      categoria: z.string().optional(),
      tags: z.string().optional(),
      descripcion: z.string().optional(),
      rol: z.string().optional(),
      periodo: z.string().optional(),
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
      {
        label: "Categoría",
        name: "categoria",
        placeholder: "Categoría del proyecto",
        type: "dropdown" as const,
        values: PROJECT_CATEGORIES,
      },
      {
        label: "Tecnologías (separadas por coma)",
        name: "tags",
        placeholder: "Next.js, Supabase, Tailwind",
        type: "text" as const,
      },
      {
        label: "Descripción",
        name: "descripcion",
        placeholder: "Qué hace el proyecto",
        type: "textarea" as const,
      },
      { label: "Rol", name: "rol", placeholder: "Ej: Backend Developer", type: "text" as const },
      { label: "Período", name: "periodo", placeholder: "Ej: 2023 - 2024", type: "text" as const },
    ],
  },
  perfil: {
    schema: z.object({
      id: z.number().optional(),
      nombre: z.string().min(1),
      rol: z.string(),
      alias: z.string(),
      resumen: z.string(),
      cvUrl: z.string(),
      descripcion: z.string().min(1),
      experiencia: z.string(),
      clientes: z.string(),
      proyectos: z.string(),
      telefono: z.string(),
    }),
    fields: [
      { label: "Nombre", name: "nombre", placeholder: "Tu nombre", type: "text" as const },
      { label: "Rol", name: "rol", placeholder: "Ej: Backend Developer", type: "text" as const },
      { label: "Alias", name: "alias", placeholder: "Ej: Samas1503", type: "text" as const },
      {
        label: "Resumen",
        name: "resumen",
        placeholder: "Una o dos líneas sobre vos",
        type: "textarea" as const,
      },
      {
        label: "Link del CV (o subí un PDF con el botón del CV)",
        name: "cvUrl",
        placeholder: "https://…",
        type: "text" as const,
      },
      {
        label: "Descripción (párrafos separados por una línea en blanco, **texto** para resaltar)",
        name: "descripcion",
        placeholder: "Contá quién sos",
        type: "textarea" as const,
      },
      {
        label: "Experiencia",
        name: "experiencia",
        placeholder: "Ej: +2 años de experiencia",
        type: "text" as const,
      },
      {
        label: "Clientes",
        name: "clientes",
        placeholder: "Ej: +20 clientes satisfechos",
        type: "text" as const,
      },
      {
        label: "Proyectos",
        name: "proyectos",
        placeholder: "Ej: +5 completados",
        type: "text" as const,
      },
      {
        label: "Teléfono",
        name: "telefono",
        placeholder: "Ej: 3884558285",
        type: "text" as const,
      },
    ],
  },
  servicios: {
    schema: z.object({
      id: z.number().optional(),
      tipo: z.string().min(1),
      icono: z.string().optional(),
      nombre: z.string().min(1),
    }),
    fields: [
      {
        label: "Categoría",
        name: "tipo",
        placeholder: "Ej: Desarrollo Web",
        type: "text" as const,
      },
      {
        label: "Ícono",
        name: "icono",
        placeholder: "Ícono de la categoría",
        type: "dropdown" as const,
        values: SERVICE_ICONS,
      },
      {
        label: "Servicio",
        name: "nombre",
        placeholder: "Ej: Desarrollo de APIs REST",
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
      excluida: z.boolean().nullish(),
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
          "Herramientas",
          "Web3",
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
  academia: {
    schema: z.object({
      id: z.number().optional(),
      tipo: z.enum(["Carrera", "Curso"]),
      institucion: z.string(),
      titulo: z.string(),
      periodo: z.string(),
      descripcion: z.string(),
    }),
    fields: [
      { label: "Tipo", name: "tipo", placeholder: "Tipo", type: "dropdown" as const, values: ["Carrera", "Curso"] },
      { label: "Institución", name: "institucion", placeholder: "Ej: UNJu", type: "text" as const },
      { label: "Título / Curso", name: "titulo", placeholder: "Ej: Ingeniería Informática", type: "text" as const },
      { label: "Período", name: "periodo", placeholder: "Ej: 2020 - 2024", type: "text" as const },
      { label: "Descripción", name: "descripcion", placeholder: "Opcional", type: "textarea" as const },
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
