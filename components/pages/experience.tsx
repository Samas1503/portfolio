"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { CalendarRange, MapPin, Pencil, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ModalTriggerButton } from "./forms/ModalTriggerButton";
import { apiFetch } from "./fetch/tech-all";
import DeleteButton from "../shared/delete-button";
import Section from "../shared/section";
import Spinner from "../shared/spinner";
import { formsData, FormType } from "./forms/formsData";

const GoogleMaps = dynamic(() => import("./google-maps"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[300px] place-items-center text-sm text-muted-foreground">
      Cargando mapa…
    </div>
  ),
});

type Experiencia = typeof formsData.experience.schema;
type ArrayExperiencia = Array<z.infer<Experiencia>>;

const isValidCoord = (value: unknown): value is number =>
  typeof value === "number" && !isNaN(value);

const MONTHS_LONG = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const formatFecha = (fecha?: string | null) => {
  if (!fecha) return "";
  const [y, m] = fecha.split("-").map(Number);
  return y && m >= 1 && m <= 12 ? `${MONTHS_LONG[m - 1]} ${y}` : fecha;
};

const duracion = (inicio?: string | null, fin?: string | null) => {
  const [y1, m1] = (inicio || "").split("-").map(Number);
  const end = fin || new Date().toISOString().slice(0, 10);
  const [y2, m2] = end.split("-").map(Number);
  if (!y1 || !m1 || !y2 || !m2) return "";
  const total = (y2 - y1) * 12 + (m2 - m1);
  if (total < 1) return "menos de 1 mes";
  const anios = Math.floor(total / 12);
  const meses = total % 12;
  const partes = [
    anios ? `${anios} ${anios === 1 ? "año" : "años"}` : "",
    meses ? `${meses} ${meses === 1 ? "mes" : "meses"}` : "",
  ].filter(Boolean);
  return partes.join(" ");
};

const timeOf = (fecha?: string | null) => {
  const t = fecha ? Date.parse(fecha) : NaN;
  return Number.isNaN(t) ? 0 : t;
};

const byMostRecent = (
  a: z.infer<Experiencia>,
  b: z.infer<Experiencia>
) =>
  (b.fecha_fin ? timeOf(b.fecha_fin) : Number.MAX_SAFE_INTEGER) -
    (a.fecha_fin ? timeOf(a.fecha_fin) : Number.MAX_SAFE_INTEGER) ||
  timeOf(b.fecha_inicio) - timeOf(a.fecha_inicio) ||
  Number(b.id) - Number(a.id);

const MapDialog = ({
  lat,
  lng,
  empresa,
  cargo,
}: {
  lat: number;
  lng: number;
  empresa: string;
  cargo: string;
}) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button type="button" variant="outline" size="sm">
        <MapPin /> Ver ubicación
      </Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>{empresa}</DialogTitle>
        <DialogDescription>{cargo}</DialogDescription>
      </DialogHeader>
      <div className="overflow-hidden rounded-lg">
        <GoogleMaps value={{ lat, lng }} />
      </div>
    </DialogContent>
  </Dialog>
);

const Experience = () => {
  const [dataExperience, setDataExperiencie] = useState<ArrayExperiencia>();
  const resource = "experience";
  useEffect(() => {
    const fetchData = async () => {
      const data = await apiFetch({ resource });
      setDataExperiencie(data as ArrayExperiencia);
    };
    fetchData();
  }, []);

  const handleDelete = (id: number) => {
    setDataExperiencie((prev) =>
      prev ? prev.filter((item) => Number(item.id) !== id) : []
    );
  };

  const handleCreate = (data: Experiencia) => {
    setDataExperiencie((prev) => [
      ...(prev ?? []),
      data as unknown as z.infer<Experiencia>,
    ]);
  };

  const handleUpdate = (data: Experiencia) => {
    const updated = data as unknown as z.infer<Experiencia>;
    setDataExperiencie((prev) =>
      prev?.map((item) =>
        Number(item.id) === Number(updated.id) ? { ...item, ...updated } : item
      )
    );
  };

  const sorted = useMemo(
    () => [...(dataExperience ?? [])].sort(byMostRecent),
    [dataExperience]
  );

  return (
    <Section id="experience" number="03" title="Experiencia">
      {dataExperience === undefined ? (
        <Spinner />
      ) : (
      <ol className="group/list relative ml-2 space-y-4 border-l border-border/70 sm:ml-4">
        {sorted.map((data, idx) => {
          const isCurrent = !data.fecha_fin;
          return (
            <li key={data.id} className="relative pl-6 sm:pl-8">
              <span
                aria-hidden
                className="absolute -left-[7px] top-6 flex size-3 items-center justify-center"
              >
                {isCurrent && (
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60 motion-reduce:hidden" />
                )}
                <span
                  style={{
                    animationDelay: `${(sorted.length - 1 - idx) * 0.5}s`,
                  }}
                  className={cn(
                    "timeline-breathe relative inline-flex size-3 rounded-full ring-4 ring-background",
                    isCurrent ? "bg-primary" : "bg-muted-foreground/40"
                  )}
                />
              </span>
              <article className="relative grid gap-3 rounded-xl border border-transparent p-4 transition hover:border-border hover:bg-card/60 hover:backdrop-blur-sm hover:shadow-lg sm:grid-cols-8 sm:gap-6 lg:group-hover/list:opacity-60 lg:hover:!opacity-100">
                <div className="sm:col-span-3">
                  <p
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider",
                      isCurrent
                        ? "border-primary bg-primary text-primary-foreground shadow"
                        : "border-primary/40 bg-primary/10 text-primary"
                    )}
                  >
                    <CalendarRange className="size-3.5 shrink-0" aria-hidden />
                    {formatFecha(data.fecha_inicio)} —{" "}
                    {data.fecha_fin ? formatFecha(data.fecha_fin) : "Actualidad"}{" "}
                    · {duracion(data.fecha_inicio, data.fecha_fin)}
                  </p>
                </div>
                <div className="sm:col-span-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold leading-snug text-card-foreground">
                      {data.cargo}{" "}
                      <span className="text-primary">· {data.empresa}</span>
                    </h3>
                    <div className="flex shrink-0 gap-2">
                      <ModalTriggerButton
                        tipoFormulario="experience"
                        id={Number(data.id)}
                        defaultValues={data}
                        title={`Editar: ${data.empresa}`}
                        onSuccess={(result: unknown) =>
                          handleUpdate(result as Experiencia)
                        }
                      >
                        <Button
                          type="button"
                          variant="outline"
                          className="size-8"
                          aria-label={`Editar ${data.empresa}`}
                        >
                          <Pencil />
                        </Button>
                      </ModalTriggerButton>
                      <DeleteButton
                        tipoSchema={resource as FormType}
                        id={Number(data.id)}
                        onSuccess={handleDelete}
                        className="size-8 shrink-0"
                        tipoElemento={""}
                      />
                    </div>
                  </div>
                  {data.nombreReferencia && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Referencia:{" "}
                      <span className="text-card-foreground">
                        {data.nombreReferencia}
                      </span>
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {data.nroReferencia && (
                      <Link
                        href={"tel:" + data.nroReferencia}
                        className={buttonVariants({ variant: "secondary", size: "sm" })}
                      >
                        <Phone /> Contactar referencia
                      </Link>
                    )}
                    {isValidCoord(data.latitud) && isValidCoord(data.longitud) && (
                      <MapDialog
                        lat={data.latitud}
                        lng={data.longitud}
                        empresa={data.empresa}
                        cargo={data.cargo}
                      />
                    )}
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
      )}

      <div className="mt-8 flex justify-center">
        <ModalTriggerButton
          onSuccess={(result: unknown) => handleCreate(result as Experiencia)}
          tipoFormulario="experience"
        >
          <Button type="button">Agregar Experiencia Laboral</Button>
        </ModalTriggerButton>
      </div>
    </Section>
  );
};

export default Experience;
