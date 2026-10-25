"use client";

import Section from "../shared/section";
import Spinner from "../shared/spinner";
import {
  BadgeCheck,
  Calculator,
  GripVertical,
  Lock,
  RefreshCw,
} from "lucide-react";
import { ModalTriggerButton } from "./forms/ModalTriggerButton";
import { Button } from "../ui/button";
import { apiFetch } from "./fetch/tech-all";
import DeleteButton from "../shared/delete-button";
import { formsData, FormType } from "./forms/formsData";
import { useEffect, useRef, useState } from "react";
import { useUsuario } from "@/context/UserContext";
import { z } from "zod";

type Skill = z.infer<typeof formsData.skills.schema> & {
  orden?: number | null;
};
type ArraySkill = Skill[];

const byOrden = (a: Skill, b: Skill) =>
  (a.orden ?? Number.MAX_SAFE_INTEGER) -
    (b.orden ?? Number.MAX_SAFE_INTEGER) || (a.id ?? 0) - (b.id ?? 0);

type DragSource = { tipo: string; index: number };
type DropTarget = { tipo: string; index: number; after: boolean };
type GroupDropTarget = { tipo: string; after: boolean };

const minOrden = (items: ArraySkill) =>
  items.reduce(
    (m, s) => Math.min(m, s.orden ?? Number.MAX_SAFE_INTEGER),
    Number.MAX_SAFE_INTEGER
  );

const byGroup = (a: [string, ArraySkill], b: [string, ArraySkill]) =>
  minOrden(a[1]) - minOrden(b[1]);

const nivelFromValor = (valor: number): Skill["nivel"] =>
  valor >= 75 ? "Experimentado" : valor >= 45 ? "Intermedio" : "Básico";

const Skills = () => {
  const [dataSkills, setDataSkills] = useState<Record<string, ArraySkill>>();
  const [excluded, setExcluded] = useState<Set<number>>(new Set());
  const [syncing, setSyncing] = useState(false);
  const [dragSource, setDragSource] = useState<DragSource | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [dragGroup, setDragGroup] = useState<string | null>(null);
  const [groupDropTarget, setGroupDropTarget] = useState<GroupDropTarget | null>(
    null
  );
  const [dragSuspended, setDragSuspended] = useState(false);
  const resource = "skills";
  const { usuario } = useUsuario();
  const saveTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const handleValueChange = (item: Skill, valor: number) => {
    const nivel = nivelFromValor(valor);
    setDataSkills((prev) => ({
      ...prev,
      [item.tipo]: (prev?.[item.tipo] ?? []).map((s) =>
        s.id === item.id ? { ...s, valor, nivel } : s
      ),
    }));
    const id = item.id!;
    clearTimeout(saveTimers.current[id]);
    saveTimers.current[id] = setTimeout(() => {
      apiFetch({ resource, method: "PATCH", id, data: { valor, nivel } }).catch(
        (error) => console.error("No se pudo guardar la skill", error)
      );
    }, 500);
  };

  const fetchData = async () => {
    const response = (await apiFetch({ resource })) as Skill[];

    const map = new Map<string, Skill[]>();

    response.forEach((data) => {
      if (!map.has(data.tipo)) {
        map.set(data.tipo, []);
      }
      map.get(data.tipo)!.push({
        ...data,
        resource,
        id: data.id,
      });
    });

    setDataSkills(
      Object.fromEntries(
        Array.from(map.entries()).map(([key, value]) => [
          key,
          [...value].sort(byOrden),
        ])
      )
    );
  };

  const fetchExclusions = async () => {
    try {
      const res = await fetch("/api/skills/exclusions");
      if (res.ok) setExcluded(new Set((await res.json()) as number[]));
    } catch {
      // La columna Skills.excluida puede no existir todavía.
    }
  };

  useEffect(() => {
    fetchData();
    fetchExclusions();
  }, []);

  useEffect(() => {
    const resume = () => setDragSuspended(false);
    window.addEventListener("mouseup", resume);
    return () => window.removeEventListener("mouseup", resume);
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/skills/sync", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        updated?: number;
        added?: string[];
        excluded?: number;
        aborted?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      if (data.aborted === "rate_limit") {
        alert(
          "GitHub alcanzó el límite de peticiones. Probá más tarde o configurá GITHUB_TOKEN para más cuota."
        );
        return;
      }
      await fetchData();
      alert(
        `Habilidades actualizadas: ${data.updated ?? 0}` +
          (data.added?.length ? ` · nuevas: ${data.added.join(", ")}` : "") +
          (data.excluded ? ` · excluidas del cálculo: ${data.excluded}` : "")
      );
    } catch (error) {
      alert(`No se pudo recalcular: ${(error as Error).message}`);
    } finally {
      setSyncing(false);
    }
  };

  const toggleExcluida = async (item: Skill) => {
    const id = Number(item.id);
    const next = !excluded.has(id);
    try {
      const res = await fetch("/api/skills/exclusions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, excluida: next }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setExcluded((prev) => {
        const s = new Set(prev);
        if (next) s.add(id);
        else s.delete(id);
        return s;
      });
    } catch {
      alert(
        "No se pudo guardar la exclusión. ¿Aplicaste la migración de Skills.excluida en Supabase?"
      );
    }
  };

  const handleDelete = (id: number, tipoElemento: string) => {
    setDataSkills((prev) => {
      if (!prev) return prev;
      if (prev[tipoElemento]) {
        const updatedTipo = prev[tipoElemento]?.filter(
          (item) => item.id !== id
        );

        if (updatedTipo && updatedTipo.length > 0) {
          return { ...prev, [tipoElemento]: updatedTipo };
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [tipoElemento]: _, ...rest } = prev;
          return rest;
        }
      }

      return prev;
    });
  };

  const handleCreate = (data: Skill) => {
    setDataSkills((prev) => ({
      ...prev,
      [data.tipo]: [...(prev?.[data.tipo] || []), data],
    }));
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
    const after = e.clientY > rect.top + rect.height / 2;
    setDropTarget((prev) =>
      prev?.tipo === tipo && prev.index === index && prev.after === after
        ? prev
        : { tipo, index, after }
    );
  };

  const handleDrop = async (
    e: React.DragEvent<HTMLLIElement>,
    tipo: string,
    items: ArraySkill
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
    const prev = dataSkills;
    const next = [...items];
    const [moved] = next.splice(dragSource.index, 1);
    let to = dropTarget.index + (dropTarget.after ? 1 : 0);
    if (to > dragSource.index) to -= 1;
    next.splice(to, 0, moved);
    // Reindex globalmente (rangos contiguos por grupo) para que el orden
    // de cada grupo (su min `orden`) se mantenga estable.
    const entries = Object.entries(dataSkills ?? {}).sort(byGroup);
    let cursor = 0;
    const nextRecord = Object.fromEntries(
      entries.map(([t, g]) => [
        t,
        (t === tipo ? next : g).map((s) => ({ ...s, orden: cursor++ })),
      ])
    );

    setDragSource(null);
    setDropTarget(null);
    setDataSkills(nextRecord);

    const prevOrden = new Map(
      Object.values(prev ?? {}).flat().map((s) => [s.id!, s.orden])
    );
    const updates = Object.values(nextRecord)
      .flat()
      .filter((s) => prevOrden.get(s.id!) !== s.orden);
    try {
      await Promise.all(
        updates.map((s) =>
          apiFetch({ resource, method: "PATCH", id: s.id!, data: { orden: s.orden } })
        )
      );
      await fetchData();
    } catch (error) {
      console.log(error);
      setDataSkills(prev);
      await fetchData();
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
    const prev = dataSkills;
    const nextGroups = Object.entries(dataSkills ?? {}).sort(byGroup);
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
    const nextRecord = Object.fromEntries(
      nextGroups.map(([t, g]) => [t, g.map((s) => ({ ...s, orden: cursor++ }))])
    );

    setDragGroup(null);
    setGroupDropTarget(null);
    setDataSkills(nextRecord);

    const prevOrden = new Map(
      Object.values(prev ?? {}).flat().map((s) => [s.id!, s.orden])
    );
    const updates = Object.values(nextRecord)
      .flat()
      .filter((s) => prevOrden.get(s.id!) !== s.orden);
    try {
      await Promise.all(
        updates.map((s) =>
          apiFetch({ resource, method: "PATCH", id: s.id!, data: { orden: s.orden } })
        )
      );
      await fetchData();
    } catch (error) {
      console.log(error);
      setDataSkills(prev);
      await fetchData();
    }
  };

  const handleGroupDragEnd = () => {
    setDragGroup(null);
    setGroupDropTarget(null);
  };

  return (
    <Section id="skills" number="07" title="Habilidades">
      <div className="-mt-2 mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Los porcentajes reflejan el uso real de cada tecnología en los
          repositorios de mis proyectos, no mi nivel de conocimiento.
        </p>
        {usuario && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncing}
            >
              <RefreshCw className={syncing ? "animate-spin" : ""} />
              {syncing ? "Recalculando…" : "Actualizar desde repositorios"}
            </Button>
            <span className="text-xs text-muted-foreground">
              Tocá <Calculator className="inline size-3.5 align-text-bottom" />{" "}
              para excluir una skill del cálculo.
            </span>
          </div>
        )}
      </div>
      {dataSkills === undefined ? (
        <Spinner />
      ) : (
      <div className="grid gap-6">
        {Object.entries(dataSkills)
          .sort(byGroup)
          .map(([key, items]) => {
          const groupIndicator =
            groupDropTarget?.tipo === key &&
            dragGroup != null &&
            dragGroup !== key
              ? groupDropTarget.after
                ? "inset-x-1 -bottom-3 h-1"
                : "inset-x-1 -top-3 h-1"
              : null;
          return (
          <div
            key={key}
            onDragOver={(e) => handleGroupDragOver(e, key)}
            onDrop={(e) => handleGroupDrop(e, key)}
            className={`relative rounded-xl border border-border bg-card/50 backdrop-blur-sm p-5 ${
              dragGroup === key ? "opacity-50" : ""
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
                e.dataTransfer.setData("text/plain", `group:${key}`);
                e.dataTransfer.effectAllowed = "move";
                setDragGroup(key);
              }}
              onDragEnd={handleGroupDragEnd}
              className={`mb-4 flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-primary ${
                usuario ? "cursor-grab" : ""
              }`}
            >
              {usuario && (
                <GripVertical
                  aria-hidden
                  className="size-4 shrink-0 text-muted-foreground/50"
                />
              )}
              {key}
            </h3>
            <ul className="space-y-4">
              {items.map((item, index) => {
                const isDragging =
                  dragSource?.tipo === key && dragSource.index === index;
                const indicator =
                  dropTarget?.tipo === key &&
                  dropTarget.index === index &&
                  dragSource != null &&
                  !(dragSource.tipo === key && dragSource.index === index)
                    ? dropTarget.after
                      ? "inset-x-1 -bottom-2 h-1"
                      : "inset-x-1 -top-2 h-1"
                    : null;
                return (
                <li
                  key={item.id}
                  draggable={!!usuario && !dragSuspended}
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", String(index));
                    e.dataTransfer.effectAllowed = "move";
                    setDragSource({ tipo: key, index });
                  }}
                  onDragOver={(e) => handleDragOver(e, key, index)}
                  onDrop={(e) => handleDrop(e, key, items)}
                  onDragEnd={handleDragEnd}
                  className={`relative ${usuario ? "cursor-grab" : ""} ${
                    isDragging ? "cursor-grabbing opacity-50" : ""
                  }`}
                >
                  {indicator && (
                    <span
                      aria-hidden
                      className={`pointer-events-none absolute rounded bg-primary ${indicator}`}
                    />
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <p className="flex min-w-0 items-center gap-2 text-sm font-medium text-card-foreground">
                      {usuario && (
                        <GripVertical
                          aria-hidden
                          className="size-4 shrink-0 text-muted-foreground/50"
                        />
                      )}
                      <BadgeCheck className="size-4 shrink-0 text-primary" />
                      <span className="truncate">{item.nombre}</span>
                    </p>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">
                        {excluded.has(Number(item.id)) ? "Manual" : item.nivel}
                      </span>
                      {usuario && (
                        <button
                          type="button"
                          onClick={() => toggleExcluida(item)}
                          title={
                            excluded.has(Number(item.id))
                              ? "Incluir en el cálculo automático"
                              : "Excluir del cálculo automático (queda manual)"
                          }
                          aria-pressed={excluded.has(Number(item.id))}
                          className={
                            excluded.has(Number(item.id))
                              ? "grid size-7 place-items-center rounded-md border border-primary bg-primary/10 text-primary transition"
                              : "grid size-7 place-items-center rounded-md border border-border text-muted-foreground transition hover:border-primary/60 hover:text-primary"
                          }
                        >
                          {excluded.has(Number(item.id)) ? (
                            <Lock className="size-4" />
                          ) : (
                            <Calculator className="size-4" />
                          )}
                        </button>
                      )}
                      <DeleteButton
                        tipoSchema={resource as FormType}
                        tipoElemento={item.tipo}
                        id={item.id!}
                        onSuccess={handleDelete}
                        className="size-7"
                      />
                    </div>
                  </div>
                  {usuario && excluded.has(Number(item.id)) ? (
                    <div
                      className="mt-2 flex items-center gap-3"
                      onMouseDown={() => setDragSuspended(true)}
                      onMouseUp={() => setDragSuspended(false)}
                    >
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={item.valor}
                        aria-label={`Nivel de ${item.nombre}`}
                        onChange={(e) =>
                          handleValueChange(item, Number(e.target.value))
                        }
                        className="h-1.5 w-full cursor-pointer accent-primary"
                      />
                      <span className="w-9 text-right font-mono text-xs text-muted-foreground">
                        {item.valor}%
                      </span>
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center gap-3">
                      <div
                        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                        role="progressbar"
                        aria-label={item.nombre}
                        aria-valuenow={item.valor}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
                          style={{ width: `${item.valor}%` }}
                        />
                      </div>
                      {usuario && (
                        <span
                          className="w-9 text-right font-mono text-xs text-muted-foreground"
                          title="Valor calculado automáticamente desde los repositorios"
                        >
                          {item.valor}%
                        </span>
                      )}
                    </div>
                  )}
                </li>
                );
              })}
            </ul>
          </div>
          );
          })}
      </div>
      )}

      <div className="mt-8 flex justify-center">
        <ModalTriggerButton
          onSuccess={(result) => {
            handleCreate(result as Skill);
          }}
          tipoFormulario="skills"
        >
          <Button type="button">Agregar una Skill</Button>
        </ModalTriggerButton>
      </div>
    </Section>
  );
};

export default Skills;
