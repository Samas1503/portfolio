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
  LucideWorkflow,
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
  {
    id: 1,
    title: "Home",
    icon: <Home size={20} />,
    link: "#home",
  },
  {
    id: 2,
    title: "User",
    icon: <UserRound size={20} />,
    link: "#about-me",
  },
  {
    id: 3,
    title: "Work",
    icon: <LucideWorkflow size={20} />,
    link: "#work",
  },
  {
    id: 4,
    title: "skills",
    icon: <Lightbulb size={20} />,
    link: "#skills",
  },
  {
    id: 5,
    title: "Book",
    icon: <BookText size={20} />,
    link: "#services",
  },
  {
    id: 6,
    title: "Target",
    icon: <CodeSquare size={20} />,
    link: "#portfolio",
  },
  {
    id: 7,
    title: "Home",
    icon: <Mail size={20} />,
    link: "#contact",
  },
];

export const dataSlider = [
  {
    id: 1,
    url: "/slider-1.jpg",
  },
  {
    id: 2,
    url: "/slider-2.jpg",
  },
  {
    id: 3,
    url: "/slider-3.jpg",
  },
  {
    id: 4,
    url: "/slider-4.jpg",
  },
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

export const dataTestimonials = [
  {
    id: 1,
    name: "George Snow",
    description:
      "¡Increíble plataforma! Los testimonios aquí son genuinos y me han ayudado a tomar decisiones informadas. ¡Altamente recomendado!",
    imageUrl: "/profile-1.jpeg",
  },
  {
    id: 2,
    name: "Juan Pérez",
    description:
      "Me encanta la variedad de testimonios disponibles en esta página. Es inspirador ver cómo otras personas han superado desafíos similares a los míos. ¡Gracias por esta invaluable fuente de motivación!",
    imageUrl: "/profile-2.jpeg",
  },
  {
    id: 3,
    name: "María García",
    description:
      "Excelente recurso para obtener opiniones auténticas sobre diferentes productos y servicios. Me ha ayudado mucho en mis compras en línea. ¡Bravo por este sitio!",
    imageUrl: "/profile-3.jpeg",
  },
  {
    id: 4,
    name: "Laura Snow",
    description:
      "¡Qué descubrimiento tan fantástico! Los testimonios aquí son honestos y detallados. Me siento más seguro al tomar decisiones después de leer las experiencias compartidas por otros usuarios.",
    imageUrl: "/profile-3.jpeg",
  },
  {
    id: 5,
    name: "Carlos Sánchez",
    description:
      "Una joya en la web. Los testimonios son fáciles de encontrar y están bien organizados. ¡Definitivamente mi destino número uno cuando necesito referencias confiables!",
    imageUrl: "/profile-2.jpeg",
  },
  {
    id: 6,
    name: "Antonio Martínez",
    description:
      "¡Fantástico recurso para aquellos que buscan validación antes de tomar decisiones importantes! Los testimonios aquí son veraces y realmente útiles. ¡Gracias por simplificar mi proceso de toma de decisiones!",
    imageUrl: "/profile-3.jpeg",
  },
];
