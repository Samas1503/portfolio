import {
  BookText,
  Briefcase,
  Code2,
  CodeSquare,
  Home,
  Inbox,
  Lightbulb,
  Mail,
  Phone,
  UserRound,
  UsersRound,
  Wrench,
} from "lucide-react";

export const dataAboutMe = [
  {
    id: 1,
    name: "Experiencia",
    icon: <Briefcase />,
    description: "+2 años de experiencia",
  },
  {
    id: 2,
    name: "Clientes",
    icon: <UsersRound />,
    description: "+20 clientes satisfechos",
  },
  {
    id: 3,
    name: "Proyectos",
    icon: <Wrench />,
    description: "+5 completados",
  },
];

export const itemsNavbar = [
  { id: 1, title: "Inicio", icon: <Home size={20} />, link: "#home" },
  { id: 2, title: "Sobre mí", icon: <UserRound size={20} />, link: "#about" },
  { id: 3, title: "Experiencia", icon: <Briefcase size={20} />, link: "#experience" },
  { id: 4, title: "Habilidades", icon: <Lightbulb size={20} />, link: "#skills" },
  { id: 5, title: "Servicios", icon: <BookText size={20} />, link: "#services" },
  { id: 6, title: "Proyectos", icon: <CodeSquare size={20} />, link: "#projects" },
  { id: 7, title: "Contacto", icon: <Mail size={20} />, link: "#contact" },
];

export const dataContact = [
  {
    id: 1,
    title: "Teléfono",
    subtitle: "+54 9 3884558285",
    link: "tel:+5493884558285",
    icon: <Phone />,
  },
  {
    id: 2,
    title: "Github",
    subtitle: "github.com/Samas1503",
    link: "https://github.com/Samas1503",
    icon: <Code2 />,
  },
  {
    id: 3,
    title: "Email",
    subtitle: "samueleliasparedes.10@gmail.com",
    link: "mailto:samueleliasparedes.10@gmail.com",
    icon: <Inbox />,
  },
];
