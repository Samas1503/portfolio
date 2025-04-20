import { createUpdateSchema } from "drizzle-zod"
import { contacto, experiencia, mensajes, proyectos, servicios, skills } from "./schemas";

export const proyectosUpdateSchema = createUpdateSchema(proyectos);
export const skillsUpdateSchema  = createUpdateSchema(skills);
export const serviciosUpdateSchema  = createUpdateSchema(servicios);
export const experienciaUpdateSchema  = createUpdateSchema(experiencia);
export const contactoUpdateSchema  = createUpdateSchema(contacto);
export const mensajesUpdateSchema  = createUpdateSchema(mensajes);
