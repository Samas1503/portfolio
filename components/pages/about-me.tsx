import { Phone } from "lucide-react";
import { Button } from "../ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";
import { dataAboutMe, dataSlider } from "@/data";
import Title from "../shared/title";
import Image from "next/image";

const AboutMe = () => {
  return (
    <div className="p-6 md:px-12 md:py-30 max-w-5xl mx-auto" id="about-me">
      <Title title="Sobre Mi" subtitle="Conoceme" />

      <div className="grid md:grid-cols-2">
        <div className="py-12 md:py-0 flex items-center justify-center">
          <Carousel
            opts={{
              align: "start",
            }}
            orientation="vertical"
            className="w-full max-w-xs h-fit"
          >
            <CarouselContent className="-mt-1 h-[200px]">
              {dataSlider.map((data) => (
                <CarouselItem key={data.id}>
                  <div className="flex items-center justify-center">
                    <Image
                      src={data.url}
                      alt="image"
                      width={250}
                      height={400}
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious/>
            <CarouselNext/>
          </Carousel>
        </div>
        <div>
          <div className="grid md:grid-cols-3 mt-7 gap-4">
            {dataAboutMe.map((data) => (
              <div
                key={data.id}
                className="border border-white-10 rounded-xl p-4 shadow-md shadow-slate-100 dark:bg-salte-800"
              >
                {data.icon}
                <p className="my-2">{data.name}</p>
                <p className="text-gray-400">{data.description}</p>
              </div>
            ))}
          </div>

          <p className="my-8">
            Soy estudiante de la UNJu, culmine la carrera de Analista
            Programador Universitario y actualmente curso la carrera de
            Ingeniería Informática en la Facultad de Ingeniería. Adquirí
            conocimientos en Diseño y Desarrollo de Aplicaciones Web y Móviles,
            y en desarrollo de Páginas Web; mediante tecnologías modernas. Tengo
            gran capacidad para adaptarme a múltiples entornos disciplinarios.
            Me caracterizo por mi facilidad para trabajar en equipo y compromiso
            en el desarrollo y culminación de las actividades que se me designen
            en tiempo y forma. Me entusiasma seguir aprendiendo y mejorando mis
            aptitudes, conocimientos y habilidades.
          </p>

          <Button>
            <Phone size={20} className="mr-2" />
            Hablemos
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AboutMe;
