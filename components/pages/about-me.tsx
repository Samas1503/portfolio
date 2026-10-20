import { Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { dataAboutMe } from "@/data";
import { buttonVariants } from "../ui/button";
import Section from "../shared/section";

const AboutMe = () => {
  return (
    <Section id="about" number="01" title="Sobre mí">
      <div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-start">
        <div className="space-y-4 leading-relaxed text-muted-foreground">
          <p>
            Soy estudiante de la <span className="text-card-foreground">UNJu</span>,
            culminé la carrera de{" "}
            <span className="text-card-foreground">Analista Programador Universitario</span>{" "}
            y actualmente curso la carrera de{" "}
            <span className="text-card-foreground">Ingeniería Informática</span> en la
            Facultad de Ingeniería.
          </p>
          <p>
            Adquirí conocimientos en Diseño y Desarrollo de Aplicaciones Web y
            Móviles, y en desarrollo de Páginas Web, mediante tecnologías
            modernas. Tengo gran capacidad para adaptarme a múltiples entornos
            disciplinarios.
          </p>
          <p>
            Me caracterizo por mi facilidad para trabajar en equipo y mi
            compromiso en el desarrollo y culminación de las actividades que se
            me designen en tiempo y forma. Me entusiasma seguir aprendiendo y
            mejorando mis aptitudes, conocimientos y habilidades.
          </p>
        </div>
        <div className="group relative mx-auto w-48 sm:w-44">
          <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-xl border-2 border-primary transition group-hover:translate-x-2 group-hover:translate-y-2" />
          <Image
            src="/profile.jpg"
            alt="Foto de Samuel Elias Paredes"
            width={300}
            height={300}
            className="relative aspect-square rounded-xl object-cover grayscale-[30%] transition group-hover:grayscale-0"
          />
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {dataAboutMe.map((data) => (
          <div
            key={data.id}
            className="rounded-xl border border-border bg-card/50 p-4 transition hover:border-primary/40"
          >
            <span className="text-primary">{data.icon}</span>
            <p className="mt-3 text-sm font-semibold text-card-foreground">{data.name}</p>
            <p className="text-sm text-muted-foreground">{data.description}</p>
          </div>
        ))}
      </div>

      <Link
        href="tel:3884558285"
        className={buttonVariants({ variant: "outline", className: "mt-8" })}
      >
        <Phone /> Hablemos
      </Link>
    </Section>
  );
};

export default AboutMe;
