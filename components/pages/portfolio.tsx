// import { dataPortfolio } from "@/data";
import Title from "../shared/title";
import Image from "next/image";
import Link from "next/link";
import { Button, buttonVariants } from "../ui/button";
import services from "@/backend/Services";
import { ModalTriggerButton } from "./forms/ModalTriggerButton";

const Portfolio = async () => {
  const dataPortfolio = await services.getAllDataService("proyectos");
  return (
    <div className="p-4 max-w-4xl md:py-24 mx-auto" id="portfolio">
      <Title title="Portfolio" subtitle="Trabajos recientes" />
      <div className="grid md:grid-cols-3 gap-14 mt-4">
        {dataPortfolio.map((data) => (
          <div key={data.id}>
            {"titulo" in data && (
              <h3 className="text-xl mb-4">{data.titulo}</h3>
            )}
            <Image
              src={
                "imagen" in data && data.imagen
                  ? data.imagen
                  : "/placeholder-image.png"
              }
              alt="Image"
              width={300}
              height={300}
              className="rounded-2xl w-full"
            />
            <div className="mt-5 flex gap-7">
              <Link
                className={buttonVariants({ variant: "outline" })}
                href={
                  "urlGithub" in data && data.urlGithub ? data.urlGithub : "#!"
                }
                target="_blank"
              >
                GitHub
              </Link>
              <Link
                className={buttonVariants()}
                href={"urlDemo" in data && data.urlDemo ? data.urlDemo : "#!"}
                target="_blank"
              >
                Live demo
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center items-center max-w-4xl mx-auto mt-10">
        <ModalTriggerButton tipoFormulario="portfolio">
          <Button type="button">Agregar Proyecto</Button>
        </ModalTriggerButton>
      </div>
    </div>
  );
};

export default Portfolio;
