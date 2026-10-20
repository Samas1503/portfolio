"use client";

import Image from "next/image";
import { CldImage } from "next-cloudinary";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { BriefcaseBusiness, ExternalLink, Github, Lock, Pencil } from "lucide-react";
import { parseTags } from "@/utils/tags";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { ModalTriggerButton } from "./forms/ModalTriggerButton";
import { apiFetch } from "./fetch/tech-all";
import { formsData, FormType } from "./forms/formsData";
import DeleteButton from "../shared/delete-button";
import Section from "../shared/section";

type Portfolio = typeof formsData.project.schema;
type Project = Omit<z.infer<Portfolio>, "tags"> & {
  tags?: string[] | string | null;
  categoria?: string | null;
};
type ArrayPortfolio = Project[];

const toTags = (tags: Project["tags"]) => parseTags(tags ?? []);

const Chip = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cn(
      "rounded-full border px-3 py-1 text-xs font-medium transition",
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border text-muted-foreground hover:border-primary/50 hover:text-card-foreground"
    )}
  >
    {children}
  </button>
);

const INITIAL_VISIBLE = 6;

const ProjectImage = ({ src, alt }: { src?: string | null; alt: string }) => {
  const className =
    "aspect-video w-full rounded-lg border border-border object-cover transition duration-500 group-hover:scale-[1.03]";
  if (!src)
    return (
      <div
        className={`${className} flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/15 via-muted to-muted text-primary`}
      >
        <BriefcaseBusiness className="size-10" aria-hidden />
        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
          <Lock className="size-3" aria-hidden /> Proyecto interno
        </span>
      </div>
    );
  if (/^https?:\/\//.test(src))
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} loading="lazy" className={className} />;
  return src.split("/")[1] === "uploads" ? (
    <Image src={src} alt={alt} width={600} height={338} className={className} />
  ) : (
    <CldImage src={src} width={600} height={338} crop="fill" alt={alt} className={className} />
  );
};

const Portfolio = () => {
  const [dataPortfolio, setDataPortfolio] = useState<ArrayPortfolio>();
  const [showAll, setShowAll] = useState(false);
  const [categoria, setCategoria] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const resource = "project";
  useEffect(() => {
    const fetchData = async () => {
      const data = await apiFetch({ resource });
      setDataPortfolio(
        [...(data as ArrayPortfolio)].sort(
          (a, b) =>
            Number(!a.periodo) - Number(!b.periodo) ||
            Number(a.id) - Number(b.id)
        )
      );
    };
    fetchData();
  }, []);

  const handleDelete = (id: number) => {
    setDataPortfolio((prev) =>
      prev ? prev.filter((item) => Number(item.id) !== id) : []
    );
  };

  const handleCreate = (data: Project) => {
    setDataPortfolio((prev) => [...(prev ?? []), data]);
  };

  const handleUpdate = (data: Project) => {
    setDataPortfolio((prev) =>
      prev?.map((item) =>
        Number(item.id) === Number(data.id) ? { ...item, ...data } : item
      )
    );
  };

  const categorias = useMemo(
    () =>
      Array.from(
        new Set((dataPortfolio ?? []).map((p) => p.categoria).filter(Boolean))
      ) as string[],
    [dataPortfolio]
  );
  const tags = useMemo(
    () =>
      Array.from(
        new Set((dataPortfolio ?? []).flatMap((p) => toTags(p.tags)))
      ).sort((a, b) => a.localeCompare(b)),
    [dataPortfolio]
  );

  const filtered = (dataPortfolio ?? []).filter(
    (p) =>
      (!categoria || p.categoria === categoria) &&
      (!tag || toTags(p.tags).includes(tag))
  );
  const total = filtered.length;
  const visible = showAll ? filtered : filtered.slice(0, INITIAL_VISIBLE);

  return (
    <Section id="projects" number="05" title="Proyectos">
      {(categorias.length > 0 || tags.length > 0) && (
        <div className="mb-8 space-y-3">
          {categorias.length > 0 && (
            <div className="flex flex-wrap gap-2" aria-label="Filtrar por categoría">
              <Chip active={!categoria} onClick={() => setCategoria(null)}>
                Todos
              </Chip>
              {categorias.map((c) => (
                <Chip key={c} active={categoria === c} onClick={() => setCategoria(c === categoria ? null : c)}>
                  {c}
                </Chip>
              ))}
            </div>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2" aria-label="Filtrar por tecnología">
              {tags.map((t) => (
                <Chip key={t} active={tag === t} onClick={() => setTag(t === tag ? null : t)}>
                  {t}
                </Chip>
              ))}
            </div>
          )}
        </div>
      )}
      {total === 0 && dataPortfolio && (
        <p className="text-sm text-muted-foreground">No hay proyectos con ese filtro.</p>
      )}
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
              <div className="flex shrink-0 gap-2">
                <ModalTriggerButton
                  tipoFormulario="project"
                  id={Number(data.id)}
                  omitFields={["image"]}
                  title={`Editar: ${data.titulo}`}
                  defaultValues={{ ...data, tags: toTags(data.tags).join(", ") }}
                  transform={(values) => ({ ...values, tags: parseTags(values.tags) })}
                  onSuccess={(result: unknown) => handleUpdate(result as Project)}
                >
                  <Button type="button" variant="outline" className="size-7" aria-label={`Editar ${data.titulo}`}>
                    <Pencil />
                  </Button>
                </ModalTriggerButton>
                <DeleteButton
                  tipoSchema={resource as FormType}
                  id={Number(data.id)}
                  onSuccess={handleDelete}
                  className="size-7 shrink-0"
                  tipoElemento={""}
                />
              </div>
            </div>
            {(data.rol || data.periodo) && (
              <p className="mt-1 px-1 font-mono text-xs text-muted-foreground">
                {[data.rol, data.periodo].filter(Boolean).join(" · ")}
              </p>
            )}
            {data.descripcion && (
              <p className="mt-2 px-1 text-sm text-muted-foreground">{data.descripcion}</p>
            )}
            {(data.categoria || toTags(data.tags).length > 0) && (
              <ul className="mt-3 flex flex-wrap gap-1.5 px-1" aria-label="Tecnologías">
                {data.categoria && (
                  <li className="rounded-full border border-primary/40 px-2 py-0.5 font-mono text-[11px] text-primary">
                    {data.categoria}
                  </li>
                )}
                {toTags(data.tags).map((t) => (
                  <li key={t} className="rounded-full bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                    {t}
                  </li>
                ))}
              </ul>
            )}
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
          onSuccess={(result: unknown) => handleCreate(result as Project)}
          tipoFormulario="project"
        >
          <Button type="button">Agregar Proyecto</Button>
        </ModalTriggerButton>
      </div>
    </Section>
  );
};

export default Portfolio;
