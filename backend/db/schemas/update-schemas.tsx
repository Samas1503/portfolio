import { createUpdateSchema } from "drizzle-zod"
import { contacto, experience, mensajes, project, servicios, skills } from "./schemas";

export const proyectosUpdateSchema = createUpdateSchema(project);
export const skillsUpdateSchema  = createUpdateSchema(skills);
export const serviciosUpdateSchema  = createUpdateSchema(servicios);
export const experienceUpdateSchema  = createUpdateSchema(experience);
export const contactoUpdateSchema  = createUpdateSchema(contacto);
export const mensajesUpdateSchema  = createUpdateSchema(mensajes);
