ALTER TABLE "Proyectos" ADD COLUMN IF NOT EXISTS "categoria" text;
ALTER TABLE "Proyectos" ADD COLUMN IF NOT EXISTS "tags" text[] NOT NULL DEFAULT '{}';
