import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   host: process.env.NEXT_PUBLIC_ELASTIC_HOST,
//   port: Number(process.env.NEXT_PUBLIC_ELASTIC_PORT),
//   auth: {
//     user: process.env.NEXT_PUBLIC_ELASTIC_SMTP_EMAIL,
//     pass: process.env.NEXT_PUBLIC_ELASTIC_SMTP_KEY,
//   },
// });

// export async function POST(req: Request) {
//   try {
//     const dataForm = await req.json();
//     try {
//       const data = await transporter.sendMail({
//         subject: "Hola!",
//         from: `"Portfolio personal" contacto@samasdev.com`,
//         replyTo: dataForm.email,
//         to: "samueleliasparedes.10@gmail.com",
//         html: `<div style={{ fontFamily: "Arial, sans-serif", lineHeight: "1.5" }}>
//           <h2>Nuevo mensaje de contacto</h2>
//           <p><strong>Nombre:</strong> ${dataForm.username}</p>
//           <p><strong>Email:</strong> ${dataForm.email}</p>
//           <p><strong>Mensaje:</strong></p>
//           <p>${dataForm.message}</p>
//           </div>`,
//       });
//       return Response.json(data);
//     } catch (error) {
//       return Response.json({ error });
//     }
//   } catch (error) {
//     return Response.json({ error });
//   }
// }


export async function POST(req: Request) {
  try {
    const dataForm = await req.json();
    try {
      const data = await fetch("https://api.elasticemail.com/v2/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          apikey: process.env.NEXT_PUBLIC_ELASTIC_API_KEY || "",
          subject: "Hola!",
          from: "contacto@samasdev.com",
          replyTo: dataForm.email || "",
          to: "samueleliasparedes.10@gmail.com",
          html: `<div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <h2>Nuevo mensaje de contacto</h2>
            <p><strong>Nombre:</strong> ${dataForm.username || ""}</p>
            <p><strong>Email:</strong> ${dataForm.email || ""}</p>
            <p><strong>Mensaje:</strong></p>
            <p>${dataForm.message || ""}</p>
            </div>`,
        }),
      });
      console.log(await data.json());
      
      return Response.json(data);
    } catch (error) {
      return Response.json({ error });
    }
  } catch (error) {
    return Response.json({ error });
  }
}
