"use client";

import Title from "../shared/title";
import { BadgeCheck } from "lucide-react";
import { Progress } from "../ui/progress";
import { ModalTriggerButton } from "./forms/ModalTriggerButton";
import { Button } from "../ui/button";
import { apiFetch } from "./fetch/tech-all";
import DeleteButton from "../shared/delete-button";
import { formsData, FormType } from "./forms/formsData";
import { useEffect, useState } from "react";
import { z } from "zod";

type Skill = z.infer<typeof formsData.skills.schema>;

const Skills = () => {
  const [dataSkills, setDataSkills] = useState<Record<string, Skill[]>>({});
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
          Array.from(map.entries()).map(([key, value]) => [
            key,
            value as Skill[],
          ])
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

    console.log(dataSkills);
  };

  return (
    <div className="p-6 md:px-12 md:py-44 max-w-5xl mx-auto" id="skills">
      <Title title="Habilidades" subtitle="Habilidades que tengo" />
      <div className="grid md:grid-cols-2 gap-8 mt-5">
        {Object.entries(dataSkills).map(([key, items]) => (
          <div key={key} className="p-6 rounded-xl border border-gray-400">
            <h3 className="text-center text-xl">{key}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {items.map((item) => (
                <div key={item.id} className="my-4 relative">
                  <DeleteButton
                    tipoSchema={resource as FormType}
                    tipoElemento={item.tipo}
                    id={item.id}
                    onSuccess={handleDelete}
                    className="absolute top-0 right-2"
                  />
                  <p className="flex gap-2">
                    <BadgeCheck />
                    {item.nombre}
                  </p>
                  <div className="text-gray-400 mb-2">{item.nivel}</div>
                  <Progress value={item.valor} className="w-[60%]" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center max-w-4xl mx-auto mt-10">
        <ModalTriggerButton onSuccess={handleCreate} tipoFormulario="skills">
          <Button type="button">Agregar una Skill</Button>
        </ModalTriggerButton>
      </div>
    </div>
  );
};

export default Skills;
