# AGENTS.md — Portfolio Samuel Paredes

Guía para agentes de IA que trabajen en este repositorio. Leé también `GLOSARY.md`
para el vocabulario del dominio y `README.md` para la descripción funcional.

## Qué es este proyecto

Portfolio personal (deployado en `cv.samas-server.com`) con un panel de
administración embebido: tras hacer login en `/login`, el dueño puede crear,
editar y eliminar el contenido de cada sección (proyectos, skills, experiencia,
servicios, contactos, perfil/CV) sin redesplegar. Es **single-admin**: no hay
tabla de usuarios, las credenciales salen de `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript estricto (`strict: true`)
- Node **24.x** (`engines` en `package.json`)
- Base de datos: Supabase (Postgres) vía `@supabase/supabase-js`, service role key
- Validación: Zod + React Hook Form (`@hookform/resolvers`)
- UI: Tailwind CSS v4, Radix UI / shadcn (estilo `new-york`), `next-themes`,
  Embla, `@react-google-maps/api`, Three.js (`@react-three/fiber`)
- Media: Cloudinary (imágenes), Supabase Storage bucket `portfolio` (PDF del CV)
- Email: Resend + `@react-email/render`
- Path alias: `@/*` → `./*` (la raíz del repo, no `./src`)

## Comandos

```bash
npm install
npm run dev     # http://localhost:3000 (turbopack)
npm run lint    # next lint
npm run build   # next build
```

No hay tests configurados. Para verificar un cambio: `npm run lint` y
`npm run build`. Ojo: `next.config.ts` tiene `eslint.ignoreDuringBuilds: true`,
así que el build puede pasar con errores de lint — corré `npm run lint` aparte.

## Variables de entorno

Copiá `.env.example` a `.env.local`. Son obligatorias para que arranque:
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`,
`ADMIN_EMAIL`, `ADMIN_PASSWORD`, y las de Cloudinary si usás uploads.
Nunca commitees `.env*` ni expongas `SUPABASE_SERVICE_ROLE_KEY` al cliente.

## Arquitectura

```
HTTP request
  → middleware.ts                    # auth: JWT cookie "session" (jose, HS256)
  → app/api/*/route.ts               # Route Handlers, envueltos en withValidation
  → backend/Services/                # lógica de negocio (get/post/update/delete)
  → backend/repository/              # queries a Supabase
  → backend/db/supabase.ts           # cliente singleton (SERVER ONLY)
```

- **`backend/data/schemas.ts` es la fuente de verdad.** El objeto `schemas`
  mapea cada `tipo` de la API (`project`, `skills`, `servicios`, `experience`,
  `perfil`, `contacto`, `mensajes`) a su tabla de Postgres, su query `select`,
  el mapeo camelCase→snake_case (`toColumns`) y el schema Zod `create`/`update`.
  Para agregar o cambiar una tabla se empieza acá, en `defineTable(...)`.
- **API genérica:** `GET/POST /api/table?tipo=<key>` y
  `GET/PATCH/DELETE /api/table/[id]?tipo=<key>` sirven todas las tablas.
  `withValidation(req, ctx)` valida params/query/body con Zod por método.
- **Auth:** `app/lib/session.ts` firma un JWT (1 h). Middleware: GETs son
  públicos; POST/PATCH/DELETE a `/api/table` y `/api/cv` exigen sesión.
  El cliente usa `apiFetch` (`components/pages/fetch/tech-all.tsx`) con
  same-origin fetch para mandar la cookie. La cookie `usuario` (no httpOnly)
  solo es un flag de UI; la autorización real es la cookie `session` httpOnly.
- **Admin UI:** `ModalTriggerButton` + `DynamicForm` renderizan formularios de
  alta/edición a partir de `components/pages/forms/formsData.tsx`, que define un
  schema Zod + `fields` por formulario. Solo se muestran si `useUsuario()` es true.
- **Datos del lado servidor:** `backend/data/perfil.ts` y `contactos.ts` son
  helpers que usan el repository directamente desde Server Components
  (`app/page.tsx` los usa con `force-dynamic`).

## Convenciones

- **Idioma:** el código mezcla español e inglés. Las tablas de la DB están en
  español y capitalizadas (`Proyectos`, `Experiencia`); la API expone keys
  camelCase en inglés (`urlGithub` → `url_github`) vía el parámetro `columns`
  de `defineTable`. Respetá ese patrón al agregar campos.
- **Errores:** los services/repositories existentes hacen `console.log` del error
  y devuelven `undefined` en vez de lanzar. Seguí el estilo del código vecino,
  pero en código nuevo preferí devolver errores útiles al cliente.
- **Serialización:** toda respuesta de la API pasa por `serializeData`
  (convierte `bigint` a string, p. ej. `nroReferencia`).
- **Componentes:** server components por defecto; `"use client"` solo donde haga
  falta (formularios, contexto, mapas, Three.js). Estilo shadcn: componentes en
  `components/ui`, helper `cn()` en `lib/utils.ts`.
- **Commits:** estilo del historial — mensajes imperativos en inglés
  ("Make the contact links editable...", "Add project description...").
- **Imports:** usá el alias `@/` siempre.

## Reglas importantes (no romper)

1. **`backend/db/supabase.ts` es server-only.** Usa la service role key que
   bypasea RLS — nunca lo importes desde un componente cliente.
2. Las tablas tienen **RLS habilitado sin policies**: solo se llega con service
   role. No crees un cliente Supabase con la anon key esperando que funcione.
3. Al cambiar el schema de la DB: agregá una migración en
   `supabase/migrations/`, actualizá `schemas.ts` (y `formsData.tsx` si se edita
   desde el admin) y regenerá los tipos:
   `npx supabase gen types typescript --project-id ahjufrjambuzlxraavky > backend/db/database.types.ts`
4. No subas secretos al repo ni los loguees.
5. `vercel.json` expone CORS `*` en `/api/*` — no confíes en CORS como control
   de acceso; la seguridad real está en el middleware.

## Trampas conocidas (gotchas)

- `withValidation` **no valida el body en `multipart/form-data`** (solo JSON).
  El POST con archivo se salta la validación Zod y arma el body a mano en
  `app/api/table/route.ts`.
- Las imágenes de proyectos se guardan como `uploads/<hex>-<timestamp>`
  (public_id de Cloudinary); `getFileData` en `getData.service.tsx` decide si
  generar URL según ese prefijo.
- `DynamicForm` manda `FormData` si el form tiene un campo `type: "file"`;
  si no, JSON. `tags` viaja como string separado por comas y `parseTags` lo
  convierte a array.
- `middleware.ts` solo protege rutas que matchean `protectedRoutes`/`isMutatingApi`;
  el resto de `/api/*` (p. ej. `/api/send`) es público.
- Vercel tiene límite de ~4.5 MB en el body de serverless functions — por eso el
  PDF del CV se limita a 4 MB (`app/api/cv/route.ts`) y las imágenes van a
  Cloudinary, no a Supabase Storage.

## Deploy

Vercel, proyecto `portfolio-paredes-samuel`, dominio `cv.samas-server.com`.
Las env vars se inyectan por la integración de Supabase + dashboard de Vercel.
