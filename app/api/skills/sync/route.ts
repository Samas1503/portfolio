import { NextResponse } from "next/server";
import { syncSkillsFromProjects } from "@/backend/Services/skillsSync.service";

// Recálculo manual (botón admin): fuerza refetch de los lenguajes de los repos.
export const POST = async () => {
  try {
    const result = await syncSkillsFromProjects({ force: true });
    return NextResponse.json(result ?? { updated: 0, added: [] });
  } catch (error) {
    console.log("Error en /api/skills/sync:", error);
    return NextResponse.json(
      { error: "No se pudo recalcular las habilidades" },
      { status: 500 }
    );
  }
};
