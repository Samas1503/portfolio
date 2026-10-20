import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabase } from "@/backend/db/supabase";

const trackSchema = z.object({
  tipo: z.enum(["visita", "click", "contacto"]),
  path: z.string().max(300).nullish(),
  detalle: z.string().max(300).nullish(),
  referrer: z.string().max(500).nullish(),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = trackSchema.safeParse(await req.json());
    if (!parsed.success)
      return NextResponse.json({ error: "Body inválido" }, { status: 400 });

    const { tipo, path, detalle, referrer } = parsed.data;
    const supabase = getSupabase();

    if (tipo === "visita") {
      await supabase
        .from("Visitas")
        .insert({ path: path ?? "/", referrer: referrer || null });
    } else {
      await supabase
        .from("Interacciones")
        .insert({ tipo, detalle: detalle || null, path: path ?? "/" });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.log("Error en /api/track:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
