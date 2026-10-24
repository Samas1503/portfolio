// app/api/table/[id]/route.ts
import { after, NextResponse } from "next/server";
import { commonParams, commonQuery } from "@/utils/schemasRequest";
import { SchemaKeys, schemas } from "@/backend/data/schemas";
import { serializeData } from "@/utils/serialize";
import { withValidation } from "@/utils/withValidation";
import services from "@/backend/Services";
import { syncSkillsFromProjects } from "@/backend/Services/skillsSync.service";
import cloudinary, {
  uploadImageCloudinaryFromFile,
} from "@/backend/cloudinary";
import { parseTags } from "@/utils/tags";

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
      const contentType = req.headers.get("content-type");

      let body = ctx.validated?.body as object;

      if (contentType?.includes("multipart/form-data")) {
        const formData = await req.formData();

        const file =
          formData.get("file") ||
          formData.get("image") ||
          formData.get("audio") ||
          formData.get("video");

        const formFields: Record<string, unknown> = {};
        for (const [key, value] of formData.entries()) {
          if (typeof value === "string") formFields[key] = value;
        }
        if (typeof formFields.tags === "string") {
          formFields.tags = parseTags(formFields.tags as string);
        }

        let uploadedFileInfo: { name: string; type: string } | null = null;
        if (file && file instanceof File) {
          const hexName = Buffer.from(file.name).toString("hex").slice(0, 16);
          const uniqueName = `${hexName}-${Date.now()}`;
          await uploadImageCloudinaryFromFile(file, uniqueName);
          uploadedFileInfo = {
            name: `uploads/${uniqueName}`,
            type: file.type,
          };
        }

        body = {
          ...formFields,
          ...(uploadedFileInfo
            ? {
                [uploadedFileInfo.type.split("/")[0]]: uploadedFileInfo.name,
              }
            : {}),
        };
      }

      const updated = await services.updateDataService(
        Number(params.id),
        body,
        tipo
      );

      if (tipo === "project") {
        after(() => syncSkillsFromProjects());
      }

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

      if (tipo === "project") {
        after(() => syncSkillsFromProjects());
      }

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
