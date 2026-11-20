ALTER TABLE "Perfil"
	ADD COLUMN "cv_titulo" text,
	ADD COLUMN "cv_resumen" text,
	ADD COLUMN "idiomas" text;

ALTER TABLE "Experiencia" ADD COLUMN "logros" text;

ALTER TABLE "Proyectos" ADD COLUMN "destacado" boolean DEFAULT false;
