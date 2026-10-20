drop extension if exists "pg_net";

alter table "public"."Perfil" drop constraint "Perfil_pkey";

drop index if exists "public"."Perfil_pkey";

CREATE UNIQUE INDEX "SobreMi_pkey" ON public."Perfil" USING btree (id);

alter table "public"."Perfil" add constraint "SobreMi_pkey" PRIMARY KEY using index "SobreMi_pkey";


