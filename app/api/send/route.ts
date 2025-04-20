import { Resend } from "resend";
import { EmailTemplate } from "@/components/pages/templates/emailTemplate";

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
  
    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
