// app/api/table/[id]/route.ts
import { NextResponse } from "next/server";
import { commonParams, commonQuery } from "@/utils/schemasRequest";
import { SchemaKeys, schemas } from "@/backend/data/schemas";
import { serializeData } from "@/utils/serialize";
import { withValidation } from "@/utils/withValidation";
import services from "@/backend/Services";

// GET
export const GET = withValidation(
  async (req, ctx) => {
    try {
      const params = await ctx.params;
      const tipo = req.nextUrl.searchParams.get("tipo") as SchemaKeys;
      const data = await services.getDataByIdService(Number(params.id), tipo);
      if (!data)
        return NextResponse.json({ error: "No encontrado" }, { status: 404 });
      return NextResponse.json(serializeData(data), {
        status: 200,
        headers: new Headers({
          "Access-Control-Allow-Origin":
            process.env.NEXT_PUBLIC_FRONTEND_URL || "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }),
      });
    } catch (error) {
      return NextResponse.json(error, {
        status: 500,
      });
    }
  },
  {
    GET: {
      params: commonParams,
      query: commonQuery,
    },
  }
);

// PATCH
export const PATCH = withValidation(
  async (req, ctx) => {
    try {
      const params = await ctx.params;
      const tipo = req.nextUrl.searchParams.get("tipo") as SchemaKeys;
      const body = ctx.validated?.body as object;
      const updated = await services.updateDataService(
        Number(params.id),
        body,
        tipo
      );
      return NextResponse.json(serializeData(updated), {
        status: 200,
        headers: new Headers({
          "Access-Control-Allow-Origin":
            process.env.NEXT_PUBLIC_FRONTEND_URL || "*",
          "Access-Control-Allow-Methods": "PATCH",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }),
      });
    } catch (error) {
      return NextResponse.json(error, {
        status: 500,
      });
    }
  },
  {
    PATCH: {
      params: commonParams,
      query: commonQuery,
      body: ({ query }) => {
        const tipo = (query as Record<string, unknown>)?.tipo as SchemaKeys;
        return schemas[tipo].create;
      },
    },
  }
);

// PATCH
export const DELETE = withValidation(
  async (req, ctx) => {
    try {
      const params = await ctx.params;
      const tipo = req.nextUrl.searchParams.get("tipo") as SchemaKeys;
      const deleted = await services.deleteDataByIdService(
        Number(params.id),
        tipo
      );
      if (!deleted)
        return NextResponse.json({ error: "No encontrado" }, { status: 404 });
      return NextResponse.json(serializeData(deleted), {
        status: 200,
        headers: new Headers({
          "Access-Control-Allow-Origin":
            process.env.NEXT_PUBLIC_FRONTEND_URL || "*",
          "Access-Control-Allow-Methods": "DELETE",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }),
      });
    } catch (error) {
      return NextResponse.json(error, {
        status: 500,
      });
    }
  },
  {
    DELETE: {
      params: commonParams,
      query: commonQuery,
    },
  }
);
