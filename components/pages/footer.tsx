import { Separator } from "@radix-ui/react-separator";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="max-w-3xl mx-auto">
      <div className="md:flex md:justify-between">
        <div>
          <h4 className="text-3xl font-bold my-6 md:my-0">Samas1503</h4>
        </div>
        <div className="px-2 flex justify-between md:gap-8 items-center">
          <Link href="#bout-me">Sobre mi</Link>
          <Link href="#skills">Habilidades</Link>
          <Link href="#services">Mis Servicios</Link>
          <Link href="#portfolio">Portfolio</Link>
          <Link href="#contact">Contacto</Link>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="text-center">
        {" "}
        &copy; 2025 | Portfolio de Samuel Elias Paredes
      </div>
    </footer>
  );
};

export default Footer;
