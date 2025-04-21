"use client";

import Title from "../shared/title";
import Image from "next/image";
import Link from "next/link";
import { Button, buttonVariants } from "../ui/button";
import { ModalTriggerButton } from "./forms/ModalTriggerButton";
import { apiFetch } from "./fetch/tech-all";
import { formsData, FormType } from "./forms/formsData";
import { useEffect, useState } from "react";
import DeleteButton from "../shared/delete-button";
import { z } from "zod";

type Portfolio = typeof formsData.proyectos.schema;
type ArrayPortfolio = Array<z.infer<Portfolio>>;

const Portfolio = () => {
  const [dataPortfolio, setDataPortfolio] = useState<ArrayPortfolio>();
  const resource = "proyectos";
  useEffect(() => {
    const fetchData = async () => {
      const data = await apiFetch({ resource });
      console.log(data);
      setDataPortfolio(data as ArrayPortfolio);
    };
    fetchData();
  }, []);

  const handleDelete = (id: number) => {
    setDataPortfolio((prev) => {
      if (!prev) return [];
      const newData = prev
        .map((item) => (Number(item.id) !== id ? item : null))
        .filter(Boolean) as ArrayPortfolio;
      return newData;
    });
  };

  const handleCreate = (data: Portfolio) => {
    setDataPortfolio((prev) =>
      prev && prev.length > 0
        ? [...prev, data as unknown as z.infer<Portfolio>]
        : [data as unknown as z.infer<Portfolio>]
    );
  };

  return (
    <div className="p-4 max-w-7xl md:py-24 mx-auto" id="portfolio">
      <Title title="Portfolio" subtitle="Trabajos recientes" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-14 mt-4">
        {dataPortfolio?.map((data) => (
          <div key={data.id}>
            <div className="flex justify-between">
              {"titulo" in data && (
                <h3 className="text-xl mb-4">{String(data.titulo)}</h3>
              )}
              <DeleteButton
                tipoSchema={resource as FormType}
                id={Number(data.id)}
                onSuccess={handleDelete}
                className="relative top-0 left-0"
                tipoElemento={""}
              />
            </div>
            <Image
              src={
                "image" in data && data.image
                  ? data.image
                  : "/placeholder-image.png"
              }
              alt="Image"
              width={300}
              height={300}
              className="rounded-2xl w-full"
            />
            <div className="mt-5 flex gap-10">
              <Link
                className={buttonVariants({ variant: "outline" })}
                href={
                  "urlGithub" in data && data.urlGithub ? data.urlGithub : "#!"
                }
                target="_blank"
              >
                GitHub
              </Link>
              <Link
                className={buttonVariants()}
                href={"urlDemo" in data && data.urlDemo ? data.urlDemo : "#!"}
                target="_blank"
              >
                Live demo
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center items-center max-w-4xl mx-auto mt-10">
      <ModalTriggerButton onSuccess={(result: unknown) => handleCreate(result as Portfolio)} tipoFormulario="proyectos">
          <Button type="button">Agregar Proyecto</Button>
        </ModalTriggerButton>
      </div>
    </div>
  );
};

export default Portfolio;
