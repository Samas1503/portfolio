"use server";

import { createSession, deleteSession } from "@/app/lib/session";
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

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (
    !adminEmail ||
    !adminPassword ||
    email !== adminEmail ||
    password !== adminPassword
  ) {
    return {
      errors: {
        email: ["Invalid email or password"],
      },
    };
  }
  
  await createSession("1");

  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
