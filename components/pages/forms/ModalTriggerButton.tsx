"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DynamicForm } from "./DynamicForm";
import { formsData, FormType } from "./formsData";
import { useUsuario } from "@/context/UserContext";
import { apiFetch } from "../fetch/tech-all";
import { FieldType } from "./types";

// Mapa de formularios disponibles
const formMap = formsData;

type Props = {
  tipoFormulario: FormType;
  children: React.ReactNode;
  onSuccess?: (result: unknown, tipo: string) => void;
  /** Si se pasa, el formulario edita ese registro (PATCH) en vez de crear uno. */
  id?: number;
  defaultValues?: Record<string, unknown>;
  /** Campos a omitir (p. ej. la imagen al editar un proyecto). */
  omitFields?: string[];
  transform?: (data: Record<string, unknown>) => unknown;
  title?: string;
};

export const ModalTriggerButton = ({
  tipoFormulario,
  onSuccess,
  children,
  id,
  defaultValues,
  omitFields = [],
  transform,
  title,
}: Props) => {
  const [open, setOpen] = useState(false);
  const formConfig = formMap[tipoFormulario] as {
    schema: (typeof formMap)[FormType]["schema"];
    fields: FieldType[];
  };
  const isEdit = id != null;
  const fields = formConfig.fields.filter((f) => !omitFields.includes(f.name));
  const schema = omitFields.length
    ? (
        formConfig.schema as unknown as {
          omit: (keys: Record<string, true>) => typeof formConfig.schema;
        }
      ).omit(Object.fromEntries(omitFields.map((k) => [k, true])))
    : formConfig.schema;
  const { usuario } = useUsuario();

  const handleSubmit = async (data: unknown): Promise<void> => {
    const payload =
      transform && !(data instanceof FormData)
        ? transform(data as Record<string, unknown>)
        : data;
    const result = await apiFetch({
      resource: tipoFormulario,
      method: isEdit ? "PATCH" : "POST",
      id,
      data: payload,
    });

    const typedData = data as { tipo: string };
    onSuccess?.(isEdit ? { ...(payload as object), id } : result, typedData.tipo);
    setOpen(false);
  };

  return (
    usuario && (
      <>
        <div onClick={() => setOpen(true)}>{children}</div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {title ?? `${isEdit ? "Editar" : "Formulario"}: ${tipoFormulario}`}
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[70vh] px-1">
              {open && (
                <DynamicForm
                  schema={schema}
                  fields={fields}
                  onSubmit={handleSubmit}
                  defaultValues={defaultValues}
                  submitLabel={isEdit ? "Guardar cambios" : "Enviar"}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  );
};
