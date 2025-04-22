// app/api/table/[id]/route.ts
import { NextResponse } from "next/server";
import { commonParams, commonQuery } from "@/utils/schemasRequest";
import { SchemaKeys, schemas } from "@/backend/data/schemas";
import { serializeData } from "@/utils/serialize";
import { withValidation } from "@/utils/withValidation";
import services from "@/backend/Services";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_APY_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_APY_SECRET,
});

async function deleteImageCloudinary(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    throw error;
  }
}

// GET
export const GET = withValidation(
  async (req, ctx) => {
    try {
      const params = await ctx.params;
      const tipo = req.nextUrl.searchParams.get("tipo") as SchemaKeys;
      const data = await services.getDataByIdService(Number(params.id), tipo);
      if (!data)
        return NextResponse.json({ error: "No encontrado" }, { status: 404 });

      const origin = req.headers.get("origin");

      return NextResponse.json(serializeData(data), {
        status: 200,
        headers: new Headers({
          "Access-Control-Allow-Origin": origin || "*",
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

      const origin = req.headers.get("origin");

      return NextResponse.json(serializeData(updated), {
        status: 200,
        headers: new Headers({
          "Access-Control-Allow-Origin": origin || "*",
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
      const data = (await services.getDataByIdService(
        Number(params.id),
        tipo
      )) as { image?: string };
      if (!data)
        return NextResponse.json({ error: "No encontrado" }, { status: 404 });
      const deleted = await services.deleteDataByIdService(
        Number(params.id),
        tipo
      );
      if (tipo === "project") {
        if (data?.image) {
          await deleteImageCloudinary(data.image);
        }
      }
      if (!deleted)
        return NextResponse.json(
          { error: "Error al eliminar elemento" },
          { status: 404 }
        );

      const origin = req.headers.get("origin");

      return NextResponse.json(serializeData(deleted), {
        status: 200,
        headers: new Headers({
          "Access-Control-Allow-Origin": origin || "*",
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
