import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/backend/db/supabase";

const BUCKET = "portfolio";
const MAX_BYTES = 4 * 1024 * 1024;
const PUBLIC_PREFIX = `/storage/v1/object/public/${BUCKET}/`;

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file");
  const id = Number(form.get("id"));

  if (!(file instanceof File) || file.type !== "application/pdf")
    return NextResponse.json({ error: "Subí un archivo PDF" }, { status: 400 });
  if (file.size > MAX_BYTES)
    return NextResponse.json({ error: "El PDF no puede superar 4 MB" }, { status: 400 });
  if (!Number.isInteger(id))
    return NextResponse.json({ error: "Perfil inválido" }, { status: 400 });

  const supabase = getSupabase();
  const { data: current } = await supabase
    .from("Perfil")
    .select("cv_url")
    .eq("id", id)
    .maybeSingle();

  const path = `cv/cv-${Date.now()}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: "application/pdf" });
  if (uploadError)
    return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const cvUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  const { error: updateError } = await supabase
    .from("Perfil")
    .update({ cv_url: cvUrl })
    .eq("id", id);
  if (updateError)
    return NextResponse.json({ error: updateError.message }, { status: 500 });

  const previous = current?.cv_url?.split(PUBLIC_PREFIX)[1];
  if (previous) await supabase.storage.from(BUCKET).remove([previous]);

  return NextResponse.json({ cvUrl });
}
