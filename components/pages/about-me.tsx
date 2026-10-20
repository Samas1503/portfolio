"use client";

import { useEffect, useState } from "react";
import { Briefcase, Pencil, Phone, UsersRound, Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button, buttonVariants } from "../ui/button";
import Section from "../shared/section";
import { apiFetch } from "./fetch/tech-all";
import { ModalTriggerButton } from "./forms/ModalTriggerButton";
import { useUsuario } from "@/context/UserContext";

type SobreMi = {
  id: number;
  descripcion: string | null;
  experiencia: string | null;
  clientes: string | null;
  proyectos: string | null;
  telefono: string | null;
};

const resource = "sobremi";

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

const AboutMe = () => {
  const [data, setData] = useState<SobreMi | null>(null);
  const { usuario } = useUsuario();

  useEffect(() => {
    apiFetch({ resource }).then((rows) => setData((rows as SobreMi[])[0] ?? null));
  }, []);

  const paragraphs = (data?.descripcion ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <Section id="about" number="01" title="Sobre mí">
      {usuario && data && (
        <div className="-mt-4 mb-4 flex justify-end">
          <ModalTriggerButton
            tipoFormulario="sobremi"
            id={data.id}
            defaultValues={data}
            title="Editar: Sobre mí"
            onSuccess={(result) => setData({ ...data, ...(result as Partial<SobreMi>) })}
          >
            <Button type="button" variant="outline" size="sm">
              <Pencil /> Editar
            </Button>
          </ModalTriggerButton>
        </div>
      )}

      <div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-start">
        <div className="space-y-4 leading-relaxed text-muted-foreground">
          {paragraphs.map((p, i) => (
            <p key={i}>{renderParagraph(p)}</p>
          ))}
        </div>
        <div className="group relative mx-auto w-48 sm:w-44">
          <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-xl border-2 border-primary transition group-hover:translate-x-2 group-hover:translate-y-2" />
          <Image
            src="/profile.jpg"
            alt="Foto de Samuel Elias Paredes"
            width={300}
            height={300}
            className="relative aspect-square rounded-xl object-cover grayscale-[30%] transition group-hover:grayscale-0"
          />
        </div>
      </div>

      {data && (
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {METRICS.filter((m) => data[m.key]).map((m) => (
            <div
              key={m.key}
              className="rounded-xl border border-border bg-card/50 p-4 transition hover:border-primary/40"
            >
              <span className="text-primary">{m.icon}</span>
              <p className="mt-3 text-sm font-semibold text-card-foreground">{m.name}</p>
              <p className="text-sm text-muted-foreground">{data[m.key]}</p>
            </div>
          ))}
        </div>
      )}

      {data?.telefono && (
        <Link
          href={`tel:${data.telefono}`}
          className={buttonVariants({ variant: "outline", className: "mt-8" })}
        >
          <Phone /> Hablemos
        </Link>
      )}
    </Section>
  );
};

export default AboutMe;
