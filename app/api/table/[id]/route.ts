// app/api/table/[id]/route.ts
import { NextResponse } from "next/server";
import { commonParams, commonQuery } from "@/utils/schemasRequest";
import { SchemaKeys, schemas } from "@/backend/data/schemas";
import { serializeData } from "@/utils/serialize";
import { withValidation } from "@/utils/withValidation";
import services from "@/backend/Services";

// GET
export const GET = withValidation(
  async (req, { params }) => {
    const tipo = req.nextUrl.searchParams.get("tipo") as SchemaKeys;
    const data = await services.getDataByIdService(params.id, tipo);
    if (!data)
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json(serializeData(data));
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
    const tipo = req.nextUrl.searchParams.get("tipo") as SchemaKeys;
    const body = ctx.validated?.body as object;
    const updated = await services.updateDataService(params.id, body, tipo);
    return NextResponse.json(serializeData(updated));
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
  async (req, { params }) => {
    const tipo = req.nextUrl.searchParams.get("tipo") as SchemaKeys;
    const deleted = await services.deleteDataByIdService(params.id, tipo);
    if (!deleted)
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json(serializeData(deleted));
  },
  {
    DELETE: {
      params: commonParams,
      query: commonQuery,
    },
  }
);
