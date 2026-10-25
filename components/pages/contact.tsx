"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GripVertical, Pencil, Plus, RefreshCw } from "lucide-react";
import ContactForm from "./forms/contact-form";
import Section from "../shared/section";
import DeleteButton from "../shared/delete-button";
import ContactIcon from "../shared/contact-icon";
import { ModalTriggerButton } from "./forms/ModalTriggerButton";
import { toFormValues } from "./forms/formsData";
import { Button } from "../ui/button";
import { apiFetch } from "./fetch/tech-all";
import { useUsuario } from "@/context/UserContext";
import type { Contacto } from "@/backend/data/contactos";

const byOrden = (a: Contacto, b: Contacto) =>
  (a.orden ?? Number.MAX_SAFE_INTEGER) -
    (b.orden ?? Number.MAX_SAFE_INTEGER) || a.id - b.id;

type DropTarget = { index: number; after: boolean };

const Contact = ({ contactos }: { contactos: Contacto[] }) => {
  const router = useRouter();
  const refresh = () => router.refresh();
  const { usuario } = useUsuario();

  const [items, setItems] = useState<Contacto[]>(() =>
    [...contactos].sort(byOrden)
  );
  const [refreshing, startTransition] = useTransition();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setItems([...contactos].sort(byOrden));
  }, [contactos]);

  const isSingleColumn = () => {
    const grid = gridRef.current;
    if (!grid) return true;
    const cols = getComputedStyle(grid)
      .gridTemplateColumns.split(" ")
      .filter(Boolean).length;
    return cols <= 1;
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    if (!usuario || dragIndex == null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const rect = e.currentTarget.getBoundingClientRect();
    const after = isSingleColumn()
      ? e.clientY > rect.top + rect.height / 2
      : e.clientX > rect.left + rect.width / 2;
    setDropTarget((prev) =>
      prev?.index === index && prev.after === after
        ? prev
        : { index, after }
    );
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!usuario || dragIndex == null || dropTarget == null) {
      setDragIndex(null);
      setDropTarget(null);
      return;
    }
    const prev = items;
    const next = [...items];
    const [moved] = next.splice(dragIndex, 1);
    let to = dropTarget.index + (dropTarget.after ? 1 : 0);
    if (to > dragIndex) to -= 1;
    next.splice(to, 0, moved);
    const nextWithOrden = next.map((c, i) => ({ ...c, orden: i }));

    setDragIndex(null);
    setDropTarget(null);
    setItems(nextWithOrden);

    const prevOrden = new Map(prev.map((c) => [c.id, c.orden]));
    const updates = nextWithOrden.filter((c) => prevOrden.get(c.id) !== c.orden);
    try {
      await Promise.all(
        updates.map((c) =>
          apiFetch({
            resource: "contacto",
            method: "PATCH",
            id: c.id,
            data: { orden: c.orden },
          })
        )
      );
      refresh();
    } catch (error) {
      console.log(error);
      setItems(prev);
      refresh();
    }
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDropTarget(null);
  };

  return (
    <Section id="contact" number="08" title="Contacto">
      <p className="mb-8 max-w-md leading-relaxed text-muted-foreground">
        ¿Tenés un proyecto o una propuesta? Escribime por cualquiera de estos
        medios o dejame un mensaje con el formulario.
      </p>
      <div ref={gridRef} className="grid gap-3 sm:grid-cols-3">
        {items.map((contacto, index) => {
          const isDragging = dragIndex === index;
          const indicator =
            dropTarget?.index === index && dragIndex != null && dragIndex !== index
              ? dropTarget.after
                ? isSingleColumn()
                  ? "inset-x-1 -bottom-1.5 h-1"
                  : "inset-y-1 -right-1.5 w-1"
                : isSingleColumn()
                  ? "inset-x-1 -top-1.5 h-1"
                  : "inset-y-1 -left-1.5 w-1"
              : null;
          return (
            <div
              key={contacto.id}
              draggable={!!usuario}
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", String(index));
                e.dataTransfer.effectAllowed = "move";
                setDragIndex(index);
              }}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              className={`group relative rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4 transition hover:border-primary/40 ${
                usuario ? "cursor-grab" : ""
              } ${isDragging ? "cursor-grabbing opacity-50" : ""}`}
            >
              {indicator && (
                <span
                  aria-hidden
                  className={`pointer-events-none absolute rounded bg-primary ${indicator}`}
                />
              )}
              {usuario && (
                <GripVertical
                  aria-hidden
                  className="absolute left-1 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50"
                />
              )}
              <a
                href={contacto.link ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
                draggable={false}
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
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-2">
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
        {usuario && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => startTransition(refresh)}
            disabled={refreshing}
            aria-label="Recargar"
            title="Recargar"
          >
            <RefreshCw className={refreshing ? "animate-spin" : ""} />
          </Button>
        )}
      </div>
      <div className="mt-8 rounded-xl border border-border bg-card/50 backdrop-blur-sm p-5">
        <ContactForm />
      </div>
    </Section>
  );
};

export default Contact;
