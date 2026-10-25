"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { CldImage, getCldImageUrl } from "next-cloudinary";
import { ExternalLink, Pencil, Trophy } from "lucide-react";
import { Button } from "../ui/button";
import { ModalTriggerButton } from "./forms/ModalTriggerButton";
import { apiFetch } from "./fetch/tech-all";
import DeleteButton from "../shared/delete-button";
import Section from "../shared/section";
import { formsData, FormType } from "./forms/formsData";
import MiniIcon3D from "@/components/three/mini-icon-3d";

type Eventos = typeof formsData.eventos.schema;
type Item = z.infer<Eventos>;

const yearOf = (p?: string | null) => {
  const m = (p || "").match(/\d{4}/g);
  return m ? Math.max(...m.map(Number)) : 0;
};
const isOngoing = (p?: string | null) => /actualidad|actual/i.test(p || "");
const byRecent = (a: Item, b: Item) =>
  Number(isOngoing(b.periodo)) - Number(isOngoing(a.periodo)) ||
  yearOf(b.periodo) - yearOf(a.periodo) ||
  Number(b.id) - Number(a.id);

const isExternalUrl = (v: string) => /^https?:\/\//i.test(v);
const certificadoHref = (v: string) =>
  isExternalUrl(v) ? v : getCldImageUrl({ src: v });

const Eventos = () => {
  const [items, setItems] = useState<Item[]>();
  const resource = "eventos" as FormType;

  useEffect(() => {
    apiFetch({ resource: "eventos" }).then((d) => setItems(d as Item[]));
  }, []);

  const handleDelete = (id: number) =>
    setItems((prev) => prev?.filter((i) => Number(i.id) !== id));
  const handleCreate = (data: Item) =>
    setItems((prev) => [...(prev ?? []), data]);
  // PATCH responde solo el id y el payload llega como FormData, así que
  // traemos la fila actualizada para refrescar el estado local.
  const handleUpdate = async (data: Item) => {
    const fresh = (await apiFetch({
      resource: "eventos",
      id: Number(data.id),
    })) as Item;
    if (!fresh) return;
    setItems((prev) =>
      prev?.map((i) => (Number(i.id) === Number(data.id) ? fresh : i))
    );
  };

  const adminBtns = (item: Item) => (
    <div className="flex shrink-0 gap-2">
      <ModalTriggerButton
        tipoFormulario="eventos"
        id={Number(item.id)}
        defaultValues={item}
        title={`Editar: ${item.titulo}`}
        onSuccess={(r: unknown) => void handleUpdate(r as Item)}
      >
        <Button type="button" variant="outline" className="size-7" aria-label="Editar">
          <Pencil />
        </Button>
      </ModalTriggerButton>
      <DeleteButton
        tipoSchema={resource}
        id={Number(item.id)}
        onSuccess={handleDelete}
        className="size-7 shrink-0"
        tipoElemento={""}
      />
    </div>
  );

  const eventos = useMemo(() => [...(items ?? [])].sort(byRecent), [items]);

  return (
    <Section id="eventos" number="05" title="Participaciones">
      <ol className="relative ml-2 space-y-8 border-l border-border/60 pl-6">
        {eventos.map((e, idx) => {
          const ongoing = isOngoing(e.periodo);
          return (
            <li key={e.id} className="relative">
              <span
                style={{
                  animationDelay: `${(eventos.length - 1 - idx) * 0.5}s`,
                }}
                className={`timeline-breathe absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full ${
                  ongoing ? "bg-primary" : "bg-muted-foreground/40"
                }`}
              />
              {ongoing && (
                <span className="absolute -left-[31px] top-1.5 h-2.5 w-2.5 animate-ping rounded-full bg-primary/60 motion-reduce:hidden" />
              )}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-4">
                  <MiniIcon3D shape="evento" className="size-14 shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-semibold leading-snug text-card-foreground">
                      {e.titulo}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {e.organizador}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {e.periodo && (
                        <p
                          className={`inline-flex rounded-full px-3 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider ${
                            ongoing
                              ? "bg-primary text-primary-foreground"
                              : "border border-primary/40 bg-primary/10 text-primary"
                          }`}
                        >
                          {e.periodo}
                        </p>
                      )}
                      {e.tipo && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          <Trophy className="size-3" aria-hidden />
                          {e.tipo}
                        </span>
                      )}
                    </div>
                    {e.descripcion && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {e.descripcion}
                      </p>
                    )}
                    {e.certificado && (
                      <a
                        href={certificadoHref(e.certificado)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex flex-col items-start gap-2"
                      >
                        {!isExternalUrl(e.certificado) && (
                          <CldImage
                            src={e.certificado}
                            width={160}
                            height={100}
                            crop="fill"
                            alt={`Certificado de ${e.titulo}`}
                            className="rounded-lg border border-border object-cover transition hover:brightness-110"
                          />
                        )}
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground transition hover:bg-primary hover:text-primary-foreground">
                          <ExternalLink className="size-3.5" /> Ver certificado
                        </span>
                      </a>
                    )}
                  </div>
                </div>
                {adminBtns(e)}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-8 flex justify-center">
        <ModalTriggerButton
          onSuccess={(r: unknown) => handleCreate(r as Item)}
          tipoFormulario="eventos"
        >
          <Button type="button">Agregar Participación</Button>
        </ModalTriggerButton>
      </div>
    </Section>
  );
};

export default Eventos;
