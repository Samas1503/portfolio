"use server";

import { createSession, deleteSession } from "@/app/lib/session";
import { redirect } from "next/navigation";
import loginSchema from "./schema";

const testUser = {
  id: "1",
  email: "samueleliasparedes.10@gmail.com",
  password: "Sampar.10",
};

export async function login(prevState: unknown, formData: FormData) {
  const result = loginSchema.safeParse(Object.fromEntries(formData));
  
  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }
  
  const { email, password } = result.data;

  if (email !== testUser.email || password !== testUser.password) {
    return {
      errors: {
        email: ["Invalid email or password"],
      },
    };
  }
  
  await createSession(testUser.id);

  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
