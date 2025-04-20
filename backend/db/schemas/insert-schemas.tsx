import { createInsertSchema } from "drizzle-zod"
import { contacto, experiencia, mensajes, proyectos, servicios, skills } from "./schemas";

export const proyectosInsertSchema = createInsertSchema(proyectos);
export const skillsInsertSchema  = createInsertSchema(skills);
export const serviciosInsertSchema  = createInsertSchema(servicios);
export const experienciaInsertSchema  = createInsertSchema(experiencia);
export const contactoInsertSchema  = createInsertSchema(contacto);
export const mensajesInsertSchema  = createInsertSchema(mensajes);