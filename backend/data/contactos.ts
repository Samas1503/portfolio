import repository from "@/backend/repository";

export type Contacto = {
  id: number;
  nombre: string | null;
  titulo: string | null;
  link: string | null;
  icono: string | null;
  estado: boolean | null;
  orden: number | null;
};

export async function getContactos(): Promise<Contacto[]> {
  const rows = (await repository.getAllDataRepository("contacto")) as Contacto[];
  return rows.sort(
    (a, b) => (a.orden ?? Number.MAX_SAFE_INTEGER) - (b.orden ?? Number.MAX_SAFE_INTEGER) || a.id - b.id
  );
}
