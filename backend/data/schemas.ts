import {
  contacto,
  experience,
  mensajes,
  project,
  servicios,
  skills,
} from "@/backend/db/schemas/schemas";
import {
  contactoInsertSchema,
  experienceInsertSchema,
  mensajesInsertSchema,
  proyectosInsertSchema,
  serviciosInsertSchema,
  skillsInsertSchema,
} from "@/backend/db/schemas/insert-schemas";
import {
  proyectosUpdateSchema,
  skillsUpdateSchema,
  serviciosUpdateSchema,
  experienceUpdateSchema,
  contactoUpdateSchema,
  mensajesUpdateSchema,
} from "@/backend/db/schemas/update-schemas";

export const schemas = {
  project:{
    schema: project,
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
  experience:{
    schema: experience,
    create: experienceInsertSchema,
    update: experienceUpdateSchema,
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