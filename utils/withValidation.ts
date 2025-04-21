import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

// type Handler = (
//   req: NextRequest,
//   ctx: { params: unknown; validated?: { body?: unknown; query?: unknown } }
// ) => Promise<Response>;

// type DynamicSchemaSet = {
//   params?: z.ZodTypeAny;
//   query?: z.ZodTypeAny;
//   body?: (ctx: {
//     query?: unknown;
//     params?: unknown;
//   }) => z.ZodTypeAny | undefined; // puede depender de query o params
// };

// type MethodSchemas = {
//   [method: string]: DynamicSchemaSet;
// };

type WithValidationHandler = (
  req: NextRequest,
  ctx: {
    params: Record<string, string>;
    validated?: {
      query?: unknown;
      body?: unknown;
      params?: unknown;
    };
  }
) => Promise<Response>;

type Schemas = {
  params?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  body?: z.ZodTypeAny | ((ctx: { query?: unknown; params?: unknown }) => z.ZodTypeAny);
};

export function withValidation(
  handler: WithValidationHandler,
  methodSchemas: Record<string, Schemas>
  // schemasByMethod: MethodSchemas
): (
  req: NextRequest,
  ctx: { params: Record<string, string>, validated: { body?: unknown; query?: unknown } }
) => Promise<Response> {
  return async (req, ctx) => {
    const method = req.method.toUpperCase();
    const schemas = methodSchemas[method];
    const validated: Record<string, unknown> = {};

    const params = await ctx.params || {};

    if (!schemas) return handler(req, { ...ctx, params });

    try {
      // Validación de parámetros (params)
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

      // Validación de query
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

      // Validación de body
      if (schemas.body && method !== "GET") {
        const contentType = req.headers.get("content-type");

        if (!contentType?.includes("multipart/form-data")) {
          const rawBody = await req.json();
          const dynamicSchema =
            typeof schemas.body === "function"
              ? schemas.body({
                  query: validated.query,
                  params: validated.params,
                })
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

      return handler(req, { params, validated });
    } catch (err) {
      console.error("Error en validación:", err);
      return NextResponse.json(
        { error: "Error interno en validación" },
        { status: 500 }
      );
    }
  };
}