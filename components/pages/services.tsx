"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BellPlus,
  Blocks,
  Brush,
  Check,
  Code,
  Database,
  PanelsTopLeft,
  Server,
  type LucideIcon,
} from "lucide-react";
import Section from "../shared/section";
import { apiFetch } from "./fetch/tech-all";
import { useUsuario } from "@/context/UserContext";
import { ModalTriggerButton } from "./forms/ModalTriggerButton";
import DeleteButton from "../shared/delete-button";
import { Button } from "../ui/button";

type Servicio = {
  id: number;
  tipo: string | null;
  icono: string | null;
  nombre: string | null;
  estado: boolean | null;
};

const ICONS: Record<string, LucideIcon> = {
  PanelsTopLeft,
  Server,
  Database,
  Blocks,
  Code,
  Brush,
  BellPlus,
};

const resource = "servicios";

const Services = () => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const { usuario } = useUsuario();

  useEffect(() => {
    apiFetch({ resource }).then((data) => setServicios(data as Servicio[]));
  }, []);

  const toggle = async (item: Servicio) => {
    const estado = !item.estado;
    setServicios((prev) =>
      prev.map((s) => (s.id === item.id ? { ...s, estado } : s))
    );
    try {
      await apiFetch({ resource, method: "PATCH", id: item.id, data: { estado } });
    } catch (error) {
      console.error("No se pudo actualizar el servicio", error);
      setServicios((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, estado: !estado } : s))
      );
    }
  };

  const groups = useMemo(() => {
    const map = new Map<string, Servicio[]>();
    servicios
      .filter((s) => usuario || s.estado)
      .forEach((s) => {
        const key = s.tipo ?? "Otros";
        map.set(key, [...(map.get(key) ?? []), s]);
      });
    return Array.from(map.entries());
  }, [servicios, usuario]);

  return (
    <Section id="services" number="02" title="Servicios">
      {usuario && (
        <p className="mb-4 text-sm text-muted-foreground">
          Tildá los servicios que querés mostrar. Los destildados solo los ves vos.
        </p>
      )}
      <div className="grid gap-4">
        {groups.map(([tipo, items]) => {
          const Icon = ICONS[items[0]?.icono ?? ""] ?? Check;
          return (
            <div
              key={tipo}
              className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-5 transition hover:border-primary/40"
            >
              <h3 className="mb-4 flex items-center gap-3 font-semibold text-card-foreground">
                <span className="rounded-lg bg-accent p-2 text-primary">
                  <Icon />
                </span>
                {tipo}
              </h3>
              <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                {items.map((item) => (
                  <li key={item.id} className="flex items-start gap-2">
                    {usuario ? (
                      <label className="flex flex-1 cursor-pointer items-start gap-2">
                        <input
                          type="checkbox"
                          checked={Boolean(item.estado)}
                          onChange={() => toggle(item)}
                          className="mt-0.5 size-4 shrink-0 accent-primary"
                        />
                        <span className={item.estado ? "" : "line-through opacity-60"}>
                          {item.nombre}
                        </span>
                      </label>
                    ) : (
                      <>
                        <Check size={16} className="mt-0.5 shrink-0 text-primary" />
                        {item.nombre}
                      </>
                    )}
                    <DeleteButton
                      tipoSchema={resource}
                      id={item.id}
                      tipoElemento=""
                      className="size-6 shrink-0"
                      onSuccess={(id) =>
                        setServicios((prev) => prev.filter((s) => s.id !== id))
                      }
                    />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <div className="mt-8 flex justify-center">
        <ModalTriggerButton
          tipoFormulario={resource}
          title="Agregar servicio"
          transform={(data) => ({ ...data, estado: true })}
          onSuccess={() =>
            apiFetch({ resource }).then((data) => setServicios(data as Servicio[]))
          }
        >
          <Button type="button">Agregar servicio</Button>
        </ModalTriggerButton>
      </div>
    </Section>
  );
};

export default Services;
