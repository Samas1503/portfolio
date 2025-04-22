"use client";

import { Button } from "../ui/button";
import { ModalTriggerButton } from "./forms/ModalTriggerButton";
import Title from "../shared/title";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { z } from "zod";
import Link from "next/link";
import GoogleMaps from "./google-maps";
import { apiFetch } from "./fetch/tech-all";
import DeleteButton from "../shared/delete-button";
import { FormType } from "./forms/formsData";
import { useEffect, useState } from "react";
import { formsData } from "@/components/pages/forms/formsData";

type Experiencia = typeof formsData.experience.schema;
type ArrayExperiencia = Array<z.infer<Experiencia>>;

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
    setDataExperiencie((prev) => {
      if (!prev) return [];
      const newData = prev
        .map((item) => (Number(item.id) !== id ? item : null))
        .filter(Boolean) as ArrayExperiencia;
      return newData;
    });
  };

  const handleCreate = (data: Experiencia) => {
    setDataExperiencie((prev) =>
      prev && prev.length > 0
        ? [...prev, data as unknown as z.infer<Experiencia>]
        : [data as unknown as z.infer<Experiencia>]
    );
  };

  return (
    <div className="p-6 md:px-12 md:py-44 max-w-5xl mx-auto" id="project">
      <Title title="Trabajos" subtitle="Experiencia Laboral" />
      <div className="grid justify-center md:grid-cols-2 gap-8 mt-5">
        {dataExperience?.map((data) => (
          <Card key={data.id} className="w-auto max-w-[400px]">
            <CardHeader>
              <CardTitle className="flex justify-around">
                <DeleteButton
                  tipoSchema={resource as FormType}
                  id={Number(data.id)}
                  onSuccess={handleDelete}
                  className="me-4"
                  tipoElemento={""}
                />
                <strong className="">{data.empresa}</strong>
                <small>
                  {data.fecha_inicio} - {data.fecha_fin}
                </small>
              </CardTitle>
              <CardDescription>
                <strong>{data.cargo}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {typeof data.latitud === "number" &&
                typeof data.longitud === "number" &&
                !isNaN(data.latitud) &&
                !isNaN(data.longitud) && (
                  <GoogleMaps
                    value={{ lat: data.latitud, lng: data.longitud }}
                  />
                )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <p>
                <strong>Referencia: </strong>
                {data.nombreReferencia}
              </p>
              <Button type="button">
                <Link href={"tel:" + data.nroReferencia} target="_blank">
                  Contactar
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="flex justify-center items-center max-w-4xl mx-auto mt-10">
        <ModalTriggerButton onSuccess={(result: unknown) => handleCreate(result as Experiencia)} tipoFormulario="experience">
          <Button type="button">Agregar Experiencia Laboral</Button>
        </ModalTriggerButton>
      </div>
    </div>
  );
};

export default Experience;
