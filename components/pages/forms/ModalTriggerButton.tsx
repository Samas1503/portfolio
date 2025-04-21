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
};

export const ModalTriggerButton = ({
  tipoFormulario,
  onSuccess,
  children,
}: Props) => {
  const [open, setOpen] = useState(false);
  const formConfig = formMap[tipoFormulario] as {
    schema: typeof formMap[FormType]['schema'];
    fields: FieldType[];
  };
  const { usuario } = useUsuario();

  const handleSubmit = async (data: unknown): Promise<void> => {
    const result = await apiFetch({
      resource: tipoFormulario,
      method: "POST",
      data,
    });

    const typedData = data as { tipo: string };
    onSuccess?.(result, typedData.tipo);
    setOpen(false);
  };

  return (
    usuario && (
      <>
        <div onClick={() => setOpen(true)}>{children}</div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Formulario: {tipoFormulario}</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[70vh] px-1">
              <DynamicForm
                schema={formConfig.schema}
                fields={formConfig.fields}
                onSubmit={handleSubmit}
              />
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  );
};
