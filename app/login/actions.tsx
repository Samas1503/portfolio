"use server";

import { createSession, deleteSession } from "@/app/lib/session";
import { hashPassword } from "@/app/lib/password";
import { getSupabase } from "@/backend/db/supabase";
import { redirect } from "next/navigation";
import loginSchema from "./schema";

export async function login(prevState: unknown, formData: FormData) {
  const result = loginSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { email, password } = result.data;
  const supabase = getSupabase();
  const hash = hashPassword(password);

  const { data: user } = await supabase
    .from("Usuarios")
    .select("id")
    .eq("email", email)
    .eq("password_hash", hash)
    .maybeSingle();

  let userId = user?.id;

  if (!userId) {
    // Bootstrap: si todavía no existe el usuario en la BD y las credenciales
    // coinciden con las de entorno, se crea el usuario una sola vez.
    const { data: existing } = await supabase
      .from("Usuarios")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (
      !existing &&
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const { data: created } = await supabase
        .from("Usuarios")
        .insert({ email, password_hash: hash, nombre: "Admin" })
        .select("id")
        .single();
      userId = created?.id;
    }
  }

  if (!userId) {
    return {
      errors: {
        email: ["Email o contraseña inválidos"],
      },
    };
  }

  await createSession(String(userId));

  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
