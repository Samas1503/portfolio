import { after, NextResponse } from "next/server";
import services from "@/backend/Services";
import { syncSkillsFromProjects } from "@/backend/Services/skillsSync.service";
import { SchemaKeys, schemas } from "@/backend/data/schemas";
import { withValidation } from "@/utils/withValidation";
import { serializeData } from "@/utils/serialize";
import { commonParams, commonQuery } from "@/utils/schemasRequest";
import { uploadImageCloudinaryFromFile } from "@/backend/cloudinary";
import { parseTags } from "@/utils/tags";

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

        // Cualquier campo con un File cuenta como upload: el public_id se
        // guarda en la columna que lleva el nombre del campo (p. ej. "image",
        // "certificado"). La key genérica "file" mantiene el mapeo por
        // mime-type para no romper uploads anteriores.
        const fileEntry = Array.from(formData.entries()).find(
          ([, value]) => value instanceof File && value.size > 0
        ) as [string, File] | undefined;
        const file = fileEntry?.[1];

        for (const [key, value] of formData.entries()) {
          if (typeof value === "string") {
            formFields[key] = value;
          }
        }
        if (typeof formFields.tags === "string") {
          formFields.tags = parseTags(formFields.tags);
        }

        if (file) {
          const hexName = Buffer.from(file.name).toString("hex").slice(0, 16);
          const uniqueName = `${hexName}-${Date.now()}`;

          await uploadImageCloudinaryFromFile(file, uniqueName);

          uploadedFileInfo = {
            name: `uploads/${uniqueName}`,
            field:
              fileEntry && fileEntry[0] !== "file"
                ? fileEntry[0]
                : file.type.split("/")[0],
          };
        }
      }

      const body = contentType?.includes("multipart/form-data")
        ? {
            ...formFields,
            [String(uploadedFileInfo?.field || "")]: uploadedFileInfo?.name,
          }
        : (ctx.validated?.body as object);

      const data = await services.postDataService(body, tipo);

      if (tipo === "project") {
        after(() => syncSkillsFromProjects());
      }

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
