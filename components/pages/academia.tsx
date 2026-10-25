"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import {
  BookOpen,
  ChevronDown,
  ExternalLink,
  Pencil,
  RefreshCw,
} from "lucide-react";
import { Button } from "../ui/button";
import { ModalTriggerButton } from "./forms/ModalTriggerButton";
import { apiFetch } from "./fetch/tech-all";
import DeleteButton from "../shared/delete-button";
import Section from "../shared/section";
import Spinner from "../shared/spinner";
import { formsData, FormType } from "./forms/formsData";
import { useUsuario } from "@/context/UserContext";
import MiniIcon3D from "@/components/three/mini-icon-3d";
type Academia = typeof formsData.academia.schema;
type Item = z.infer<Academia>;

const yearOf = (p?: string | null) => {
  const m = (p || "").match(/\d{4}/g);
  return m ? Math.max(...m.map(Number)) : 0;
};
const isOngoing = (p?: string | null) => /actualidad|actual/i.test(p || "");
const byRecent = (a: Item, b: Item) =>
  Number(isOngoing(b.periodo)) - Number(isOngoing(a.periodo)) ||
  yearOf(b.periodo) - yearOf(a.periodo) ||
  Number(b.id) - Number(a.id);

const Academia = () => {
  const [items, setItems] = useState<Item[]>();
  const [refreshing, setRefreshing] = useState(false);
  const resource = "academia" as FormType;
  const { usuario } = useUsuario();

  const fetchData = useCallback(async () => {
    const d = await apiFetch({ resource });
    setItems(d as Item[]);
  }, [resource]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReload = async () => {
    setRefreshing(true);
    try {
      await fetchData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = (id: number) =>
    setItems((prev) => prev?.filter((i) => Number(i.id) !== id));
  const handleCreate = (data: Item) =>
    setItems((prev) => [...(prev ?? []), data]);
  const handleUpdate = (data: Item) =>
    setItems((prev) =>
      prev?.map((i) => (Number(i.id) === Number(data.id) ? { ...i, ...data } : i))
    );

  const adminBtns = (item: Item) => (
    <div className="flex shrink-0 gap-2">
      <ModalTriggerButton
        tipoFormulario="academia"
        id={Number(item.id)}
        defaultValues={item}
        title={`Editar: ${item.titulo}`}
        onSuccess={(r: unknown) => handleUpdate(r as Item)}
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

  const carreras = useMemo(
    () => (items ?? []).filter((i) => i.tipo === "Carrera").sort(byRecent),
    [items]
  );
  const cursos = useMemo(
    () => (items ?? []).filter((i) => i.tipo === "Curso").sort(byRecent),
    [items]
  );

  return (
    <Section id="academia" number="04" title="Formación Académica">
      {items === undefined ? (
        <Spinner />
      ) : (
      <ol className="relative ml-2 space-y-8 border-l border-border/60 pl-6">
        {carreras.map((c, idx) => {
          const ongoing = isOngoing(c.periodo);
          return (
            <li key={c.id} className="relative">
              <span
                style={{
                  animationDelay: `${(carreras.length - 1 - idx) * 0.5}s`,
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
                  <MiniIcon3D shape="carrera" className="size-14 shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-semibold leading-snug text-card-foreground">
                      {c.titulo}
                    </h3>
                    <p className="text-sm text-muted-foreground">{c.institucion}</p>
                    {c.periodo && (
                      <p
                        className={`mt-2 inline-flex rounded-full px-3 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider ${
                          ongoing
                            ? "bg-primary text-primary-foreground"
                            : "border border-primary/40 bg-primary/10 text-primary"
                        }`}
                      >
                        {c.periodo}
                      </p>
                    )}
                    {c.descripcion && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {c.descripcion}
                      </p>
                    )}
                    {c.diploma && (
                      <a
                        href={c.diploma}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground transition hover:bg-primary hover:text-primary-foreground"
                      >
                        <ExternalLink className="size-3.5" /> Ver diploma
                      </a>
                    )}
                  </div>
                </div>
                {adminBtns(c)}
              </div>
            </li>
          );
        })}
      </ol>
      )}

      {cursos.length > 0 && (
        <div className="mt-10">
          <h3 className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            <BookOpen className="size-4 text-primary" /> Cursos y diplomaturas
          </h3>
          <div className="space-y-2">
            {cursos.map((c) => (
              <details
                key={c.id}
                className="group rounded-xl border border-border bg-card/50 backdrop-blur-sm open:border-primary/40"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
                  <div className="flex min-w-0 items-center gap-3">
                    <MiniIcon3D shape="curso" className="size-10 shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-card-foreground">
                        {c.titulo}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {c.institucion}
                        {c.periodo ? ` · ${c.periodo}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {adminBtns(c)}
                    <ChevronDown className="size-4 text-muted-foreground transition group-open:rotate-180" />
                  </div>
                </summary>
                {(c.descripcion || c.diploma) && (
                  <div className="border-t border-border/60 px-4 py-3">
                    {c.descripcion && (
                      <p className="text-sm text-muted-foreground">{c.descripcion}</p>
                    )}
                    {c.diploma && (
                      <a
                        href={c.diploma}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground transition hover:bg-primary hover:text-primary-foreground"
                      >
                        <ExternalLink className="size-3.5" /> Ver diploma
                      </a>
                    )}
                  </div>
                )}
              </details>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex items-center justify-center gap-3">
        <ModalTriggerButton
          onSuccess={(r: unknown) => handleCreate(r as Item)}
          tipoFormulario="academia"
        >
          <Button type="button">Agregar Formación</Button>
        </ModalTriggerButton>
        {usuario && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleReload}
            disabled={refreshing}
            aria-label="Recargar"
            title="Recargar"
          >
            <RefreshCw className={refreshing ? "animate-spin" : ""} />
          </Button>
        )}
      </div>
    </Section>
  );
};

export default Academia;
