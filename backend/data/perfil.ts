import repository from "@/backend/repository";

export type Perfil = {
  id: number;
  nombre: string | null;
  rol: string | null;
  alias: string | null;
  resumen: string | null;
  cvUrl: string | null;
  descripcion: string | null;
  experiencia: string | null;
  clientes: string | null;
  proyectos: string | null;
  telefono: string | null;
};

export async function getPerfil(): Promise<Perfil | null> {
  const rows = await repository.getAllDataRepository("perfil");
  return (rows[0] as Perfil | undefined) ?? null;
}
