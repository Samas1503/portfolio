"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState } from "react";
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

export function LoginForm() {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [state, formAction] = useActionState(login, undefined);

  const clientSubmit = (data: z.infer<typeof loginSchema>) => {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);

    startTransition(async () => {
      await formAction(formData);
    });
    
  };

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
