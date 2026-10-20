import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { decrypt } from "@/app/lib/session";
import { getSupabase } from "@/backend/db/supabase";
import { hashPassword } from "@/app/lib/password";

async function requireSession() {
  const cookie = (await cookies()).get("session")?.value;
  const session = cookie ? await decrypt(cookie) : null;
  return session?.userId ? session : null;
}

export async function GET() {
  if (!(await requireSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const supabase = getSupabase();
  const [visitas, interacciones, mensajes] = await Promise.all([
    supabase.from("Visitas").select("path,created_at").order("created_at", { ascending: false }).limit(500),
    supabase.from("Interacciones").select("tipo,detalle,path,created_at").order("created_at", { ascending: false }).limit(50),
    supabase.from("Mensajes").select("*").order("id", { ascending: false }).limit(50),
  ]);

  return NextResponse.json({
    visitas: visitas.data ?? [],
    interacciones: interacciones.data ?? [],
    mensajes: mensajes.data ?? [],
  });
}

const passwordSchema = z.object({
  actual: z.string().min(1),
  nueva: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const parsed = passwordSchema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "La contraseña nueva debe tener al menos 8 caracteres" },
      { status: 400 }
    );

  const supabase = getSupabase();
  const { data: user } = await supabase
    .from("Usuarios")
    .select("id,password_hash")
    .eq("id", Number(session.userId))
    .maybeSingle();

  if (!user || user.password_hash !== hashPassword(parsed.data.actual))
    return NextResponse.json(
      { error: "La contraseña actual es incorrecta" },
      { status: 400 }
    );

  const { error } = await supabase
    .from("Usuarios")
    .update({ password_hash: hashPassword(parsed.data.nueva) })
    .eq("id", user.id);
  if (error)
    return NextResponse.json({ error: "No se pudo actualizar" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
