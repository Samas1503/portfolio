"use client";

import Link from "next/link";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useUsuario } from "@/context/UserContext";
import { logout } from "@/app/login/actions";

const ADMIN_SECTIONS = [
  { id: "about", label: "Sobre mí" },
  { id: "experience", label: "Experiencia" },
  { id: "skills", label: "Habilidades" },
  { id: "services", label: "Servicios" },
  { id: "projects", label: "Proyectos" },
  { id: "academia", label: "Formación" },
  { id: "contact", label: "Contacto" },
];

const AdminMenu = ({ iconOnly = false }: { iconOnly?: boolean }) => {
  const { usuario, setUsuario } = useUsuario();
  if (!usuario) return null;

  const loggedOut = () => {
    logout();
    setUsuario(false);
  };

  return (
    <DropdownMenu>
      {iconOnly ? (
        <DropdownMenuTrigger
          aria-label="Menú de administración"
          className="rounded-full p-2 text-muted-foreground transition hover:bg-accent hover:text-primary"
        >
          <Menu />
        </DropdownMenuTrigger>
      ) : (
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            <UserRound /> Admin <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
      )}
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Administración</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            <LayoutDashboard /> Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Secciones editables</DropdownMenuLabel>
        {ADMIN_SECTIONS.map((s) => (
          <DropdownMenuItem key={s.id} asChild>
            <a href={`/#${s.id}`}>{s.label}</a>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={loggedOut}>
          <LogOut /> Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AdminMenu;
