import repository from "@/backend/repository";

export type Contacto = {
  id: number;
  nombre: string | null;
  titulo: string | null;
  link: string | null;
  icono: string | null;
  estado: boolean | null;
};

export async function getContactos(): Promise<Contacto[]> {
  const rows = (await repository.getAllDataRepository("contacto")) as Contacto[];
  return rows.sort((a, b) => a.id - b.id);
}
