// app/api/table/route.ts
import { NextResponse } from "next/server";
import services from "@/backend/Services";
import { SchemaKeys, schemas } from "@/backend/data/schemas";
import { withValidation } from "@/utils/withValidation";
import { serializeData } from "@/utils/serialize";
import { commonParams, commonQuery } from "@/utils/schemasRequest";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

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
    const contentType = req.headers.get("content-type");

    let uploadedFileInfo = null;
    // eslint-disable-next-line prefer-const, @typescript-eslint/no-explicit-any
    let formFields: Record<string, any> = {};

    if (contentType?.includes("multipart/form-data")) {
      const formData = await req.formData();

      // Extraer archivo
      const file =
        formData.get("file") ||
        formData.get("image") ||
        formData.get("audio") ||
        formData.get("video");

      // Extraer campos normales
      for (const [key, value] of formData.entries()) {
        if (typeof value === "string") {
          formFields[key] = value;
        }
      }

      if (file && file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadDir = path.join(process.cwd(), "public/uploads");
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true });
        }

        const extension = path.extname(file.name);
        const baseName = path.basename(file.name, extension);
        const uniqueName = `${baseName}-${Date.now()}${extension}`;
        const filePath = path.join(uploadDir, uniqueName);

        await writeFile(filePath, buffer);

        uploadedFileInfo = {
          name: file.name,
          savedAs: uniqueName,
          type: file.type,
          size: file.size,
          path: `/uploads/${uniqueName}`,
        };
      }
    }

    const body = contentType?.includes("multipart/form-data")
      ? {
          ...formFields,
          [String(uploadedFileInfo?.type.split("/")[0] || "")]: uploadedFileInfo?.path,
        }
      : (ctx.validated?.body as object);

    // console.log({
    //   body,
    //   file: uploadedFileInfo,
    // });

    const data = await services.postDataService(body, tipo);
    return NextResponse.json(data);
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
