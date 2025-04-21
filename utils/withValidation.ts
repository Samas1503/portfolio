import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

// type Handler = (
//   req: NextRequest,
//   ctx: { params: unknown; validated?: { body?: unknown; query?: unknown } }
// ) => Promise<Response>;

type Handler<
  P = unknown,
  Q = unknown,
  B = unknown
> = (
  req: NextRequest,
  ctx: {
    params: P;
    validated?: {
      query?: Q;
      body?: B;
    };
  }
) => Promise<Response>;

type DynamicSchemaSet = {
  params?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  body?: (ctx: {
    query?: unknown;
    params?: unknown;
  }) => z.ZodTypeAny | undefined; // puede depender de query o params
};

type MethodSchemas = {
  [method: string]: DynamicSchemaSet;
};

export function withValidation(
  handler: Handler,
  schemasByMethod: MethodSchemas
): Handler {
  return async (req, ctx) => {
    const method = req.method.toUpperCase();
    const schemas = schemasByMethod[method];

    if (!schemas) return handler(req, ctx);

    try {
      const resolvedParams = await ctx.params;
      if (schemas.params && resolvedParams) {
        if (typeof ctx.params !== "object" || ctx.params === null) {
          return NextResponse.json(
            { error: "params no es un objeto válido" },
            { status: 400 }
          );
        }
        const result = schemas.params.safeParse(resolvedParams);
        if (!result.success) {
          console.log("Errores de validación:", result.error.format());
          return NextResponse.json(
            { error: "Parámetros inválidos", issues: result.error.format() },
            { status: 400 }
          );
        }
        ctx.params = result.data;
      }

      if (schemas.query) {
        const queryObj: Record<string, string> = {};
        req.nextUrl.searchParams.forEach((value, key) => {
          queryObj[key] = value;
        });
        const result = await schemas.query.safeParseAsync(queryObj);
        if (!result.success) {
          return NextResponse.json(
            { error: "Query inválido", issues: result.error.format() },
            { status: 400 }
          );
        }
        ctx.validated = { ...(ctx.validated || {}), query: result.data };
      }

      if (schemas.body && method !== "GET") {
        const contentType = req.headers.get("content-type");
        
        if (contentType?.includes("multipart/form-data")) {
          // Dejar que el handler lo maneje
          return handler(req, ctx);
        }
      
        const rawBody = await req.json(); // ← solo si NO es multipart
        const dynamicSchema = typeof schemas.body === "function"
          ? schemas.body({ query: ctx.validated?.query, params: ctx.params })
          : schemas.body;
      
        if (!dynamicSchema) {
          return NextResponse.json({ error: "No se pudo determinar el schema del body" }, { status: 400 });
        }
      
        const result = await dynamicSchema.safeParseAsync(rawBody);
        if (!result.success) {
          return NextResponse.json({ error: "Body inválido", issues: result.error.format() }, { status: 400 });
        }
      
        ctx.validated = { ...(ctx.validated || {}), body: result.data };
      }
      

      return handler(req, ctx);
    } catch (err) {
      console.error("Error en validación:", err);
      return NextResponse.json(
        { error: "Error interno en validación" },
        { status: 500 }
      );
    }
  };
}
