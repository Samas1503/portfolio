import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email({ message: "Direccion de correo inválida" }).trim(),
  password: z
    .string()
    .min(8, { message: "La contraseña debe tener por lo menos 8 caracteres" })
    .trim(),
});


export default loginSchema;