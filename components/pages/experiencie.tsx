import { dataExperience } from "@/data";
import Title from "../shared/title";
import { BadgeCheck } from "lucide-react";
import { Progress } from "../ui/progress";
import { ModalTriggerButton } from "./forms/ModalTriggerButton";
import { Button } from "../ui/button";

const Experience = () => {
  return (
    <div className="p-6 md:px-12 md:py-44 max-w-5xl mx-auto">
      <Title title="Experiecia" subtitle="Skills que tengo" />
      <div className="grid md:grid-cols-2 gap-8 mt-5">
        {dataExperience.map((data) => (
          <div key={data.id} className="p-6 rounded-xl border border-gray-400">
            <h3 className="text-center text-xl">{data.title}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {data.experience.map((item) => (
                <div key={item.name} className="my-4">
                  <p className="flex-gap-2">
                    <BadgeCheck />
                    {item.name}
                  </p>
                  <div className="text-gray-400 mb-2">{item.subtitle}</div>
                  <Progress value={item.value} className="w-[60%]" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center max-w-4xl mx-auto mt-10">
        <ModalTriggerButton tipoFormulario="skills">
          <Button type="button">Agregar una Skill</Button>
        </ModalTriggerButton>
      </div>
    </div>
  );
};

export default Experience;
