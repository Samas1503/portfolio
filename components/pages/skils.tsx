"use client";

import Section from "../shared/section";
import {
  BadgeCheck,
  Calculator,
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

type Skill = z.infer<typeof formsData.skills.schema>;
type ArraySkill = Skill[];

const nivelFromValor = (valor: number): Skill["nivel"] =>
  valor >= 75 ? "Experimentado" : valor >= 45 ? "Intermedio" : "Básico";

const Skills = () => {
  const [dataSkills, setDataSkills] = useState<Record<string, ArraySkill>>({});
  const [excluded, setExcluded] = useState<Set<number>>(new Set());
  const [syncing, setSyncing] = useState(false);
  const resource = "skills";
  const { usuario } = useUsuario();
  const saveTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const handleValueChange = (item: Skill, valor: number) => {
    const nivel = nivelFromValor(valor);
    setDataSkills((prev) => ({
      ...prev,
      [item.tipo]: prev[item.tipo].map((s) =>
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
        Array.from(map.entries()).map(([key, value]) => [key, value])
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
      [data.tipo]: [...(prev[data.tipo] || []), data],
    }));
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
      <div className="grid gap-6">
        {Object.entries(dataSkills).map(([key, items]) => (
          <div
            key={key}
            className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-5"
          >
            <h3 className="mb-4 font-mono text-sm uppercase tracking-widest text-primary">
              {key}
            </h3>
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="flex min-w-0 items-center gap-2 text-sm font-medium text-card-foreground">
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
                    <div className="mt-2 flex items-center gap-3">
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
              ))}
            </ul>
          </div>
        ))}
      </div>

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
