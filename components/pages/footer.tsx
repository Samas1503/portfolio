import Link from "next/link";
import { getContactos } from "@/backend/data/contactos";
import ContactIcon from "@/components/shared/contact-icon";

const Footer = async () => {
  const contactos = await getContactos();

  return (
    <footer className="max-w-md pb-28 text-sm text-muted-foreground lg:pb-0">
      <div className="mb-5 flex flex-wrap items-center gap-4">
        {contactos
          .filter((c) => c.link?.startsWith("http"))
          .map((c) => (
            <Link
              key={c.id}
              href={c.link!}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={c.nombre ?? "Contacto"}
              title={c.titulo ?? c.nombre ?? ""}
              className="text-muted-foreground transition hover:text-primary [&_svg]:h-5 [&_svg]:w-5"
            >
              <ContactIcon name={c.icono} />
            </Link>
          ))}
      </div>
      <p>
        Diseñado y desarrollado por{" "}
        <span className="text-card-foreground">Samuel Elias Paredes</span> con
        Next.js, Tailwind CSS, Supabase y Three.js.
      </p>
      <p className="mt-2">&copy; {new Date().getFullYear()} · Samas1503</p>
    </footer>
  );
};

export default Footer;
