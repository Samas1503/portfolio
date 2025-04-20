import { Button } from "../ui/button";
import { ModalTriggerButton } from "./forms/ModalTriggerButton";
import Title from "../shared/title";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import GoogleMaps from "./google-maps";
import { apiFetch } from "./fetch/tech-all";

const Works = async () => {
  const dataExperience = await apiFetch({resource: "experiencia"});
  return (
    <div className="p-6 md:px-12 md:py-44 max-w-5xl mx-auto" id="work">
      <Title title="Trabajos" subtitle="Experiencia Laboral" />
      <div className="grid md:grid-cols-2 gap-8 mt-5">
        {dataExperience.map((data) => (
          <Card key={data.id} className="w-[400px]">
            <CardHeader>
              <CardTitle className="flex justify-between">
                <strong className="">{data.empresa}</strong>
                <small>
                  {data.fecha_inicio} - {data.fecha_fin}
                </small>
              </CardTitle>
              <CardDescription>
                <strong>{data.cargo}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GoogleMaps
                value={{ lat: data.latitud, lng: data.longitud }}
              ></GoogleMaps>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p>
                <strong>Referencia: </strong> 
                {data.nombreReferencia}
              </p>
              <Button type="button">
                <Link href={"tel:" + data.nroReferencia} target="_blank">
                  Contactar
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="flex justify-center items-center max-w-4xl mx-auto mt-10">
        <ModalTriggerButton tipoFormulario="work">
          <Button type="button">Agregar Experiencia Laboral</Button>
        </ModalTriggerButton>
      </div>
    </div>
  );
};

export default Works;
