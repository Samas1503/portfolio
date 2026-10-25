"use client";

import Image from "next/image";
import { CldImage } from "next-cloudinary";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import {
  BriefcaseBusiness,
  ChevronDown,
  ExternalLink,
  Github,
  ListFilter,
  Lock,
  Pencil,
  X,
} from "lucide-react";
import { parseTags } from "@/utils/tags";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ModalTriggerButton } from "./forms/ModalTriggerButton";
import { apiFetch } from "./fetch/tech-all";
import { formsData, FormType } from "./forms/formsData";
import DeleteButton from "../shared/delete-button";
import Section from "../shared/section";
import Spinner from "../shared/spinner";

type Portfolio = typeof formsData.project.schema;
type Project = Omit<z.infer<Portfolio>, "tags"> & {
  tags?: string[] | string | null;
  categoria?: string | null;
};
type ArrayPortfolio = Project[];

const toTags = (tags: Project["tags"]) => parseTags(tags ?? []);

const periodoRange = (periodo?: string | null) => {
  if (!periodo) return { start: 0, end: 0 };
  const years = (periodo.match(/\d{4}/g) ?? []).map(Number);
  const ongoing = /actual/i.test(periodo);
  return {
    start: years[0] ?? 0,
    end: ongoing
      ? Number.MAX_SAFE_INTEGER
      : years.length
        ? Math.max(...years)
        : 0,
  };
};

const byMostRecent = (a: Project, b: Project) => {
  const pa = periodoRange(a.periodo);
  const pb = periodoRange(b.periodo);
  return pb.end - pa.end || pb.start - pa.start || Number(b.id) - Number(a.id);
};

const INITIAL_VISIBLE = 6;

const trackClick = (detalle: string) => {
  const body = JSON.stringify({
    tipo: "click",
    detalle,
    path: window.location.pathname,
  });
  navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }));
};

const ProjectImage = ({ src, alt }: { src?: string | null; alt: string }) => {
  const className =
    "aspect-video w-full rounded-lg border border-border object-cover transition duration-500 group-hover:scale-[1.06] group-hover:brightness-110";
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
      setDataPortfolio(data as ArrayPortfolio);
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

  const sorted = useMemo(
    () => [...(dataPortfolio ?? [])].sort(byMostRecent),
    [dataPortfolio]
  );

  const filtered = sorted.filter(
    (p) =>
      (!categoria || p.categoria === categoria) &&
      (!tag || toTags(p.tags).includes(tag))
  );
  const activeFilters = (categoria ? 1 : 0) + (tag ? 1 : 0);
  const total = filtered.length;
  const visible = showAll ? filtered : filtered.slice(0, INITIAL_VISIBLE);

  return (
    <Section id="projects" number="06" title="Proyectos">
      {(categorias.length > 0 || tags.length > 0) && (
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                aria-label="Filtrar proyectos"
              >
                <ListFilter />
                Filtros
                {activeFilters > 0 && (
                  <span className="grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {activeFilters}
                  </span>
                )}
                <ChevronDown className="opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {categorias.length > 0 && (
                <>
                  <DropdownMenuLabel>Categoría</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={categoria ?? ""}
                    onValueChange={(v) => setCategoria(v || null)}
                  >
                    <DropdownMenuRadioItem value="">
                      Todas
                    </DropdownMenuRadioItem>
                    {categorias.map((c) => (
                      <DropdownMenuRadioItem key={c} value={c}>
                        {c}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </>
              )}
              {categorias.length > 0 && tags.length > 0 && (
                <DropdownMenuSeparator />
              )}
              {tags.length > 0 && (
                <>
                  <DropdownMenuLabel>Tecnología</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={tag ?? ""}
                    onValueChange={(v) => setTag(v || null)}
                  >
                    <DropdownMenuRadioItem value="">
                      Todas
                    </DropdownMenuRadioItem>
                    {tags.map((t) => (
                      <DropdownMenuRadioItem key={t} value={t}>
                        {t}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          {categoria && (
            <button
              type="button"
              onClick={() => setCategoria(null)}
              title="Quitar filtro"
              className="inline-flex items-center gap-1 rounded-full border border-primary bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition hover:bg-primary/80"
            >
              {categoria}
              <X className="size-3" aria-hidden />
            </button>
          )}
          {tag && (
            <button
              type="button"
              onClick={() => setTag(null)}
              title="Quitar filtro"
              className="inline-flex items-center gap-1 rounded-full border border-primary bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition hover:bg-primary/80"
            >
              {tag}
              <X className="size-3" aria-hidden />
            </button>
          )}
        </div>
      )}
      {total === 0 && dataPortfolio && (
        <p className="text-sm text-muted-foreground">No hay proyectos con ese filtro.</p>
      )}
      {dataPortfolio === undefined ? (
        <Spinner />
      ) : (
      <ul className="grid gap-6 sm:grid-cols-2">
        {visible?.map((data) => (
          <li
            key={data.id}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card/50 backdrop-blur-sm p-3 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl motion-reduce:transition-none"
          >
            {data.urlDemo ? (
              <a
                href={data.urlDemo}
                onClick={() => trackClick(`demo:${data.titulo}`)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Ver demo de ${String(data.titulo)}`}
                className="block overflow-hidden rounded-lg"
              >
                <ProjectImage src={data.image} alt={String(data.titulo)} />
              </a>
            ) : (
              <div className="overflow-hidden rounded-lg">
                <ProjectImage src={data.image} alt={String(data.titulo)} />
              </div>
            )}
            <div className="flex flex-1 items-start justify-between gap-2 px-1 pt-4">
              <h3 className="font-semibold leading-snug text-card-foreground group-hover:text-primary">
                {String(data.titulo)}
              </h3>
              <div className="flex shrink-0 gap-2">
                <ModalTriggerButton
                  tipoFormulario="project"
                  id={Number(data.id)}
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
                  onClick={() => trackClick(`github:${data.titulo}`)}
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
                  onClick={() => trackClick(`demo:${data.titulo}`)}
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
      )}

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
