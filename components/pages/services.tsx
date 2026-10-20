import { dataServices } from "@/data";
import { Check } from "lucide-react";
import Section from "../shared/section";

const Services = () => {
  return (
    <Section id="services" number="04" title="Servicios">
      <div className="grid gap-4">
        {dataServices.map((service) => (
          <div
            key={service.id}
            className="rounded-xl border border-border bg-card/50 p-5 transition hover:border-primary/40"
          >
            <h3 className="mb-4 flex items-center gap-3 font-semibold text-card-foreground">
              <span className="rounded-lg bg-accent p-2 text-primary">
                {service.icon}
              </span>
              {service.title}
            </h3>
            <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              {service.features.map((feature, index) => (
                <li key={index} className="flex gap-2">
                  <Check size={16} className="mt-0.5 shrink-0 text-primary" />
                  {feature.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default Services;
