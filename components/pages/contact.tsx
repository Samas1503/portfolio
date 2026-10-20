import { dataContact } from "@/data";
import ContactForm from "./forms/contact-form";
import Section from "../shared/section";

const Contact = () => {
  return (
    <Section id="contact" number="06" title="Contacto">
      <p className="mb-8 max-w-md leading-relaxed text-muted-foreground">
        ¿Tenés un proyecto o una propuesta? Escribime por cualquiera de estos
        medios o dejame un mensaje con el formulario.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {dataContact.map((data) => (
          <a
            key={data.id}
            href={data.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-xl border border-border bg-card/50 p-4 transition hover:border-primary/40"
          >
            <span className="text-primary">{data.icon}</span>
            <p className="mt-3 text-sm font-semibold text-card-foreground">{data.title}</p>
            <p className="break-all text-xs text-muted-foreground group-hover:text-primary">
              {data.subtitle}
            </p>
          </a>
        ))}
      </div>
      <div className="mt-8 rounded-xl border border-border bg-card/50 p-5">
        <ContactForm />
      </div>
    </Section>
  );
};

export default Contact;
