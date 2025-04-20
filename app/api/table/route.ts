// app/api/table/route.ts
import { NextResponse } from "next/server";
import services from "@/backend/Services";
import { SchemaKeys, schemas } from "@/backend/data/schemas";
import { withValidation } from "@/utils/withValidation";
import { serializeData } from "@/utils/serialize";
import { commonParams, commonQuery } from "@/utils/schemasRequest";

// GET
export const GET = withValidation(
  async (req) => {
    const tipo = req.nextUrl.searchParams.get("tipo") as SchemaKeys;
    const data = await services.getAllDataService(tipo);
    return NextResponse.json(serializeData(data));
  },
  {
    GET: {
      params: commonParams,
    },
  }
);

// POST
export const POST = withValidation(
  async (req, ctx) => {
    const tipo = req.nextUrl.searchParams.get("tipo") as SchemaKeys;
    const body = ctx.validated?.body as object;
    const data = await services.postDataService(body, tipo);
    return NextResponse.json(serializeData(data));
  },
  {
    POST: {
      query: commonQuery,
      body: ({ query }) => {
        const tipo = (query as Record<string, unknown>)?.tipo as SchemaKeys;
        return schemas[tipo].create;
      },
    },
  }
);
