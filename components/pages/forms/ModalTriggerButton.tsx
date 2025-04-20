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

// Mapa de formularios disponibles
const formMap = formsData;

type Props = {
  tipoFormulario: FormType;
  children: React.ReactNode;
};

export const ModalTriggerButton = ({ tipoFormulario, children }: Props) => {
  const [open, setOpen] = useState(false);
  const formConfig = formMap[tipoFormulario];
  const { usuario } = useUsuario();

  const handleSubmit = async (data: unknown): Promise<void> => {
    console.log(`Datos de ${tipoFormulario}:`, data);
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
