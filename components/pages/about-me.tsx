"use client";

import { useState } from "react";
import {
  Briefcase,
  Pencil,
  Phone,
  Plus,
  UsersRound,
  Wrench,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button, buttonVariants } from "../ui/button";
import Section from "../shared/section";
import { ModalTriggerButton } from "./forms/ModalTriggerButton";
import {
  formsData,
  PERFIL_HEADER_FIELDS,
  toFormValues,
} from "./forms/formsData";
import type { Perfil } from "@/backend/data/perfil";
import { useUsuario } from "@/context/UserContext";
import { apiFetch } from "./fetch/tech-all";

const METRICS = [
  { key: "experiencia", name: "Experiencia", icon: <Briefcase /> },
  { key: "clientes", name: "Clientes", icon: <UsersRound /> },
  { key: "proyectos", name: "Proyectos", icon: <Wrench /> },
] as const;

// `**texto**` se muestra resaltado.
const renderParagraph = (text: string) =>
  text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 ? (
      <span key={i} className="text-card-foreground">
        {part}
      </span>
    ) : (
      part
    )
  );

const parseChips = (value: string | null | undefined) =>
  (value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

type ChipField = "habilidadesBlandas" | "intereses";

const AboutMe = ({ perfil }: { perfil: Perfil | null }) => {
  const [data, setData] = useState(perfil);
  const { usuario } = useUsuario();
  const [dragChip, setDragChip] = useState<{
    field: ChipField;
    index: number;
  } | null>(null);

  const softSkills = parseChips(data?.habilidadesBlandas);
  const intereses = parseChips(data?.intereses);

  const saveChips = async (
    field: "habilidadesBlandas" | "intereses",
    items: string[]
  ) => {
    if (!data) return;
    const value = items.join(", ");
    setData({ ...data, [field]: value });
    await apiFetch({
      resource: "perfil",
      id: data.id,
      method: "PATCH",
      data: { [field]: value },
    });
  };

  const chipGroups = [
    {
      title: "Habilidades blandas",
      field: "habilidadesBlandas" as const,
      items: softSkills,
      chipClass:
        "border-primary/40 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground",
    },
    {
      title: "Intereses personales",
      field: "intereses" as const,
      items: intereses,
      chipClass:
        "border-border bg-card/50 text-muted-foreground hover:border-primary/40 hover:text-primary",
    },
  ];

  const paragraphs = (data?.descripcion ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <Section id="about" number="01" title="Sobre mí">
      {usuario && data && (
        <div className="-mt-4 mb-4 flex justify-end">
          <ModalTriggerButton
            tipoFormulario="perfil"
            id={data.id}
            defaultValues={toFormValues(data)}
            omitFields={PERFIL_HEADER_FIELDS}
            title="Editar: Sobre mí"
            onSuccess={(result) => setData({ ...data, ...(result as Partial<Perfil>) })}
          >
            <Button type="button" variant="outline" size="sm">
              <Pencil /> Editar
            </Button>
          </ModalTriggerButton>
        </div>
      )}

      <div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-start">
        <div className="space-y-4 text-justify leading-relaxed text-muted-foreground hyphens-auto">
          {paragraphs.map((p, i) => (
            <p key={i}>{renderParagraph(p)}</p>
          ))}
        </div>
        <div className="mx-auto flex w-48 flex-col items-center gap-5 sm:w-44">
          <div className="group relative w-full">
            <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-xl border-2 border-primary transition group-hover:translate-x-2 group-hover:translate-y-2" />
            <Image
              src="/profile.jpg"
              alt="Foto de Samuel Elias Paredes"
              width={300}
              height={300}
              className="relative aspect-square rounded-xl object-cover grayscale-[30%] transition group-hover:grayscale-0"
            />
          </div>
          {data?.telefono && (
            <Link
              href={`tel:${data.telefono}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Phone /> Hablemos
            </Link>
          )}
        </div>
      </div>

      {data && (
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {METRICS.filter((m) => data[m.key]).map((m) => (
            <div
              key={m.key}
              className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4 transition hover:border-primary/40"
            >
              <span className="text-primary">{m.icon}</span>
              <p className="mt-3 text-sm font-semibold text-card-foreground">{m.name}</p>
              <p className="text-sm text-muted-foreground">{data[m.key]}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        {chipGroups.map((g) => (
          <div key={g.field}>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-card-foreground">
                {g.title}
              </h3>
              {usuario && data && (
                <ModalTriggerButton
                  tipoFormulario="perfil"
                  id={data.id}
                  defaultValues={{ ...toFormValues(data), [g.field]: "" }}
                  omitFields={formsData.perfil.fields
                    .map((f) => f.name)
                    .filter((n) => n !== g.field)}
                  title={`Agregar: ${g.title}`}
                  transform={(d) => ({
                    ...d,
                    [g.field]: [data[g.field], (d as Perfil)[g.field]]
                      .filter(Boolean)
                      .join(", "),
                  })}
                  onSuccess={(result) =>
                    setData({ ...data, ...(result as Partial<Perfil>) })
                  }
                >
                  <button
                    type="button"
                    aria-label={`Agregar a ${g.title}`}
                    title={`Agregar a ${g.title}`}
                    className="flex size-5 items-center justify-center rounded-full border border-primary/40 text-primary transition hover:bg-primary hover:text-primary-foreground"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </ModalTriggerButton>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {g.items.map((s, i) => (
                <span
                  key={`${s}-${i}`}
                  draggable={!!usuario}
                  onDragStart={() => setDragChip({ field: g.field, index: i })}
                  onDragEnd={() => setDragChip(null)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    if (!dragChip || dragChip.field !== g.field) return;
                    e.preventDefault();
                    const rect = e.currentTarget.getBoundingClientRect();
                    const after = e.clientX > rect.left + rect.width / 2;
                    const items = [...g.items];
                    const [moved] = items.splice(dragChip.index, 1);
                    let to = i + (after ? 1 : 0);
                    if (to > dragChip.index) to -= 1;
                    items.splice(to, 0, moved);
                    saveChips(g.field, items);
                    setDragChip(null);
                  }}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition ${g.chipClass} ${
                    usuario ? "cursor-grab" : ""
                  } ${
                    dragChip?.field === g.field && dragChip.index === i
                      ? "opacity-50"
                      : ""
                  }`}
                >
                  {s}
                  {usuario && (
                    <button
                      type="button"
                      aria-label={`Eliminar ${s}`}
                      className="-mr-1 flex size-4 items-center justify-center rounded-full opacity-60 transition hover:bg-primary/20 hover:opacity-100"
                      onClick={() =>
                        saveChips(
                          g.field,
                          g.items.filter((_, j) => j !== i)
                        )
                      }
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default AboutMe;
