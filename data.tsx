import {
  BellPlus,
  BookText,
  Briefcase,
  Brush,
  Code2,
  CodeSquare,
  Home,
  Inbox,
  Lightbulb,
  Mail,
  PanelsTopLeft,
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

export const dataServices = [
  {
    id: 1,
    title: "Desarrollo Web",
    icon: <PanelsTopLeft />,
    features: [
      {
        name: "Desarrollo de sitios web personalizados",
      },
      {
        name: "Diseño y desarrollo responsive",
      },
      {
        name: "Optimización SEO",
      },
      {
        name: "Desarrollo de aplicaciones web",
      },
      {
        name: "Gestión de contenido",
      },
      {
        name: "Comercio electrónico",
      },
      {
        name: "Mantenimiento y soporte continuo",
      },
    ],
  },
  {
    id: 2,
    title: "Creación de contenido",
    icon: <BellPlus />,
    features: [
      {
        name: "Redacción de contenido original y de calidad",
      },
      {
        name: "Creación de vídeos atractivos y dinámicos",
      },
      {
        name: "Diseño gráfico para una imagen impactante",
      },
      {
        name: "Edición profesional de textos y materiales visuales",
      },
      {
        name: "Estrategias de marketing de contenidos efectivas",
      },
      {
        name: "Producción de podcasts informativos y entretenidos",
      },
      {
        name: "Generación de infografías claras y visualmente atractivas",
      },
      {
        name: "Fotografía profesional para capturar momentos excepcionales",
      },
    ],
  },
  {
    id: 3,
    title: "UI/UX Design",
    icon: <Brush />,
    features: [
      {
        name: "Diseño intuitivo para una experiencia de usuario fluida",
      },
      {
        name: "Prototipado interactivo para visualizar la interfaz",
      },
      {
        name: "Investigación de usuarios para comprender necesidades y expectativas",
      },
      {
        name: "Optimización de la usabilidad para mejorar la accesibilidad",
      },
      {
        name: "Pruebas de usabilidad para evaluar la experiencia",
      },
      {
        name: "Diseño responsive para adaptarse a diferentes dispositivos",
      },
    ],
  },
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
