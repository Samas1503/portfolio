import Title from "../shared/title";
import { BadgeCheck } from "lucide-react";
import { Progress } from "../ui/progress";
import { ModalTriggerButton } from "./forms/ModalTriggerButton";
import { Button } from "../ui/button";
import { apiFetch } from "./fetch/tech-all";

const skils = async () => {
  // const dataSkills = await services.getAllDataService("skils");
    const dataSkills = await apiFetch({resource:"skils"});

  const map = new Map<string, { tipo: string; nombre: string; nivel: string; valor: number }[]>();

  dataSkills.forEach((data) => {
    if (!map.has(data.tipo)) {
      map.set(data.tipo, []);
    }
    map.get(data.tipo)!.push(data);
  });

  const groupedObj = Object.fromEntries(map);
  

  return (
    <div className="p-6 md:px-12 md:py-44 max-w-5xl mx-auto" id="skils">
      <Title title="Habilidades" subtitle="Habilidades que tengo" />
      <div className="grid md:grid-cols-2 gap-8 mt-5">
        {Object.keys(groupedObj).map((key) => (
          <div key={key} className="p-6 rounded-xl border border-gray-400">
            <h3 className="text-center text-xl">{key}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.values(groupedObj[key]).flat().map((item: { nombre: string; nivel: string; valor: number }) => (
                <div key={item.nombre} className="my-4">
                  <p className="flex-gap-2">
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
        <ModalTriggerButton tipoFormulario="skils">
          <Button type="button">Agregar una Skill</Button>
        </ModalTriggerButton>
      </div>
    </div>
  );
};

export default skils;
