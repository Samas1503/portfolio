"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Mail, Paperclip, Pencil, Upload } from "lucide-react";
import { Button, buttonVariants } from "../ui/button";
import { ModalTriggerButton } from "./forms/ModalTriggerButton";
import { PERFIL_ABOUT_FIELDS, toFormValues } from "./forms/formsData";
import { useUsuario } from "@/context/UserContext";
import type { Perfil } from "@/backend/data/perfil";
import type { Contacto } from "@/backend/data/contactos";
import ContactIcon from "../shared/contact-icon";
import { ToggleTheme } from "../theme/toogle-theme";
import LogOutButton from "@/app/logout/page";
import AdminMenu from "./admin-menu";
import Hero3D from "../three/hero-3d";
import { cn } from "@/lib/utils";

export const sections = [
  { id: "about", label: "Sobre mí" },
  { id: "experience", label: "Experiencia" },
  { id: "skills", label: "Habilidades" },
  { id: "services", label: "Servicios" },
  { id: "projects", label: "Proyectos" },
  { id: "academia", label: "Formación" },
  { id: "contact", label: "Contacto" },
];

const Sidebar = ({
  perfil: initialPerfil,
  contactos,
}: {
  perfil: Perfil | null;
  contactos: Contacto[];
}) => {
  const [active, setActive] = useState("about");
  const [perfil, setPerfil] = useState(initialPerfil);
  const [uploading, setUploading] = useState(false);
  const cvInput = useRef<HTMLInputElement>(null);
  const { usuario } = useUsuario();

  const uploadCv = async (file: File) => {
    if (!perfil) return;
    const body = new FormData();
    body.append("file", file);
    body.append("id", String(perfil.id));
    setUploading(true);
    try {
      const res = await fetch("/api/cv", { method: "POST", body });
      if (res.status === 401) {
        document.cookie = "usuario=; Max-Age=0; path=/";
        window.location.assign("/login");
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setPerfil({ ...perfil, cvUrl: json.cvUrl });
    } catch (error) {
      alert(`No se pudo subir el CV: ${(error as Error).message}`);
    } finally {
      setUploading(false);
      if (cvInput.current) cvInput.current.value = "";
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-35% 0px -60% 0px" }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <header
      id="home"
      className="lg:sticky lg:top-0 lg:flex lg:max-h-screen lg:w-[48%] lg:flex-col lg:justify-between lg:py-20"
    >
      <div>
        <div className="mb-6 hidden justify-end gap-2 lg:flex">
          <AdminMenu />
          <LogOutButton />
        </div>
        <p className="font-mono text-sm text-primary">Hola, mi nombre es</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-card-foreground sm:text-5xl">
          {perfil?.nombre}
        </h1>
        <h2 className="mt-3 text-lg font-medium tracking-tight text-card-foreground sm:text-xl">
          {perfil?.rol}{" "}
          {perfil?.alias && (
            <span className="text-muted-foreground">· {perfil.alias}</span>
          )}
        </h2>
        <p className="mt-4 max-w-xs leading-relaxed text-muted-foreground">
          {perfil?.resumen}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link className={buttonVariants()} href="#contact">
            <Mail /> Contactame
          </Link>
          {perfil?.cvUrl && (
            <Link
              className={buttonVariants({ variant: "outline" })}
              href={perfil.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Paperclip /> Descargar CV
            </Link>
          )}
        </div>

        {usuario && perfil && (
          <div className="mt-3 flex flex-wrap gap-2">
            <ModalTriggerButton
              tipoFormulario="perfil"
              id={perfil.id}
              defaultValues={toFormValues(perfil)}
              omitFields={PERFIL_ABOUT_FIELDS}
              title="Editar: Información principal"
              onSuccess={(result) =>
                setPerfil({ ...perfil, ...(result as Partial<Perfil>) })
              }
            >
              <Button type="button" variant="outline" size="sm">
                <Pencil /> Editar perfil
              </Button>
            </ModalTriggerButton>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => cvInput.current?.click()}
            >
              <Upload /> {uploading ? "Subiendo…" : "Subir CV (PDF)"}
            </Button>
            <input
              ref={cvInput}
              type="file"
              accept="application/pdf"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadCv(file);
              }}
            />
          </div>
        )}

        <nav className="mt-10 hidden lg:block" aria-label="Secciones">
          <ul className="w-max">
            {sections.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="group flex items-center py-2.5"
                  aria-current={active === id ? "true" : undefined}
                >
                  <span
                    className={cn(
                      "mr-4 h-px w-8 bg-muted-foreground transition-all group-hover:w-16 group-hover:bg-foreground motion-reduce:transition-none",
                      active === id && "w-16 bg-primary"
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground",
                      active === id && "text-primary"
                    )}
                  >
                    {label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <Hero3D className="pointer-events-none mx-auto my-8 h-56 w-full max-w-sm lg:pointer-events-auto lg:my-4 lg:h-auto lg:max-h-64 lg:min-h-28 lg:flex-1" />

      <div className="flex items-center gap-4">
        <ul className="flex items-center gap-2" aria-label="Redes y contacto">
          {contactos.map((item) => (
            <li key={item.id}>
              <a
                href={item.link ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.nombre ?? undefined}
                title={item.titulo ?? undefined}
                className="block rounded-full p-2 text-muted-foreground transition hover:bg-accent hover:text-primary"
              >
                <ContactIcon name={item.icono} />
              </a>
            </li>
          ))}
          {usuario && (
            <li>
              <a
                href="#contact"
                aria-label="Editar redes"
                title="Editar redes"
                className="block rounded-full p-2 text-muted-foreground transition hover:bg-accent hover:text-primary"
              >
                <Pencil size={18} />
              </a>
            </li>
          )}
        </ul>
        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <ToggleTheme />
        </div>
      </div>
    </header>
  );
};

export default Sidebar;
