"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { z } from "zod";
import { MapPin, Phone } from "lucide-react";
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

  return (
    <Section id="experience" number="02" title="Experiencia">
      <ol className="group/list space-y-4">
        {dataExperience?.map((data) => (
          <li key={data.id}>
            <article className="relative grid gap-2 rounded-xl border border-transparent p-4 transition hover:border-border hover:bg-card/60 hover:shadow-lg sm:grid-cols-8 sm:gap-6 lg:group-hover/list:opacity-60 lg:hover:!opacity-100">
              <p className="pt-1 font-mono text-xs uppercase tracking-wide text-muted-foreground sm:col-span-2">
                {data.fecha_inicio} — {data.fecha_fin || "Actualidad"}
              </p>
              <div className="sm:col-span-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold leading-snug text-card-foreground">
                    {data.cargo}{" "}
                    <span className="text-primary">· {data.empresa}</span>
                  </h3>
                  <DeleteButton
                    tipoSchema={resource as FormType}
                    id={Number(data.id)}
                    onSuccess={handleDelete}
                    className="size-8 shrink-0"
                    tipoElemento={""}
                  />
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
        ))}
      </ol>

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
