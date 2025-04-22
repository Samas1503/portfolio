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
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_APY_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_APY_SECRET,
});

async function uploadImageCloudinary(image: string, image_id: string) {
  const data = await cloudinary.uploader
    .upload(image, {
      folder: "uploads",
      public_id: image_id,
    })
    .catch((error) => {
      console.log("ERROOOOOR", error);
    });
  return data;
}

// GET
export const GET = withValidation(
  async (req) => {
    try {
      const tipo = req.nextUrl.searchParams.get("tipo") as SchemaKeys;
      const data = await services.getAllDataService(tipo);
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
    },
  }
);

// POST
export const POST = withValidation(
  async (req, ctx) => {
    try {
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
          
          const uploadDir = path.join(process.cwd(), "tmp");
          
          if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
          }

          const extension = path.extname(file.name);
          const baseName = path.basename(file.name, extension);
          const uniqueName = `${baseName}-${Date.now()}`;
          const filePath = path.join(uploadDir, uniqueName);
          await writeFile(filePath, buffer);

          const cloudinaryImage = await uploadImageCloudinary(filePath, uniqueName)

          uploadedFileInfo = {
            name: cloudinaryImage?.public_id || "",
            type: file.type,
            // name: file.name,
            // savedAs: uniqueName,
            // size: file.size,
            // path: `/uploads/${uniqueName}`,
          };
        }
      }

      const body = contentType?.includes("multipart/form-data")
        ? {
            ...formFields,
            [String(uploadedFileInfo?.type.split("/")[0] || "")]:
              uploadedFileInfo?.name,
          }
        : (ctx.validated?.body as object);

      const data = await services.postDataService(body, tipo);

      const origin = req.headers.get("origin");
      return NextResponse.json(serializeData(data), {
        status: 200,
        headers: new Headers({
          "Access-Control-Allow-Origin": origin || "*",
          "Access-Control-Allow-Methods": "POST",
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
    POST: {
      query: commonQuery,
      body: ({ query }) => {
        const tipo = (query as Record<string, unknown>)?.tipo as SchemaKeys;
        return schemas[tipo].create;
      },
    },
  }
);
