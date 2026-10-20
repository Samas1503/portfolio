"use client";

import Section from "../shared/section";
import { BadgeCheck } from "lucide-react";
import { ModalTriggerButton } from "./forms/ModalTriggerButton";
import { Button } from "../ui/button";
import { apiFetch } from "./fetch/tech-all";
import DeleteButton from "../shared/delete-button";
import { formsData, FormType } from "./forms/formsData";
import { useEffect, useState } from "react";
import { z } from "zod";

type Skill = z.infer<typeof formsData.skills.schema>;
type ArraySkill = Skill[];

const Skills = () => {
  const [dataSkills, setDataSkills] = useState<Record<string, ArraySkill>>({});
  const resource = "skills";
  useEffect(() => {
    const fetchData = async () => {
      const response = (await apiFetch({ resource })) as Skill[];

      const map = new Map<string, Skill[]>();

      response.forEach((data) => {
        if (!map.has(data.tipo)) {
          map.set(data.tipo, []);
        }
        map.get(data.tipo)!.push({
          ...data,
          resource,
          id: data.id,
        });
      });

      setDataSkills(
        Object.fromEntries(
          Array.from(map.entries()).map(([key, value]) => [key, value])
        )
      );
    };

    fetchData();
  }, []);

  const handleDelete = (id: number, tipoElemento: string) => {
    setDataSkills((prev) => {
      if (prev[tipoElemento]) {
        const updatedTipo = prev[tipoElemento]?.filter(
          (item) => item.id !== id
        );

        if (updatedTipo && updatedTipo.length > 0) {
          return { ...prev, [tipoElemento]: updatedTipo };
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [tipoElemento]: _, ...rest } = prev;
          return rest;
        }
      }

      return prev;
    });
  };

  const handleCreate = (data: Skill) => {
    setDataSkills((prev) => ({
      ...prev,
      [data.tipo]: [...(prev[data.tipo] || []), data],
    }));
  };

  return (
    <Section id="skills" number="03" title="Habilidades">
      <div className="grid gap-6 sm:grid-cols-2">
        {Object.entries(dataSkills).map(([key, items]) => (
          <div
            key={key}
            className="rounded-xl border border-border bg-card/50 p-5"
          >
            <h3 className="mb-4 font-mono text-sm uppercase tracking-widest text-primary">
              {key}
            </h3>
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="flex items-center gap-2 text-sm font-medium text-card-foreground">
                      <BadgeCheck className="size-4 text-primary" />
                      {item.nombre}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">
                        {item.nivel}
                      </span>
                      <DeleteButton
                        tipoSchema={resource as FormType}
                        tipoElemento={item.tipo}
                        id={item.id!}
                        onSuccess={handleDelete}
                        className="size-7"
                      />
                    </div>
                  </div>
                  <div
                    className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-label={item.nombre}
                    aria-valuenow={item.valor}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
                      style={{ width: `${item.valor}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <ModalTriggerButton
          onSuccess={(result) => {
            handleCreate(result as Skill);
          }}
          tipoFormulario="skills"
        >
          <Button type="button">Agregar una Skill</Button>
        </ModalTriggerButton>
      </div>
    </Section>
  );
};

export default Skills;
