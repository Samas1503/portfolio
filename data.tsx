import {
  BookText,
  Briefcase,
  CodeSquare,
  GraduationCap,
  Home,
  Lightbulb,
  Mail,
  UserRound,
} from "lucide-react";

export const itemsNavbar = [
  { id: 1, title: "Inicio", icon: <Home size={20} />, link: "#home" },
  { id: 2, title: "Sobre mí", icon: <UserRound size={20} />, link: "#about" },
  { id: 3, title: "Servicios", icon: <BookText size={20} />, link: "#services" },
  { id: 4, title: "Experiencia", icon: <Briefcase size={20} />, link: "#experience" },
  { id: 5, title: "Habilidades", icon: <Lightbulb size={20} />, link: "#skills" },
  { id: 6, title: "Proyectos", icon: <CodeSquare size={20} />, link: "#projects" },
  { id: 7, title: "Formación", icon: <GraduationCap size={20} />, link: "#academia" },
  { id: 8, title: "Contacto", icon: <Mail size={20} />, link: "#contact" },
];
