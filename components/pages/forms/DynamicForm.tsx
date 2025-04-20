import { Path, PathValue, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DynamicFormProps } from "./types";
import { number, z } from "zod";
import {
  DropdownMenu,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { useState } from "react";
import GoogleMaps from "../google-maps";

export function DynamicForm<T extends z.ZodTypeAny>({
  schema,
  fields,
  onSubmit,
}: DynamicFormProps<T>) {
  const [dropdownValues, setDropdownValues] = useState<
    Record<string, string | undefined>
  >({});
  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues: Object.fromEntries(
      fields.map((f) => {
        const isNumber =
          f.type === "number" ||
          f.type === "hidden" ||
          f.name === "longitud" ||
          f.name === "latitud";
        return [f.name, isNumber ? 0 : ""];
      })
    ) as z.infer<T>,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {fields.map((field) => {
          return (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name as Path<z.infer<T>>}
              render={({ field: rhfField }) => (
                <FormItem>
                  <FormLabel>
                    {" "}
                    {field.type !== "hidden" ? field.label : ""}{" "}
                  </FormLabel>
                  <FormControl>
                    {field.type === "textarea" ? (
                      <Textarea {...rhfField} placeholder={field.placeholder} />
                    ) : field.type === "dropdown" ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline">
                            {dropdownValues[field.name] || field.placeholder}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full dark:bg-slate-800 py-3 px-6 rounded border">
                          <DropdownMenuLabel>
                            {field.placeholder}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuRadioGroup
                            value={dropdownValues[field.name]}
                            onValueChange={(value) => {
                              setDropdownValues((prev) => ({
                                ...prev,
                                [field.name]: value,
                              }));
                              form.setValue(
                                field.name as Path<z.infer<T>>,
                                value as PathValue<z.infer<T>, Path<z.infer<T>>>
                              );
                            }}
                          >
                            {field?.values?.map((value, index) => (
                              <DropdownMenuRadioItem
                                className=""
                                key={index}
                                value={value}
                              >
                                {value}
                              </DropdownMenuRadioItem>
                            )) || null}
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : field.type === "hidden" ? (
                      <p className="hidden" hidden={true}>
                        {field.label}
                      </p>
                    ) : field.type === "geolocalization" ? (
                      <GoogleMaps
                        value={form.getValues(field.name as Path<z.infer<T>>)}
                        onLocationChange={(coords) => {
                          const lat = Number(coords.lat);
                          const lng = Number(coords.lng);

                          form.setValue("latitud", lat, {
                            shouldValidate: true,
                          });
                          form.setValue("longitud", lng, {
                            shouldValidate: true,
                          });
                        }}
                      />
                    ) : (
                      <Input
                        {...rhfField}
                        placeholder={field.placeholder}
                        type={field.type ?? "text"}
                        accept={field.accept || undefined}
                        max={field.max || undefined}
                        min={field.min || undefined}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })}
        <Button type="submit">Enviar</Button>
      </form>
    </Form>
  );
}
