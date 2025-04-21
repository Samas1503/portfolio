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

type Experiencia = z.infer<typeof formsData.work.schema>;

const Works = () => {
  const [dataExperience, setDataExperiencie] = useState<
    Record<string, Experiencia[]>
  >({});

  const resource = "work";
  useEffect(() => {
    const fetchData = async () => {
      const data = await apiFetch({ resource });
      setDataExperiencie(data as Record<string, Experiencia[]>);
    };
    fetchData();
  }, []);

  const handleDelete = (id: number) => {
    setDataExperiencie((prev) => {
      const newData = Object.fromEntries(
        Object.entries(prev).map(([key, value]) => [
          key,
          Array(value).filter((item) => Number(item.id) !== id),
        ])
      );

      for (const key in newData) {
        if (newData[key].length === 0) {
          delete newData[key];
        }
      }

      return newData;
    });
  };

  const handleCreate = (data: Experiencia) => {
    setDataExperiencie((prev) => (prev.length > 0 ? [...prev, data] : [data]));
  };

  return (
    <div className="p-6 md:px-12 md:py-44 max-w-5xl mx-auto" id="work">
      <Title title="Trabajos" subtitle="Experiencia Laboral" />
      <div className="grid justify-center md:grid-cols-2 gap-8 mt-5">
        {Object.values(dataExperience)
          ?.flat()
          ?.map((data: Experiencia) => (
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
        <ModalTriggerButton onSuccess={handleCreate} tipoFormulario="work">
          <Button type="button">Agregar Experiencia Laboral</Button>
        </ModalTriggerButton>
      </div>
    </div>
  );
};

export default Works;
