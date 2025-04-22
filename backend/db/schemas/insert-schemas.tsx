import { createInsertSchema } from "drizzle-zod"
import { contacto, experience, mensajes, project, servicios, skills } from "./schemas";

export const proyectosInsertSchema = createInsertSchema(project);
export const skillsInsertSchema  = createInsertSchema(skills);
export const serviciosInsertSchema  = createInsertSchema(servicios);
export const experienceInsertSchema  = createInsertSchema(experience);
export const contactoInsertSchema  = createInsertSchema(contacto);
export const mensajesInsertSchema  = createInsertSchema(mensajes);