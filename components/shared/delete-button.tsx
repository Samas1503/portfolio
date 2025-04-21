"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormType } from "@/components/pages/forms/formsData";
import { apiFetch } from "@/components/pages/fetch/tech-all";

type Props = {
  id: number;
  tipoElemento: string,
  tipoSchema: FormType;
  className: string;
  onSuccess?: (idEliminado: number, tipo: FormType) => void;
};

const deleteElement = async (id: number, tipo: FormType) => {  
  const response = await apiFetch({ resource: tipo, method: "DELETE", id });
  return response;
};

const DeleteButton = ({ id, tipoSchema, tipoElemento, onSuccess, className }: Props) => {
  return (
    <Button
      className={className}
      onClick={() => {
        deleteElement(id, tipoSchema);
        onSuccess?.(id, tipoElemento);
      }}
      type="button"
    >
      <X />
    </Button>
  );
};

export default DeleteButton;
