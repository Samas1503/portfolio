"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BellPlus,
  Blocks,
  Brush,
  Check,
  Code,
  Database,
  GripVertical,
  PanelsTopLeft,
  Server,
  type LucideIcon,
} from "lucide-react";
import Section from "../shared/section";
import { apiFetch } from "./fetch/tech-all";
import { useUsuario } from "@/context/UserContext";
import { ModalTriggerButton } from "./forms/ModalTriggerButton";
import DeleteButton from "../shared/delete-button";
import { Button } from "../ui/button";

type Servicio = {
  id: number;
  tipo: string | null;
  icono: string | null;
  nombre: string | null;
  estado: boolean | null;
  orden: number | null;
};

const ICONS: Record<string, LucideIcon> = {
  PanelsTopLeft,
  Server,
  Database,
  Blocks,
  Code,
  Brush,
  BellPlus,
};

const resource = "servicios";

const byOrden = (a: Servicio, b: Servicio) =>
  (a.orden ?? Number.MAX_SAFE_INTEGER) -
    (b.orden ?? Number.MAX_SAFE_INTEGER) || a.id - b.id;

type DragSource = { tipo: string; index: number };
type DropTarget = { tipo: string; index: number; after: boolean };
type GroupDropTarget = { tipo: string; after: boolean };

const minOrden = (items: Servicio[]) =>
  items.reduce(
    (m, s) => Math.min(m, s.orden ?? Number.MAX_SAFE_INTEGER),
    Number.MAX_SAFE_INTEGER
  );

const byGroup = (
  a: [string, Servicio[]],
  b: [string, Servicio[]]
) => minOrden(a[1]) - minOrden(b[1]);

const Services = () => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const { usuario } = useUsuario();
  const [dragSource, setDragSource] = useState<DragSource | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [dragGroup, setDragGroup] = useState<string | null>(null);
  const [groupDropTarget, setGroupDropTarget] = useState<GroupDropTarget | null>(
    null
  );
  const listRefs = useRef<Record<string, HTMLUListElement | null>>({});

  useEffect(() => {
    apiFetch({ resource }).then((data) => setServicios(data as Servicio[]));
  }, []);

  const toggle = async (item: Servicio) => {
    const estado = !item.estado;
    setServicios((prev) =>
      prev.map((s) => (s.id === item.id ? { ...s, estado } : s))
    );
    try {
      await apiFetch({ resource, method: "PATCH", id: item.id, data: { estado } });
    } catch (error) {
      console.error("No se pudo actualizar el servicio", error);
      setServicios((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, estado: !estado } : s))
      );
    }
  };

  const groups = useMemo(() => {
    const map = new Map<string, Servicio[]>();
    servicios
      .filter((s) => usuario || s.estado)
      .forEach((s) => {
        const key = s.tipo ?? "Otros";
        map.set(key, [...(map.get(key) ?? []), s]);
      });
    map.forEach((items) => items.sort(byOrden));
    return Array.from(map.entries()).sort(byGroup);
  }, [servicios, usuario]);

  const isSingleColumn = (tipo: string) => {
    const ul = listRefs.current[tipo];
    if (!ul) return true;
    const cols = getComputedStyle(ul)
      .gridTemplateColumns.split(" ")
      .filter(Boolean).length;
    return cols <= 1;
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLLIElement>,
    tipo: string,
    index: number
  ) => {
    if (!usuario || dragSource == null || dragSource.tipo !== tipo) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const rect = e.currentTarget.getBoundingClientRect();
    const after = isSingleColumn(tipo)
      ? e.clientY > rect.top + rect.height / 2
      : e.clientX > rect.left + rect.width / 2;
    setDropTarget((prev) =>
      prev?.tipo === tipo && prev.index === index && prev.after === after
        ? prev
        : { tipo, index, after }
    );
  };

  const handleDrop = async (
    e: React.DragEvent<HTMLLIElement>,
    tipo: string,
    items: Servicio[]
  ) => {
    e.preventDefault();
    if (
      !usuario ||
      dragSource == null ||
      dropTarget == null ||
      dragSource.tipo !== tipo ||
      dropTarget.tipo !== tipo
    ) {
      setDragSource(null);
      setDropTarget(null);
      return;
    }
    const prev = servicios;
    const next = [...items];
    const [moved] = next.splice(dragSource.index, 1);
    let to = dropTarget.index + (dropTarget.after ? 1 : 0);
    if (to > dragSource.index) to -= 1;
    next.splice(to, 0, moved);
    // Reindex globalmente (rangos contiguos por grupo) para que el orden
    // de cada grupo (su min `orden`) se mantenga estable.
    let cursor = 0;
    const nextWithOrden = groups.flatMap(([t, g]) =>
      (t === tipo ? next : g).map((s) => ({ ...s, orden: cursor++ }))
    );
    const byId = new Map(nextWithOrden.map((s) => [s.id, s]));

    setDragSource(null);
    setDropTarget(null);
    setServicios((flat) => flat.map((s) => byId.get(s.id) ?? s));

    const prevOrden = new Map(prev.map((s) => [s.id, s.orden]));
    const updates = nextWithOrden.filter((s) => prevOrden.get(s.id) !== s.orden);
    try {
      await Promise.all(
        updates.map((s) =>
          apiFetch({ resource, method: "PATCH", id: s.id, data: { orden: s.orden } })
        )
      );
      apiFetch({ resource }).then((data) => setServicios(data as Servicio[]));
    } catch (error) {
      console.log(error);
      setServicios(prev);
      apiFetch({ resource }).then((data) => setServicios(data as Servicio[]));
    }
  };

  const handleDragEnd = () => {
    setDragSource(null);
    setDropTarget(null);
  };

  const handleGroupDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    tipo: string
  ) => {
    if (!usuario || dragGroup == null || dragGroup === tipo) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const rect = e.currentTarget.getBoundingClientRect();
    const after = e.clientY > rect.top + rect.height / 2;
    setGroupDropTarget((prev) =>
      prev?.tipo === tipo && prev.after === after ? prev : { tipo, after }
    );
  };

  const handleGroupDrop = async (
    e: React.DragEvent<HTMLDivElement>,
    tipo: string
  ) => {
    e.preventDefault();
    if (
      !usuario ||
      dragGroup == null ||
      groupDropTarget == null ||
      groupDropTarget.tipo !== tipo ||
      dragGroup === tipo
    ) {
      setDragGroup(null);
      setGroupDropTarget(null);
      return;
    }
    const prev = servicios;
    const nextGroups = [...groups];
    const from = nextGroups.findIndex(([t]) => t === dragGroup);
    const toIdx = nextGroups.findIndex(([t]) => t === tipo);
    if (from < 0 || toIdx < 0) {
      setDragGroup(null);
      setGroupDropTarget(null);
      return;
    }
    const [moved] = nextGroups.splice(from, 1);
    let to = toIdx + (groupDropTarget.after ? 1 : 0);
    if (to > from) to -= 1;
    nextGroups.splice(to, 0, moved);
    // Rangos contiguos: el grupo en posición i arranca donde terminó el anterior.
    let cursor = 0;
    const nextWithOrden = nextGroups.flatMap(([, g]) =>
      g.map((s) => ({ ...s, orden: cursor++ }))
    );
    const byId = new Map(nextWithOrden.map((s) => [s.id, s]));

    setDragGroup(null);
    setGroupDropTarget(null);
    setServicios((flat) => flat.map((s) => byId.get(s.id) ?? s));

    const prevOrden = new Map(prev.map((s) => [s.id, s.orden]));
    const updates = nextWithOrden.filter((s) => prevOrden.get(s.id) !== s.orden);
    try {
      await Promise.all(
        updates.map((s) =>
          apiFetch({ resource, method: "PATCH", id: s.id, data: { orden: s.orden } })
        )
      );
      apiFetch({ resource }).then((data) => setServicios(data as Servicio[]));
    } catch (error) {
      console.log(error);
      setServicios(prev);
      apiFetch({ resource }).then((data) => setServicios(data as Servicio[]));
    }
  };

  const handleGroupDragEnd = () => {
    setDragGroup(null);
    setGroupDropTarget(null);
  };

  return (
    <Section id="services" number="02" title="Servicios">
      {usuario && (
        <p className="mb-4 text-sm text-muted-foreground">
          Tildá los servicios que querés mostrar. Los destildados solo los ves
          vos. Arrastrá para reordenar dentro de cada grupo; arrastrá el título
          para mover el grupo.
        </p>
      )}
      <div className="grid gap-4">
        {groups.map(([tipo, items]) => {
          const Icon = ICONS[items[0]?.icono ?? ""] ?? Check;
          const single = usuario ? isSingleColumn(tipo) : true;
          const groupIndicator =
            groupDropTarget?.tipo === tipo &&
            dragGroup != null &&
            dragGroup !== tipo
              ? groupDropTarget.after
                ? "inset-x-1 -bottom-2 h-1"
                : "inset-x-1 -top-2 h-1"
              : null;
          return (
            <div
              key={tipo}
              onDragOver={(e) => handleGroupDragOver(e, tipo)}
              onDrop={(e) => handleGroupDrop(e, tipo)}
              className={`relative rounded-xl border border-border bg-card/50 backdrop-blur-sm p-5 transition hover:border-primary/40 ${
                dragGroup === tipo ? "opacity-50" : ""
              }`}
            >
              {groupIndicator && (
                <span
                  aria-hidden
                  className={`pointer-events-none absolute rounded bg-primary ${groupIndicator}`}
                />
              )}
              <h3
                draggable={!!usuario}
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", `group:${tipo}`);
                  e.dataTransfer.effectAllowed = "move";
                  setDragGroup(tipo);
                }}
                onDragEnd={handleGroupDragEnd}
                className={`mb-4 flex items-center gap-3 font-semibold text-card-foreground ${
                  usuario ? "cursor-grab" : ""
                }`}
              >
                {usuario && (
                  <GripVertical
                    aria-hidden
                    className="size-4 shrink-0 text-muted-foreground/50"
                  />
                )}
                <span className="rounded-lg bg-accent p-2 text-primary">
                  <Icon />
                </span>
                {tipo}
              </h3>
              <ul
                ref={(el) => {
                  listRefs.current[tipo] = el;
                }}
                className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2"
              >
                {items.map((item, index) => {
                  const isDragging =
                    dragSource?.tipo === tipo && dragSource.index === index;
                  const indicator =
                    dropTarget?.tipo === tipo &&
                    dropTarget.index === index &&
                    dragSource != null &&
                    !(dragSource.tipo === tipo && dragSource.index === index)
                      ? dropTarget.after
                        ? single
                          ? "inset-x-1 -bottom-1 h-0.5"
                          : "inset-y-1 -right-1 w-0.5"
                        : single
                          ? "inset-x-1 -top-1 h-0.5"
                          : "inset-y-1 -left-1 w-0.5"
                      : null;
                  return (
                    <li
                      key={item.id}
                      draggable={!!usuario}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", String(index));
                        e.dataTransfer.effectAllowed = "move";
                        setDragSource({ tipo, index });
                      }}
                      onDragOver={(e) => handleDragOver(e, tipo, index)}
                      onDrop={(e) => handleDrop(e, tipo, items)}
                      onDragEnd={handleDragEnd}
                      className={`relative flex items-start gap-2 ${
                        usuario ? "cursor-grab" : ""
                      } ${isDragging ? "cursor-grabbing opacity-50" : ""}`}
                    >
                      {indicator && (
                        <span
                          aria-hidden
                          className={`pointer-events-none absolute rounded bg-primary ${indicator}`}
                        />
                      )}
                      {usuario ? (
                        <label className="flex flex-1 cursor-pointer items-start gap-2">
                          <GripVertical
                            aria-hidden
                            className="mt-0.5 size-4 shrink-0 text-muted-foreground/50"
                          />
                          <input
                            type="checkbox"
                            checked={Boolean(item.estado)}
                            onChange={() => toggle(item)}
                            className="mt-0.5 size-4 shrink-0 accent-primary"
                          />
                          <span
                            className={
                              item.estado ? "" : "line-through opacity-60"
                            }
                          >
                            {item.nombre}
                          </span>
                        </label>
                      ) : (
                        <>
                          <Check size={16} className="mt-0.5 shrink-0 text-primary" />
                          {item.nombre}
                        </>
                      )}
                      <DeleteButton
                        tipoSchema={resource}
                        id={item.id}
                        tipoElemento=""
                        className="size-6 shrink-0"
                        onSuccess={(id) =>
                          setServicios((prev) =>
                            prev.filter((s) => s.id !== id)
                          )
                        }
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
      <div className="mt-8 flex justify-center">
        <ModalTriggerButton
          tipoFormulario={resource}
          title="Agregar servicio"
          transform={(data) => ({ ...data, estado: true })}
          onSuccess={() =>
            apiFetch({ resource }).then((data) => setServicios(data as Servicio[]))
          }
        >
          <Button type="button">Agregar servicio</Button>
        </ModalTriggerButton>
      </div>
    </Section>
  );
};

export default Services;
