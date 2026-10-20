"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Mail, Paperclip } from "lucide-react";
import { dataContact } from "@/data";
import { buttonVariants } from "../ui/button";
import { ToggleTheme } from "../theme/toogle-theme";
import LogOutButton from "@/app/logout/page";
import Hero3D from "../three/hero-3d";
import { cn } from "@/lib/utils";

export const sections = [
  { id: "about", label: "Sobre mí" },
  { id: "experience", label: "Experiencia" },
  { id: "skills", label: "Habilidades" },
  { id: "services", label: "Servicios" },
  { id: "projects", label: "Proyectos" },
  { id: "contact", label: "Contacto" },
];

const CV_URL =
  "https://drive.google.com/file/d/1dHpIEffAKokD0TdCKf2BsmWsPFE63DGg/view?usp=drive_link";

const Sidebar = () => {
  const [active, setActive] = useState("about");

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
        <p className="font-mono text-sm text-primary">Hola, mi nombre es</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-card-foreground sm:text-5xl">
          Samuel Elias Paredes
        </h1>
        <h2 className="mt-3 text-lg font-medium tracking-tight text-card-foreground sm:text-xl">
          Backend Developer <span className="text-muted-foreground">· Samas1503</span>
        </h2>
        <p className="mt-4 max-w-xs leading-relaxed text-muted-foreground">
          Analista Programador Universitario (UNJu) y estudiante de Ingeniería
          Informática. Diseño y desarrollo aplicaciones web y móviles con
          tecnologías modernas.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link className={buttonVariants()} href="#contact">
            <Mail /> Contactame
          </Link>
          <Link
            className={buttonVariants({ variant: "outline" })}
            href={CV_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Paperclip /> Descargar CV
          </Link>
        </div>

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
          {dataContact.map((item) => (
            <li key={item.id}>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.title}
                title={item.subtitle}
                className="block rounded-full p-2 text-muted-foreground transition hover:bg-accent hover:text-primary"
              >
                {item.icon}
              </a>
            </li>
          ))}
        </ul>
        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <ToggleTheme />
          <LogOutButton />
        </div>
      </div>
    </header>
  );
};

export default Sidebar;
