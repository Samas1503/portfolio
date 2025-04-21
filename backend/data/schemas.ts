import {
  contacto,
  experiencia,
  mensajes,
  proyectos,
  servicios,
  skills,
} from "@/backend/db/schemas/schemas";
import {
  contactoInsertSchema,
  experienciaInsertSchema,
  mensajesInsertSchema,
  proyectosInsertSchema,
  serviciosInsertSchema,
  skillsInsertSchema,
} from "@/backend/db/schemas/insert-schemas";
import {
  proyectosUpdateSchema,
  skillsUpdateSchema,
  serviciosUpdateSchema,
  experienciaUpdateSchema,
  contactoUpdateSchema,
  mensajesUpdateSchema,
} from "@/backend/db/schemas/update-schemas";

export const schemas = {
  proyectos:{
    schema: proyectos,
    create: proyectosInsertSchema,
    update: proyectosUpdateSchema,
  },
  skills:{
    schema: skills,
    create: skillsInsertSchema,
    update: skillsUpdateSchema,
  },
  servicios:{
    schema: servicios,
    create: serviciosInsertSchema,
    update: serviciosUpdateSchema,
  },
  work:{
    schema: experiencia,
    create: experienciaInsertSchema,
    update: experienciaUpdateSchema,
  },
  contacto:{
    schema: contacto,
    create: contactoInsertSchema,
    update: contactoUpdateSchema,
  },
  mensajes:{
    schema: mensajes,
    create: mensajesInsertSchema,
    update: mensajesUpdateSchema,
  },
};

export type SchemaKeys = keyof typeof schemas;
export type SchemasModes = "create" | "update";