"use client";

import { useRouter } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import ContactForm from "./forms/contact-form";
import Section from "../shared/section";
import DeleteButton from "../shared/delete-button";
import ContactIcon from "../shared/contact-icon";
import { ModalTriggerButton } from "./forms/ModalTriggerButton";
import { toFormValues } from "./forms/formsData";
import { Button } from "../ui/button";
import type { Contacto } from "@/backend/data/contactos";

const Contact = ({ contactos }: { contactos: Contacto[] }) => {
  const router = useRouter();
  const refresh = () => router.refresh();

  return (
    <Section id="contact" number="07" title="Contacto">
      <p className="mb-8 max-w-md leading-relaxed text-muted-foreground">
        ¿Tenés un proyecto o una propuesta? Escribime por cualquiera de estos
        medios o dejame un mensaje con el formulario.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {contactos.map((contacto) => (
          <div
            key={contacto.id}
            className="group relative rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4 transition hover:border-primary/40"
          >
            <a
              href={contacto.link ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <span className="text-primary">
                <ContactIcon name={contacto.icono} />
              </span>
              <p className="mt-3 text-sm font-semibold text-card-foreground">
                {contacto.nombre}
              </p>
              <p className="break-all text-xs text-muted-foreground group-hover:text-primary">
                {contacto.titulo}
              </p>
            </a>
            <div className="absolute right-2 top-2 flex gap-1">
              <ModalTriggerButton
                tipoFormulario="contacto"
                id={contacto.id}
                defaultValues={toFormValues(contacto)}
                title="Editar red"
                onSuccess={refresh}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-6"
                  aria-label="Editar red"
                >
                  <Pencil />
                </Button>
              </ModalTriggerButton>
              <DeleteButton
                tipoSchema="contacto"
                id={contacto.id}
                tipoElemento=""
                className="size-6"
                onSuccess={refresh}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex">
        <ModalTriggerButton
          tipoFormulario="contacto"
          title="Agregar red"
          transform={(data) => ({ ...data, estado: true })}
          onSuccess={refresh}
        >
          <Button type="button" variant="outline" size="sm">
            <Plus /> Agregar red
          </Button>
        </ModalTriggerButton>
      </div>
      <div className="mt-8 rounded-xl border border-border bg-card/50 backdrop-blur-sm p-5">
        <ContactForm />
      </div>
    </Section>
  );
};

export default Contact;
