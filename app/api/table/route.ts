// app/api/table/route.ts
import { NextRequest } from "next/server";
import services from "@/backend/Services";
import { SchemaKeys } from "@/backend/data/schemas";

export async function GET(req: NextRequest) {
  const tipo = req.nextUrl.searchParams.get("tipo") as SchemaKeys;

  if (!tipo) {
    return new Response(JSON.stringify({ error: "tipo es requerido" }), { status: 400 });
  }

  try {
    const data = await services.getAllDataService(tipo);
    return Response.json(data);
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error al obtener los datos", error  }), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const tipo = req.nextUrl.searchParams.get("tipo") as SchemaKeys;

  if (!tipo) {
    return new Response(JSON.stringify({ error: "tipo es requerido" }), { status: 400 });
  }

  try {
    const body = await req.json();
    const data = await services.postDataService(body, tipo);
    return Response.json(data);
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error al guardar los datos", error  }), { status: 500 });
  }
}
