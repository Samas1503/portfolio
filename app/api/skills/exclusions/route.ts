import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getExcludedSkillIds,
  setSkillExcluida,
} from "@/backend/Services/skillsSync.service";

const bodySchema = z.object({
  id: z.number().int(),
  excluida: z.boolean(),
});

// IDs de skills excluidas del cálculo automático (público, no es sensible).
export const GET = async () => {
  const ids = await getExcludedSkillIds();
  return NextResponse.json([...ids]);
};

export const POST = async (req: Request) => {
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success)
      return NextResponse.json({ error: "Body inválido" }, { status: 400 });
    await setSkillExcluida(parsed.data.id, parsed.data.excluida);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.log("Error en /api/skills/exclusions:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar la exclusión" },
      { status: 500 }
    );
  }
};
