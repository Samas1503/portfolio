"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState, useEffect } from "react";
import { z } from "zod";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "./submitButton";
import loginSchema from "./schema";
import { login } from "./actions";
import { useUsuario } from "@/context/UserContext";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [state, formAction] = useActionState(login, undefined);
  const { usuario, setUsuario } = useUsuario();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const clientSubmit = (data: z.infer<typeof loginSchema>) => {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);

    startTransition(async () => {
      await formAction(formData);
    });

    setUsuario(true);
  };

  useEffect(() => {
    if (usuario) {
      router.push("/");
    }
  }, [usuario]);
  
  return (
    <Form {...form}>
      <form
        action={formAction}
        onClick={form.handleSubmit(clientSubmit)}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="correo electrónico" {...field} />
              </FormControl>
              <FormDescription>Ingresa tu correo electrónico</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input placeholder="contraseña" type="password" {...field} />
              </FormControl>
              <FormDescription>Ingresa tu contraseña</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <SubmitButton />
      </form>
    </Form>
  );
}
