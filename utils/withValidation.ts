import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

// type Handler = (
//   req: NextRequest,
//   ctx: { params: unknown; validated?: { body?: unknown; query?: unknown } }
// ) => Promise<Response>;

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

type WithValidationHandler = (
  req: NextRequest,
  ctx: {
    params: { [key: string]: string };
    validated?: {
      query?: unknown;
      body?: unknown;
      params?: unknown;
    };
  }
) => Promise<Response>;

export function withValidation(
  handler: WithValidationHandler,
  schemasByMethod: MethodSchemas
): (req: NextRequest, ctx: { params: { [key: string]: string } }) => Promise<Response> {
  return async (req, ctx) => {
    const method = req.method.toUpperCase();
    const schemas = schemasByMethod[method];
    const validated: Record<string, unknown> = {};

    if (!schemas) return handler(req, ctx);

    try {
      const params = ctx.params;

      // Validate params
      if (schemas.params && params) {
        const result = schemas.params.safeParse(params);
        if (!result.success) {
          return NextResponse.json(
            { error: "Parámetros inválidos", issues: result.error.format() },
            { status: 400 }
          );
        }
        validated.params = result.data;
      }

      // Validate query
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
        validated.query = result.data;
      }

      // Validate body
      if (schemas.body && method !== "GET") {
        const contentType = req.headers.get("content-type");

        if (!contentType?.includes("multipart/form-data")) {
          const rawBody = await req.json();
          const dynamicSchema = typeof schemas.body === "function"
            ? schemas.body({ query: validated.query, params: validated.params })
            : schemas.body;

          const result = await dynamicSchema?.safeParseAsync(rawBody);
          if (!result?.success) {
            return NextResponse.json(
              { error: "Body inválido", issues: result?.error.format() },
              { status: 400 }
            );
          }
          validated.body = result.data;
        }
      }

      return handler(req, { ...ctx, validated });
    } catch (err) {
      console.error("Error en validación:", err);
      return NextResponse.json(
        { error: "Error interno en validación" },
        { status: 500 }
      );
    }
  };
}
