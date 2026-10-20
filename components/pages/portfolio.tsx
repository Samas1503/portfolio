"use client";

import Image from "next/image";
import { CldImage } from "next-cloudinary";
import { useEffect, useState } from "react";
import { z } from "zod";
import { ExternalLink, Github } from "lucide-react";
import { Button } from "../ui/button";
import { ModalTriggerButton } from "./forms/ModalTriggerButton";
import { apiFetch } from "./fetch/tech-all";
import { formsData, FormType } from "./forms/formsData";
import DeleteButton from "../shared/delete-button";
import Section from "../shared/section";

type Portfolio = typeof formsData.project.schema;
type ArrayPortfolio = Array<z.infer<Portfolio>>;

const INITIAL_VISIBLE = 6;

const ProjectImage = ({ src, alt }: { src?: string | null; alt: string }) => {
  const className =
    "aspect-video w-full rounded-lg border border-border object-cover transition duration-500 group-hover:scale-[1.03]";
  if (!src) return <div className={`${className} bg-muted`} />;
  return src.split("/")[1] === "uploads" ? (
    <Image src={src} alt={alt} width={600} height={338} className={className} />
  ) : (
    <CldImage src={src} width={600} height={338} crop="fill" alt={alt} className={className} />
  );
};

const Portfolio = () => {
  const [dataPortfolio, setDataPortfolio] = useState<ArrayPortfolio>();
  const [showAll, setShowAll] = useState(false);
  const resource = "project";
  useEffect(() => {
    const fetchData = async () => {
      const data = await apiFetch({ resource });
      setDataPortfolio(data as ArrayPortfolio);
    };
    fetchData();
  }, []);

  const handleDelete = (id: number) => {
    setDataPortfolio((prev) =>
      prev ? prev.filter((item) => Number(item.id) !== id) : []
    );
  };

  const handleCreate = (data: Portfolio) => {
    setDataPortfolio((prev) => [
      ...(prev ?? []),
      data as unknown as z.infer<Portfolio>,
    ]);
  };

  const total = dataPortfolio?.length ?? 0;
  const visible = showAll ? dataPortfolio : dataPortfolio?.slice(0, INITIAL_VISIBLE);

  return (
    <Section id="projects" number="05" title="Proyectos">
      <ul className="grid gap-6 sm:grid-cols-2">
        {visible?.map((data) => (
          <li
            key={data.id}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card/50 p-3 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl motion-reduce:transition-none"
          >
            <div className="overflow-hidden rounded-lg">
              <ProjectImage src={data.image} alt={String(data.titulo)} />
            </div>
            <div className="flex flex-1 items-start justify-between gap-2 px-1 pt-4">
              <h3 className="font-semibold leading-snug text-card-foreground group-hover:text-primary">
                {String(data.titulo)}
              </h3>
              <DeleteButton
                tipoSchema={resource as FormType}
                id={Number(data.id)}
                onSuccess={handleDelete}
                className="size-7 shrink-0"
                tipoElemento={""}
              />
            </div>
            <div className="mt-3 flex gap-2 px-1 pb-1">
              {data.urlGithub && (
                <a
                  href={data.urlGithub}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground transition hover:bg-primary hover:text-primary-foreground"
                >
                  <Github className="size-3.5" /> GitHub
                </a>
              )}
              {data.urlDemo && (
                <a
                  href={data.urlDemo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground transition hover:bg-primary hover:text-primary-foreground"
                >
                  <ExternalLink className="size-3.5" /> Live demo
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {total > INITIAL_VISIBLE && (
          <Button type="button" variant="outline" onClick={() => setShowAll((v) => !v)}>
            {showAll ? "Ver menos" : `Ver los ${total} proyectos`}
          </Button>
        )}
        <ModalTriggerButton
          onSuccess={(result: unknown) => handleCreate(result as Portfolio)}
          tipoFormulario="project"
        >
          <Button type="button">Agregar Proyecto</Button>
        </ModalTriggerButton>
      </div>
    </Section>
  );
};

export default Portfolio;
