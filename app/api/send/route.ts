import { Resend } from "resend";
import { EmailTemplate } from "@/components/pages/templates/emailTemplate";
import { serializeData } from "@/utils/serialize";
import { getSupabase } from "@/backend/db/supabase";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const dataForm = await req.json();
    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: "samueleliasparedes.10@gmail.com",
      subject: "Hola!",
      replyTo: dataForm.email || "",
      react: await EmailTemplate({
        username: dataForm.username,
        email: dataForm.email,
        message: dataForm.message,
      }),
      text: dataForm.message
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    // Guardar el mensaje y registrar la interacción para el dashboard.
    const supabase = getSupabase();
    await Promise.all([
      supabase.from("Mensajes").insert({
        nombre: dataForm.username || "",
        origen: dataForm.email || "",
        mensaje: dataForm.message || "",
      }),
      supabase.from("Interacciones").insert({
        tipo: "contacto",
        detalle: dataForm.email || "",
      }),
    ]);

    return Response.json(serializeData(data),{
      status: 200,
      headers: new Headers({
        "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_FRONTEND_URL || "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      }),
    });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
